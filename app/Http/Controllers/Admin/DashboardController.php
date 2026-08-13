<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_sales' => Order::where('status', 'verified')->orWhere('status', 'completed')->sum('total_amount'),
            'pending_orders' => Order::where('status', 'payment_pending')->count(),
            'total_users' => User::count(),
            'today_sales' => Order::whereDate('created_at', today())
                ->whereIn('status', ['verified', 'completed'])
                ->sum('total_amount'),
        ];

        // Chart Data: Last 30 Days Sales
        $thirtyDaysAgo = now()->subDays(29)->startOfDay();
        $salesData = Order::selectRaw('DATE(created_at) as date, SUM(total_amount) as total')
            ->where('created_at', '>=', $thirtyDaysAgo)
            ->whereIn('status', ['verified', 'completed'])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $chartDates = [];
        $chartSales = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateStr = now()->subDays($i)->format('Y-m-d');
            $chartDates[] = now()->subDays($i)->format('M d');
            $chartSales[] = isset($salesData[$dateStr]) ? $salesData[$dateStr]->total : 0;
        }

        // Chart Data: Order Status Distribution
        $statusDistribution = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $recentOrders = Order::with('user')->latest()->take(10)->get();

        return view('admin.dashboard', compact('stats', 'recentOrders', 'chartDates', 'chartSales', 'statusDistribution'));
    }
}
