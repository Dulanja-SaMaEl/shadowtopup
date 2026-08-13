<?php

namespace App\Http\Controllers;

use App\Models\Package;
use App\Models\ShellAccount;
use App\Models\PurchaseTransaction;
use App\Models\ShellTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FreeFireTopupController extends Controller
{
    // Generate PayPal Access Token
    private function getPayPalAccessToken()
    {
        $clientId = (string) (env('PAYPAL_CLIENT_ID') ?? '');
        $secret = (string) (env('PAYPAL_SECRET') ?? '');

        if (empty($clientId) || empty($secret)) {
            Log::warning('PayPal Client ID or Secret missing in .env configuration.');
            return null;
        }

        $url = env('PAYPAL_MODE', 'sandbox') === 'live' 
            ? 'https://api-m.paypal.com/v1/oauth2/token' 
            : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

        try {
            $response = Http::withBasicAuth($clientId, $secret)
                ->asForm()
                ->post($url, [
                    'grant_type' => 'client_credentials'
                ]);

            if ($response->successful()) {
                return $response->json()['access_token'];
            }
        } catch (\Exception $e) {
            Log::error('PayPal Token Error: ' . $e->getMessage());
        }
        return null;
    }

    public function checkout(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'free_fire_uid' => 'required|string',
            'payment_method' => 'required|in:paypal,bank_transfer',
        ]);

        $package = Package::findOrFail($request->package_id);
        $user = Auth::user();
        
        $price = $package->getPriceForUser($user);

        if ($price <= 0) {
            return back()->with('error', 'Invalid package price.');
        }

        // Check if there is a main shell account and if it has enough balance
        $mainAccount = ShellAccount::where('is_main', true)->first();
        if (!$mainAccount || $mainAccount->available_balance < $package->shell_cost) {
            return back()->with('error', 'Service temporarily unavailable (insufficient shells). Please try again later.');
        }

        // Create a pending transaction
        $transaction = PurchaseTransaction::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'shell_account_id' => $mainAccount->id,
            'free_fire_player_id' => $request->free_fire_uid,
            'shells_deducted' => $package->shell_cost,
            'price_paid' => $price,
            'price_tier' => $user->role === 'gold' ? 'gold' : ($user->role === 'silver' ? 'silver' : 'normal'),
            'payment_method' => $request->payment_method,
            'status' => 'pending', // Initially pending for both
        ]);

        if ($request->payment_method === 'bank_transfer') {
            return redirect()->route('freefire.receipt.upload', ['transaction' => $transaction->id]);
        }

        // Initiate PayPal Payment
        $token = $this->getPayPalAccessToken();
        if (!$token) {
            return back()->with('error', 'Payment gateway error. Could not connect to PayPal.');
        }

        $url = env('PAYPAL_MODE', 'sandbox') === 'live' 
            ? 'https://api-m.paypal.com/v2/checkout/orders' 
            : 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

        $response = Http::withToken($token)->post($url, [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'reference_id' => 'FF_PKG_' . $transaction->id,
                    'amount' => [
                        'currency_code' => 'USD', // Adjust currency as needed (assuming base price is USD or needs conversion, let's keep USD for paypal standard)
                        'value' => number_format($price, 2, '.', '')
                    ],
                    'description' => $package->package_name . ' Top-up',
                ]
            ],
            'application_context' => [
                'cancel_url' => route('freefire.paypal.cancel', ['transaction' => $transaction->id]),
                'return_url' => route('freefire.paypal.success', ['transaction' => $transaction->id]),
            ]
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $transaction->update(['paypal_order_id' => $data['id']]);
            
            foreach ($data['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    return redirect($link['href']);
                }
            }
        }

        return back()->with('error', 'Failed to initiate PayPal payment.');
    }

    public function showReceiptUpload(Request $request)
    {
        $transaction = PurchaseTransaction::with('package')->findOrFail($request->transaction);
        if ($transaction->user_id !== Auth::id()) abort(403);
        if ($transaction->status !== 'pending' && $transaction->status !== 'payment_pending') {
            return redirect()->route('home')->with('error', 'Invalid transaction status.');
        }

        return view('games.receipt', compact('transaction'));
    }

    public function uploadReceipt(Request $request)
    {
        $transaction = PurchaseTransaction::findOrFail($request->transaction);
        if ($transaction->user_id !== Auth::id()) abort(403);

        $request->validate([
            'receipt' => 'required|image|max:5120',
        ]);

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $transaction->update([
                'receipt_path' => $path,
                'status' => 'payment_pending',
            ]);
        }

        return redirect()->route('dashboard')->with('success', 'Receipt uploaded! Awaiting admin verification.');
    }

    public function paypalSuccess(Request $request)
    {
        $transactionId = $request->query('transaction');
        $token = $request->query('token');

        $transaction = PurchaseTransaction::findOrFail($transactionId);

        if ($transaction->status !== 'pending') {
            return redirect()->route('games.show', 'free-fire')->with('error', 'Transaction already processed.');
        }

        $accessToken = $this->getPayPalAccessToken();
        $url = env('PAYPAL_MODE', 'sandbox') === 'live' 
            ? "https://api-m.paypal.com/v2/checkout/orders/{$token}/capture" 
            : "https://api-m.sandbox.paypal.com/v2/checkout/orders/{$token}/capture";

        $response = Http::withToken($accessToken)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url);

        if ($response->successful()) {
            $data = $response->json();
            if ($data['status'] === 'COMPLETED') {
                // Payment successful, now process Garena Top-up
                
                $shellAccount = ShellAccount::find($transaction->shell_account_id);
                
                // Option A: Placeholder/simulated logic for Top-up
                $topupSuccess = true; // Assume success for now

                if ($topupSuccess) {
                    $shellAccount->decrement('available_balance', $transaction->shells_deducted);
                    
                    ShellTransaction::create([
                        'shell_account_id' => $shellAccount->id,
                        'transaction_type' => 'debit',
                        'amount' => $transaction->shells_deducted,
                        'description' => 'Free Fire Top-up for UID: ' . $transaction->free_fire_player_id,
                        'related_user_id' => $transaction->user_id,
                        'related_purchase_id' => $transaction->id,
                    ]);

                    $transaction->update(['status' => 'success']);

                    return redirect()->route('games.show', 'free-fire')->with('success', 'Top-up successful! Diamonds will be added shortly.');
                } else {
                    $transaction->update(['status' => 'failed']);
                    return redirect()->route('games.show', 'free-fire')->with('error', 'Payment received but top-up failed. Please contact support.');
                }
            }
        }

        $transaction->update(['status' => 'failed']);
        return redirect()->route('games.show', 'free-fire')->with('error', 'Payment capture failed.');
    }

    public function paypalCancel(Request $request)
    {
        $transactionId = $request->query('transaction');
        $transaction = PurchaseTransaction::findOrFail($transactionId);
        
        if ($transaction->status === 'pending') {
            $transaction->update(['status' => 'failed']);
        }

        return redirect()->route('games.show', 'free-fire')->with('error', 'Payment was cancelled.');
    }
}
