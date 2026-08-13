<x-admin-layout>
    <div class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Dashboard Overview</h2>
            <p class="text-gray-400 text-sm mt-1">Real-time statistics and store analytics.</p>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.orders.index') }}" class="px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold uppercase tracking-widest transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <span>Manage Orders</span>
            </a>
        </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <!-- Total Sales -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 glass-card-hover relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Sales</p>
                <div class="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <p class="text-3xl font-black text-white">LKR {{ number_format($stats['total_sales'], 2) }}</p>
            <p class="text-[11px] text-purple-400 font-bold mt-2 flex items-center gap-1">
                <span>All-time earnings</span>
            </p>
        </div>

        <!-- Pending Verification -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 glass-card-hover relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Verification</p>
                <div class="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <p class="text-3xl font-black text-sky-400">{{ $stats['pending_orders'] }}</p>
            <p class="text-[11px] text-gray-400 font-bold mt-2">Requires manual review</p>
        </div>

        <!-- Total Users -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 glass-card-hover relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Users</p>
                <div class="w-10 h-10 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
            </div>
            <p class="text-3xl font-black text-white">{{ $stats['total_users'] }}</p>
            <p class="text-[11px] text-gray-400 font-bold mt-2">Registered accounts</p>
        </div>

        <!-- Today's Sales -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 glass-card-hover relative overflow-hidden group">
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">Today's Revenue</p>
                <div class="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                </div>
            </div>
            <p class="text-3xl font-black text-emerald-400">LKR {{ number_format($stats['today_sales'], 2) }}</p>
            <p class="text-[11px] text-emerald-400/80 font-bold mt-2">Revenue generated today</p>
        </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- Sales Chart -->
        <div class="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
                    Revenue Analytics (Last 30 Days)
                </h3>
                <span class="text-[10px] font-bold text-purple-400 uppercase tracking-widest px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full">Daily Trend</span>
            </div>
            <div class="relative h-72">
                <canvas id="salesChart"></canvas>
            </div>
        </div>

        <!-- Order Status Distribution -->
        <div class="glass-card p-6 rounded-2xl border border-white/10 flex flex-col">
            <div class="flex items-center justify-between mb-6">
                <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                    <svg class="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
                    Order Status Breakdown
                </h3>
            </div>
            <div class="relative h-64 flex-1">
                <canvas id="statusChart"></canvas>
            </div>
        </div>
    </div>

    <!-- Recent Orders Table -->
    <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Recent Orders
            </h3>
            <a href="{{ route('admin.orders.index') }}" class="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 transition">
                <span>View All</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">Order ID</th>
                        <th class="px-6 py-4">Customer</th>
                        <th class="px-6 py-4">Amount</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4">Date</th>
                        <th class="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                    @forelse($recentOrders as $order)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono font-bold text-purple-400">#{{ $order->id }}</td>
                            <td class="px-6 py-4">
                                <span class="font-bold text-white block">{{ $order->user->name }}</span>
                                <span class="text-[10px] text-gray-400">{{ $order->user->email }}</span>
                            </td>
                            <td class="px-6 py-4 font-black text-white">LKR {{ number_format($order->total_amount, 2) }}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border
                                    @if($order->status === 'pending') bg-amber-500/10 text-amber-400 border-amber-500/30
                                    @elseif($order->status === 'payment_pending') bg-sky-500/10 text-sky-400 border-sky-500/30
                                    @elseif($order->status === 'verified') bg-purple-500/10 text-purple-400 border-purple-500/30
                                    @elseif($order->status === 'completed') bg-emerald-500/10 text-emerald-400 border-emerald-500/30
                                    @else bg-rose-500/10 text-rose-400 border-rose-500/30 @endif">
                                    {{ str_replace('_', ' ', $order->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs text-gray-400 font-mono">{{ $order->created_at->format('M d, Y H:i') }}</td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('admin.orders.show', $order) }}" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider transition">
                                    <span>Details</span>
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-400 text-sm">No recent orders found.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Chart.js Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Sales Line Chart
            const salesCtx = document.getElementById('salesChart').getContext('2d');
            
            let gradient = salesCtx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');
            
            new Chart(salesCtx, {
                type: 'line',
                data: {
                    labels: {!! json_encode($chartDates) !!},
                    datasets: [{
                        label: 'Revenue (LKR)',
                        data: {!! json_encode($chartSales) !!},
                        borderColor: '#a855f7',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#a855f7',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(12, 8, 24, 0.95)',
                            borderColor: 'rgba(139, 92, 246, 0.3)',
                            borderWidth: 1,
                            titleFont: { size: 13, family: 'Figtree' },
                            bodyFont: { size: 14, weight: 'bold', family: 'Figtree' },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return 'LKR ' + context.parsed.y.toLocaleString();
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.06)', drawBorder: false },
                            ticks: { color: '#9ca3af', font: { family: 'Figtree', size: 11 }, callback: (value) => 'LKR ' + value }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: '#9ca3af', font: { family: 'Figtree', size: 11 }, maxTicksLimit: 10 }
                        }
                    },
                    interaction: { mode: 'index', intersect: false }
                }
            });

            // Status Doughnut Chart
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            const statusData = {!! json_encode($statusDistribution) !!};
            
            const labels = [];
            const data = [];
            const backgroundColors = [];
            
            const colorMap = {
                'pending': '#f59e0b',
                'payment_pending': '#0284c7',
                'verified': '#a855f7',
                'completed': '#10b981',
                'rejected': '#f43f5e',
                'failed': '#f43f5e'
            };

            for (const [status, count] of Object.entries(statusData)) {
                labels.push(status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '));
                data.push(count);
                backgroundColors.push(colorMap[status] || '#6b7280');
            }

            if (data.length === 0) {
                labels.push('No Orders');
                data.push(1);
                backgroundColors.push('#374151');
            }

            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#d1d5db',
                                padding: 16,
                                font: { family: 'Figtree', size: 12, weight: '600' },
                                usePointStyle: true,
                                pointStyle: 'circle'
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(12, 8, 24, 0.95)',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            titleFont: { size: 13, family: 'Figtree' },
                            bodyFont: { size: 14, weight: 'bold', family: 'Figtree' },
                            padding: 12,
                            displayColors: true
                        }
                    }
                }
            });
        });
    </script>
</x-admin-layout>

