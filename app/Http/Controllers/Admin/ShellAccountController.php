<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShellAccount;
use App\Models\ShellTransaction;
use Illuminate\Http\Request;

class ShellAccountController extends Controller
{
    public function index()
    {
        $accounts = ShellAccount::withCount('shellTransactions')->latest()->paginate(10);
        return view('admin.shell_accounts.index', compact('accounts'));
    }

    public function create()
    {
        return view('admin.shell_accounts.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_name' => 'required|string|max:255',
            'account_username' => 'required|string|max:255',
            'account_password' => 'required|string',
            'available_balance' => 'required|integer|min:0',
            'is_main' => 'boolean',
        ]);

        if ($request->has('is_main') && $request->is_main) {
            ShellAccount::where('is_main', true)->update(['is_main' => false]);
        }

        ShellAccount::create($validated);

        return redirect()->route('admin.shell_accounts.index')->with('success', 'Shell Account added successfully.');
    }

    public function show(ShellAccount $shellAccount)
    {
        $transactions = $shellAccount->shellTransactions()->with('user')->latest()->paginate(20);
        return view('admin.shell_accounts.show', compact('shellAccount', 'transactions'));
    }

    public function edit(ShellAccount $shellAccount)
    {
        return view('admin.shell_accounts.edit', compact('shellAccount'));
    }

    public function update(Request $request, ShellAccount $shellAccount)
    {
        $validated = $request->validate([
            'account_name'     => 'required|string|max:255',
            'account_username' => 'required|string|max:255',
            'account_password' => 'nullable|string',
            'session_cookie'   => 'nullable|string',
            'available_balance'=> 'required|integer|min:0',
            'is_main'          => 'boolean',
        ]);

        if ($request->has('is_main') && $request->is_main) {
            ShellAccount::where('id', '!=', $shellAccount->id)->update(['is_main' => false]);
        }

        if (empty($validated['account_password'])) {
            unset($validated['account_password']);
        }

        $shellAccount->update($validated);

        return redirect()->route('admin.shell_accounts.index')->with('success', 'Shell Account updated successfully.');
    }

    public function destroy(ShellAccount $shellAccount)
    {
        $shellAccount->delete();
        return redirect()->route('admin.shell_accounts.index')->with('success', 'Shell Account deleted successfully.');
    }

    public function setMain(ShellAccount $shellAccount)
    {
        ShellAccount::where('is_main', true)->update(['is_main' => false]);
        $shellAccount->update(['is_main' => true]);
        
        return redirect()->route('admin.shell_accounts.index')->with('success', "{$shellAccount->account_name} is now the Main Shell Account.");
    }

    public function redeemPin(Request $request, ShellAccount $shellAccount)
    {
        $request->validate([
            'pin_code' => 'required|string|max:255',
            'receiver_name' => 'required|string|max:255',
            'receiver_email' => 'required|email|max:255',
            'added_shells' => 'required|integer|min:1',
        ]);

        // Placeholder for actual Republic GG Pin Redemption API logic
        // For now, we simulate a successful redemption
        
        $shellAccount->increment('available_balance', $request->added_shells);

        ShellTransaction::create([
            'shell_account_id' => $shellAccount->id,
            'transaction_type' => 'credit',
            'amount' => $request->added_shells,
            'description' => 'Redeemed Republic GG PIN: ' . $request->pin_code,
        ]);

        return redirect()->route('admin.shell_accounts.show', $shellAccount)->with('success', "PIN logged successfully! {$request->added_shells} Shells added locally. Ensure the PIN is actually redeemed on the Garena portal.");
    }

    public function syncBalance(ShellAccount $shellAccount)
    {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(60)
                ->post('http://localhost:3001/api/sync-balance', [
                    'username' => $shellAccount->account_username,
                    'password' => $shellAccount->account_password,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $shellAccount->update([
                    'available_balance' => $data['balance'],
                    'last_synced_at'    => now(),
                ]);
                return redirect()->back()->with('success',
                    "✅ Balance synced! {$shellAccount->account_username} now has {$data['balance']} Shells.");
            } else {
                $errorMsg = $response->json('error') ?? 'Unknown error.';
                return redirect()->back()->with('error', 'Sync failed: ' . $errorMsg);
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error',
                'Could not connect to Node.js service on port 3001. Error: ' . $e->getMessage());
        }
    }

    public function getBalance(ShellAccount $shellAccount)
    {
        return response()->json([
            'balance' => number_format($shellAccount->available_balance, 0),
            'last_synced_at' => $shellAccount->last_synced_at ? $shellAccount->last_synced_at->diffForHumans() : 'Never',
        ]);
    }

    public function manualLogin(ShellAccount $shellAccount)
    {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(360) // 6 minutes timeout for manual interaction
                ->post('http://localhost:3001/api/manual-login', [
                    'username' => $shellAccount->account_username,
                ]);

            if ($response->successful()) {
                return redirect()->back()->with('success', '✅ Native Chrome window opened on your server! Please log in manually, wait for the shop balance to load, and then manually close the Chrome window. Once closed, you can use automated sync.');
            } else {
                $errorMsg = $response->json('error') ?? 'Unknown error.';
                return redirect()->back()->with('error', 'Manual login failed: ' . $errorMsg);
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Could not connect to the scraper service. Is it running? Error: ' . $e->getMessage());
        }
    }
}
