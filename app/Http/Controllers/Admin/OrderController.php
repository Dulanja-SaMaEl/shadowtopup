<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $status = $request->get('status');
        $search = $request->get('search');
        
        $orders = Order::with('user', 'items.product.game')
            ->when($status, function($query, $status) {
                return $query->where('status', $status);
            })
            ->when($search, function($query, $search) {
                return $query->whereHas('user', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return view('admin.orders.index', compact('orders'));
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:orders,id',
            'status' => 'required|string|in:verified,completed,rejected',
        ]);

        Order::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return redirect()->back()->with('success', 'Orders updated successfully.');
    }

    public function show(Order $order)
    {
        $order->load('user', 'items.product.game');
        return view('admin.orders.show', compact('order'));
    }

    public function verify(Order $order)
    {
        $order->update([
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Order verified! Manual delivery task generated.');
    }

    public function reject(Request $request, Order $order)
    {
        $request->validate([
            'admin_note' => 'required|string',
        ]);

        $order->update([
            'status' => 'rejected',
            'admin_note' => $request->admin_note,
        ]);

        return redirect()->back()->with('success', 'Order rejected.');
    }

    public function complete(Order $order)
    {
        $order->update([
            'status' => 'completed',
        ]);

        return redirect()->back()->with('success', 'Order marked as completed.');
    }
}
