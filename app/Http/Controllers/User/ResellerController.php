<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ResellerController extends Controller
{
    public function apply(Request $request)
    {
        $request->validate([
            'tier' => 'required|in:silver,gold',
        ]);

        $user = auth()->user();

        if ($user->reseller_status === 'pending') {
            return redirect()->back()->with('error', 'You already have a pending reseller application.');
        }

        if ($user->isReseller()) {
            return redirect()->back()->with('error', 'You are already a reseller.');
        }

        $user->update([
            'reseller_status' => 'pending',
            'requested_tier' => $request->tier,
        ]);

        return redirect()->back()->with('success', 'Your application for reseller has been submitted and is pending admin approval.');
    }
}
