<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->get('search');
        $role = $request->get('role');

        $users = User::query()
            ->when($search, function($query, $search) {
                return $query->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
            })
            ->when($role, function($query, $role) {
                return $query->where('role', $role);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.users.index', compact('users'));
    }

    public function create()
    {
        return view('admin.users.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:user,admin',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string|in:user,admin',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $request->role;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function toggleBan(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot ban yourself.');
        }

        $user->update([
            'banned_at' => $user->banned_at ? null : now(),
        ]);

        $status = $user->banned_at ? 'banned' : 'unbanned';
        return redirect()->back()->with('success', "User has been {$status}.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'You cannot delete yourself.');
        }

        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    public function show(User $user)
    {
        // Get the last 30 days of spending for this specific user
        $thirtyDaysAgo = now()->subDays(29)->startOfDay();
        
        $salesData = \App\Models\Order::selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->whereIn('status', ['verified', 'completed'])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $chartDates = [];
        $chartSpend = [];
        
        for ($i = 29; $i >= 0; $i--) {
            $dateStr = now()->subDays($i)->format('Y-m-d');
            $chartDates[] = now()->subDays($i)->format('M d');
            $chartSpend[] = isset($salesData[$dateStr]) ? $salesData[$dateStr]->total : 0;
        }

        $totalSpent = \App\Models\Order::where('user_id', $user->id)
            ->whereIn('status', ['verified', 'completed'])
            ->sum('total_amount');
            
        $activeOrders = \App\Models\Order::where('user_id', $user->id)
            ->whereNotIn('status', ['completed', 'rejected'])
            ->count();
            
        $recentOrders = \App\Models\Order::where('user_id', $user->id)
            ->latest()
            ->take(10)
            ->get();

        return view('admin.users.show', compact('user', 'chartDates', 'chartSpend', 'totalSpent', 'activeOrders', 'recentOrders'));
    }
}
