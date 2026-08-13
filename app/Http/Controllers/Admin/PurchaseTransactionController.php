<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PurchaseTransaction;
use Illuminate\Http\Request;

class PurchaseTransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseTransaction::with(['user', 'package', 'shellAccount'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $transactions = $query->paginate(15);
        
        return view('admin.purchase_transactions.index', compact('transactions'));
    }
    public function retry(PurchaseTransaction $transaction)
    {
        if ($transaction->status === 'success') {
            return redirect()->back()->with('error', 'Transaction is already successful.');
        }

        // Simulate manual fulfillment of top-up
        $transaction->update(['status' => 'success']);

        return redirect()->back()->with('success', "Transaction #{$transaction->id} manually marked as successful.");
    }

    public function verify(PurchaseTransaction $transaction)
    {
        if ($transaction->status !== 'payment_pending') {
            return redirect()->back()->with('error', 'Only payment pending transactions can be verified.');
        }

        // Fulfill the transaction
        $shellAccount = \App\Models\ShellAccount::find($transaction->shell_account_id);
        
        if ($shellAccount && $shellAccount->available_balance >= $transaction->shells_deducted) {
            $shellAccount->decrement('available_balance', $transaction->shells_deducted);
            
            \App\Models\ShellTransaction::create([
                'shell_account_id' => $shellAccount->id,
                'transaction_type' => 'debit',
                'amount' => $transaction->shells_deducted,
                'description' => 'Free Fire Top-up for UID: ' . $transaction->free_fire_player_id . ' (Bank Transfer)',
                'related_user_id' => $transaction->user_id,
                'related_purchase_id' => $transaction->id,
            ]);

            $transaction->update(['status' => 'success']);
            return redirect()->back()->with('success', "Transaction #{$transaction->id} verified and top-up processed.");
        }

        return redirect()->back()->with('error', "Insufficient shell balance to process this transaction.");
    }

    public function reject(PurchaseTransaction $transaction)
    {
        if ($transaction->status !== 'payment_pending') {
            return redirect()->back()->with('error', 'Only payment pending transactions can be rejected.');
        }

        $transaction->update(['status' => 'failed']);
        return redirect()->back()->with('success', "Transaction #{$transaction->id} has been rejected.");
    }
}
