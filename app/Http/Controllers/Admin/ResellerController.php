<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class ResellerController extends Controller
{
    public function index()
    {
        $pendingApplications = User::where('reseller_status', 'pending')->latest()->get();
        $silverResellers = User::where('role', 'silver')->latest()->get();
        $goldResellers = User::where('role', 'gold')->latest()->get();

        return view('admin.resellers.index', compact('pendingApplications', 'silverResellers', 'goldResellers'));
    }

    public function approve(User $user, Request $request)
    {
        $tier = $user->requested_tier ?? 'silver';

        $user->update([
            'role' => $tier,
            'reseller_status' => 'approved',
            'reseller_expires_at' => now()->addMonth(),
        ]);

        return redirect()->back()->with('success', 'User approved as ' . ucfirst($tier) . ' Reseller.');
    }

    public function reject(User $user)
    {
        $user->update([
            'reseller_status' => 'rejected',
            'requested_tier' => null,
        ]);

        return redirect()->back()->with('success', 'Reseller application rejected.');
    }

    public function demote(User $user)
    {
        $user->update([
            'role' => 'user',
            'reseller_status' => 'none',
            'reseller_expires_at' => null,
            'requested_tier' => null,
        ]);

        return redirect()->back()->with('success', 'User demoted to Normal User.');
    }
}
