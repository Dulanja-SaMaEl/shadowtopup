<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Order Management</h2>
            <p class="text-gray-400 text-sm mt-1">Review customer top-up transactions and payment proofs.</p>
        </div>
        
        <div class="flex items-center gap-4">
            <form action="{{ route('admin.orders.index') }}" method="GET" class="flex items-center gap-3">
                <div class="relative">
                    <input type="text" name="search" value="{{ request('search') }}" placeholder="Search ID, User, or Ref..." class="bg-white/5 border-white/10 rounded-xl py-2.5 px-4 pl-10 text-sm text-gray-200 focus:ring-purple-500 focus:border-purple-500 transition w-full md:w-72 shadow-inner placeholder-gray-500">
                    <svg class="w-4 h-4 absolute left-3.5 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <button type="submit" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Filter
                </button>
            </form>
        </div>
    </div>

    <!-- Status Filters -->
    <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-white/10">
        <a href="{{ route('admin.orders.index') }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ !request('status') ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10' }}">
            All Orders
        </a>
        <a href="{{ route('admin.orders.index', ['status' => 'pending']) }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ request('status') === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-400/70 hover:text-amber-300 hover:bg-white/10' }}">
            Pending Payment
        </a>
        <a href="{{ route('admin.orders.index', ['status' => 'payment_pending']) }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ request('status') === 'payment_pending' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-cyan-400/70 hover:text-cyan-300 hover:bg-white/10' }}">
            Proof Submitted
        </a>
        <a href="{{ route('admin.orders.index', ['status' => 'verified']) }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ request('status') === 'verified' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 text-purple-400/70 hover:text-purple-300 hover:bg-white/10' }}">
            Verified
        </a>
        <a href="{{ route('admin.orders.index', ['status' => 'completed']) }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ request('status') === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white/5 text-emerald-400/70 hover:text-emerald-300 hover:bg-white/10' }}">
            Completed
        </a>
        <a href="{{ route('admin.orders.index', ['status' => 'rejected']) }}" class="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 {{ request('status') === 'rejected' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white/5 text-rose-400/70 hover:text-rose-300 hover:bg-white/10' }}">
            Rejected
        </a>
    </div>

    <!-- Bulk Actions Form Context -->
    <div x-data="{ 
        selectAll: false, 
        selected: [],
        toggleAll() {
            if (this.selectAll) {
                this.selected = [{{ $orders->pluck('id')->implode(',') }}];
            } else {
                this.selected = [];
            }
        }
    }">
        <!-- Bulk Action Bar -->
        <div x-show="selected.length > 0" x-transition class="mb-6 p-4 rounded-2xl bg-purple-950/80 border border-purple-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-purple-950/50">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs shadow" x-text="selected.length"></span>
                <span class="text-xs font-bold text-purple-200 uppercase tracking-wider">Orders Selected</span>
            </div>
            
            <form action="{{ route('admin.orders.bulk-update') }}" method="POST" class="flex items-center gap-3 w-full sm:w-auto">
                @csrf
                <template x-for="id in selected" :key="id">
                    <input type="hidden" name="order_ids[]" :value="id">
                </template>

                <select name="status" class="bg-white/10 border border-white/20 rounded-xl py-2 px-4 text-xs font-bold text-white focus:ring-purple-500 focus:border-purple-500">
                    <option value="" disabled selected class="bg-gray-900 text-white">Select Action...</option>
                    <option value="verified" class="bg-gray-900 text-white">Mark as Verified</option>
                    <option value="completed" class="bg-gray-900 text-white">Mark as Completed</option>
                    <option value="rejected" class="bg-gray-900 text-white">Mark as Rejected</option>
                </select>

                <button type="submit" class="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Apply Batch Action
                </button>
            </form>
        </div>

        <div class="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/10">
                        <tr>
                            <th class="px-6 py-4 w-10">
                                <input type="checkbox" x-model="selectAll" @change="toggleAll()" class="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500">
                            </th>
                            <th class="px-6 py-4">Order ID</th>
                            <th class="px-6 py-4">Customer</th>
                            <th class="px-6 py-4">Items Summary</th>
                            <th class="px-6 py-4">Total Amount</th>
                            <th class="px-6 py-4">Fulfillment Status</th>
                            <th class="px-6 py-4">Payment Receipt</th>
                            <th class="px-6 py-4">Date</th>
                            <th class="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                        @forelse($orders as $order)
                            <tr class="hover:bg-white/5 transition-colors">
                                <td class="px-6 py-4">
                                    <input type="checkbox" :value="{{ $order->id }}" x-model="selected" class="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500">
                                </td>
                                <td class="px-6 py-4 font-mono font-bold text-white">#{{ $order->id }}</td>
                                <td class="px-6 py-4">
                                    <p class="font-bold text-white">{{ $order->user->name ?? 'Guest User' }}</p>
                                    <p class="text-xs text-gray-400 font-mono">{{ $order->user->email ?? 'N/A' }}</p>
                                </td>
                                <td class="px-6 py-4 text-xs">
                                    @if($order->items && $order->items->count() > 0)
                                        <span class="font-bold text-white">{{ $order->items->first()->product->name ?? 'Top-up Package' }}</span>
                                        @if($order->items->count() > 1)
                                            <span class="text-purple-400 font-bold ml-1">+{{ $order->items->count() - 1 }} more</span>
                                        @endif
                                    @else
                                        <span class="text-gray-400 italic">No item details</span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 font-mono font-bold text-emerald-400">
                                    LKR {{ number_format($order->total_amount, 2) }}
                                </td>
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
                                <td class="px-6 py-4">
                                    @if($order->receipt_path)
                                        <a href="{{ asset('storage/' . $order->receipt_path) }}" target="_blank" class="inline-flex items-center text-emerald-400 hover:text-emerald-300 font-bold text-[10px] uppercase tracking-wider transition">
                                            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                            View Receipt
                                        </a>
                                    @else
                                        <span class="text-gray-500 text-[10px] uppercase tracking-wider font-bold italic">No File</span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 text-xs font-mono text-gray-300">
                                    <p class="font-bold">{{ $order->created_at->format('M d, Y') }}</p>
                                    <p class="text-gray-400 text-[11px]">{{ $order->created_at->format('H:i') }}</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <a href="{{ route('admin.orders.show', $order) }}" class="inline-flex items-center px-3.5 py-1.5 bg-white/5 hover:bg-purple-600 hover:text-white border border-white/10 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-sm">
                                        Review
                                        <svg class="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="px-6 py-12 text-center text-gray-400">
                                    No customer orders found matching your criteria.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($orders->hasPages())
                <div class="p-6 bg-white/5 border-t border-white/10">
                    {{ $orders->links() }}
                </div>
            @endif
        </div>
    </div>
</x-admin-layout>

