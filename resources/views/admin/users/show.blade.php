<x-admin-layout>
    <div class="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Customer Profile</h2>
            <p class="text-gray-400 text-sm mt-1">Detailed account information and spending analytics.</p>
        </div>
        <a href="{{ route('admin.users.index') }}" class="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 self-start sm:self-auto">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Users</span>
        </a>
    </div>

    <!-- User Details & Metrics Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <!-- Profile Card -->
        <div class="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mb-4 shadow-lg shadow-purple-600/30 border border-white/20">
                {{ strtoupper(substr($user->name, 0, 1)) }}
            </div>
            <h3 class="text-xl font-black text-white">{{ $user->name }}</h3>
            <p class="text-gray-400 text-sm mb-4 font-mono">{{ $user->email }}</p>
            
            <div class="flex items-center gap-2 mb-6">
                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border {{ $user->role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : ($user->isReseller() ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-gray-400 border-white/10') }}">
                    {{ $user->role ?? 'User' }}
                </span>
                @if($user->banned_at)
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">Banned</span>
                @else
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                @endif
            </div>

            <div class="w-full pt-6 border-t border-white/10 text-left">
                <p class="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-1">Joined System On</p>
                <p class="text-sm font-bold text-white font-mono">{{ $user->created_at->format('M d, Y') }}</p>
            </div>
        </div>

        <!-- Metrics -->
        <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center">
                <div class="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Lifetime Total Spent</p>
                <p class="text-4xl font-black text-white font-mono">LKR {{ number_format($totalSpent, 2) }}</p>
            </div>
            
            <div class="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-center">
                <div class="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-4">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Active Processing Orders</p>
                <p class="text-4xl font-black text-white font-mono">{{ $activeOrders }}</p>
            </div>
        </div>
    </div>

    <!-- Spending Variance Chart -->
    <div class="glass-card p-6 rounded-2xl border border-white/10 shadow-2xl mb-10">
        <h3 class="font-bold text-white uppercase tracking-tight mb-6 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Daily Spending Analytics (Last 30 Days)</span>
        </h3>
        <div class="relative h-80">
            <canvas id="spendingChart"></canvas>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-white/10">
            <h3 class="font-bold text-white uppercase tracking-tight">Recent Orders</h3>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-xs text-gray-400 font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                        <th class="px-6 py-4">Order Ref</th>
                        <th class="px-6 py-4">Total Amount</th>
                        <th class="px-6 py-4">Fulfillment Status</th>
                        <th class="px-6 py-4">Order Date</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-sm divide-y divide-white/5">
                    @forelse($recentOrders as $order)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 font-mono font-bold text-white">#{{ $order->id }}</td>
                            <td class="px-6 py-4 font-mono font-bold text-emerald-400">LKR {{ number_format($order->total_amount, 2) }}</td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border
                                    @if($order->status === 'pending') bg-amber-500/10 text-amber-400 border-amber-500/20
                                    @elseif($order->status === 'payment_pending') bg-cyan-500/10 text-cyan-400 border-cyan-500/20
                                    @elseif($order->status === 'verified') bg-purple-500/10 text-purple-400 border-purple-500/20
                                    @elseif($order->status === 'completed') bg-emerald-500/10 text-emerald-400 border-emerald-500/20
                                    @else bg-rose-500/10 text-rose-400 border-rose-500/20 @endif">
                                    {{ str_replace('_', ' ', $order->status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-xs font-mono text-gray-300">{{ $order->created_at->format('M d, Y H:i') }}</td>
                            <td class="px-6 py-4 text-right">
                                <a href="{{ route('admin.orders.show', $order) }}" class="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-gray-400">
                                This user has not placed any top-up orders yet.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('spendingChart').getContext('2d');
            
            let gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)'); // emerald-500
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: {!! json_encode($chartDates) !!},
                    datasets: [{
                        label: 'Daily Spent (LKR)',
                        data: {!! json_encode($chartSpend) !!},
                        borderColor: '#10b981',
                        backgroundColor: gradient,
                        borderWidth: 3,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#0f172a',
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
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            titleColor: '#e2e8f0',
                            bodyColor: '#10b981',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            titleFont: { size: 12, family: 'monospace' },
                            bodyFont: { size: 14, weight: 'bold', family: 'monospace' },
                            padding: 12,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    return 'LKR ' + context.parsed.y.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                            ticks: { color: '#94a3b8', font: { family: 'monospace', size: 11 }, callback: (value) => 'LKR ' + value }
                        },
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { color: '#94a3b8', font: { family: 'monospace', size: 11 }, maxTicksLimit: 10 }
                        }
                    },
                    interaction: { mode: 'index', intersect: false }
                }
            });
        });
    </script>
</x-admin-layout>

