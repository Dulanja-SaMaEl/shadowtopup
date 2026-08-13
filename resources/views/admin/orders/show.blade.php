<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <a href="{{ route('admin.orders.index') }}" class="text-xs font-extrabold text-purple-400 uppercase tracking-[0.2em] mb-2 inline-flex items-center gap-1 hover:text-purple-300 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>Back to orders list</span>
            </a>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                <span>Review Order</span>
                <span class="font-mono text-purple-400">#{{ $order->id }}</span>
            </h2>
        </div>
        
        <div class="flex items-center gap-3">
            @if($order->status === 'payment_pending')
                <form action="{{ route('admin.orders.verify', $order) }}" method="POST">
                    @csrf
                    <button type="submit" class="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-purple-600/30 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>Verify Payment</span>
                    </button>
                </form>
                <button onclick="document.getElementById('reject-modal').classList.remove('hidden')" class="px-6 py-3 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl font-bold text-xs uppercase tracking-widest transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    <span>Reject</span>
                </button>
            @elseif($order->status === 'verified')
                <form action="{{ route('admin.orders.complete', $order) }}" method="POST">
                    @csrf
                    <button type="submit" class="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-emerald-600/30 flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Mark as Completed</span>
                    </button>
                </form>
            @endif
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Order Details -->
        <div class="lg:col-span-2 space-y-8">
            <!-- Items Summary -->
            <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                        <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        Items Summary
                    </h3>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                        @if($order->status === 'pending') bg-amber-500/10 text-amber-400 border-amber-500/30
                        @elseif($order->status === 'payment_pending') bg-sky-500/10 text-sky-400 border-sky-500/30
                        @elseif($order->status === 'verified') bg-purple-500/10 text-purple-400 border-purple-500/30
                        @elseif($order->status === 'completed') bg-emerald-500/10 text-emerald-400 border-emerald-500/30
                        @else bg-rose-500/10 text-rose-400 border-rose-500/30 @endif">
                        {{ str_replace('_', ' ', $order->status) }}
                    </span>
                </div>
                <div class="p-6">
                    <table class="w-full text-left border-collapse">
                        <thead class="text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                            <tr>
                                <th class="pb-4">Product</th>
                                <th class="pb-4">Game Player ID</th>
                                <th class="pb-4 text-right">Price</th>
                            </tr>
                        </thead>
                        <tbody class="text-sm divide-y divide-white/5">
                            @foreach($order->items as $item)
                                <tr>
                                    <td class="py-4">
                                        <p class="font-bold text-white">{{ $item->product_name_snapshot }}</p>
                                        <p class="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{{ $item->product->game->name ?? 'Game' }}</p>
                                    </td>
                                    <td class="py-4">
                                        <span class="px-3 py-1 bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded-lg font-mono font-bold text-xs tracking-wider">{{ $item->game_uid }}</span>
                                    </td>
                                    <td class="py-4 text-right font-black text-white">LKR {{ number_format($item->price_at_time, 2) }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot class="border-t border-white/10">
                            <tr>
                                <td colspan="2" class="pt-6 text-right text-gray-400 font-bold uppercase text-[11px] tracking-widest">Total Amount Paid</td>
                                <td class="pt-6 text-right text-2xl font-black text-purple-400">LKR {{ number_format($order->total_amount, 2) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Receipt Card -->
            @if($order->receipt_path)
                <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                    <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                            <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Payment Proof / Receipt
                        </h3>
                        <a href="{{ asset('storage/' . $order->receipt_path) }}" target="_blank" class="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 transition">
                            <span>Open Full Size</span>
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                    <div class="p-6 bg-white/[0.01]">
                        <div class="rounded-2xl overflow-hidden border border-white/10 shadow-2xl mx-auto max-w-lg text-center bg-black/40 p-3">
                            <img src="{{ asset('storage/' . $order->receipt_path) }}" alt="Payment Receipt" class="max-w-full h-auto max-h-[350px] object-contain mx-auto rounded-xl">
                        </div>
                    </div>
                </div>
            @endif
        </div>

        <!-- Sidebar Info -->
        <div class="lg:col-span-1 space-y-8">
            <!-- Customer Info -->
            <div class="glass-card rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Customer Profile</h3>
                <div class="space-y-5">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-lg shadow-inner shrink-0">
                            {{ strtoupper(substr($order->user->name, 0, 1)) }}
                        </div>
                        <div class="overflow-hidden">
                            <p class="font-bold text-white truncate text-base">{{ $order->user->name }}</p>
                            <p class="text-xs text-gray-400 truncate mt-0.5">{{ $order->user->email }}</p>
                        </div>
                    </div>
                    <div class="pt-4 border-t border-white/10 space-y-3 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 font-bold">Registered:</span>
                            <span class="text-white font-mono">{{ $order->user->created_at->format('M d, Y') }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 font-bold">Total Lifetime Orders:</span>
                            <span class="text-purple-400 font-mono font-bold">{{ $order->user->orders()->count() }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Timeline -->
            <div class="glass-card rounded-2xl border border-white/10 p-6 shadow-xl">
                <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Order Status Timeline</h3>
                <div class="space-y-6">
                    <div class="flex gap-4 relative">
                        <div class="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50 mt-1 z-10 shrink-0"></div>
                        <div class="absolute left-[5px] top-4 bottom-[-24px] w-[2px] bg-white/10"></div>
                        <div>
                            <p class="text-xs font-bold text-white">Order Placed</p>
                            <p class="text-[11px] text-gray-400 font-mono mt-0.5">{{ $order->created_at->format('M d, Y H:i') }}</p>
                        </div>
                    </div>
                    @if($order->receipt_path)
                        <div class="flex gap-4 relative">
                            <div class="w-3 h-3 rounded-full bg-sky-500 shadow-lg shadow-sky-500/50 mt-1 z-10 shrink-0"></div>
                            <div class="absolute left-[5px] top-4 bottom-[-24px] w-[2px] bg-white/10"></div>
                            <div>
                                <p class="text-xs font-bold text-white">Receipt Uploaded</p>
                                <p class="text-[11px] text-gray-400 font-mono mt-0.5">{{ $order->updated_at->format('M d, Y H:i') }}</p>
                            </div>
                        </div>
                    @endif
                    @if($order->verified_at)
                        <div class="flex gap-4 relative">
                            <div class="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 mt-1 z-10 shrink-0"></div>
                            <div>
                                <p class="text-xs font-bold text-white">Order Verified</p>
                                <p class="text-[11px] text-gray-400 font-mono mt-0.5">{{ $order->verified_at->format('M d, Y H:i') }}</p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Reject Modal -->
    <div id="reject-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div class="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-rose-500/30">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <svg class="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Reject Order #{{ $order->id }}
                </h3>
                <button type="button" onclick="document.getElementById('reject-modal').classList.add('hidden')" class="text-gray-400 hover:text-white">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <p class="text-xs text-gray-400 mb-6">Specify the rejection reason (e.g. invalid receipt, payment not received). This note will be communicated to the user.</p>
            <form action="{{ route('admin.orders.reject', $order) }}" method="POST">
                @csrf
                <textarea name="admin_note" rows="4" class="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-gray-200 focus:ring-purple-500 focus:border-purple-500 mb-6 placeholder-gray-500" placeholder="Reason for rejection..." required></textarea>
                <div class="flex items-center gap-3">
                    <button type="button" onclick="document.getElementById('reject-modal').classList.add('hidden')" class="flex-1 py-3 bg-white/10 hover:bg-white/20 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition">Cancel</button>
                    <button type="submit" class="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition shadow-lg shadow-rose-600/30">Reject Order</button>
                </div>
            </form>
        </div>
    </div>
</x-admin-layout>

