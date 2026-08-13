<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Free Fire Purchase Transactions</h2>
            <p class="text-gray-400 text-sm mt-1">Audit log of customer top-up transactions, payment statuses, and Garena dispatch records.</p>
        </div>
    </div>

    <!-- Filters Bar -->
    <div class="glass-card rounded-2xl border border-white/10 shadow-xl p-4 mb-8">
        <form action="{{ route('admin.purchase_transactions.index') }}" method="GET" class="flex flex-wrap items-end gap-4">
            <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Filter</label>
                <select name="status" class="bg-white/5 border-white/10 rounded-xl text-xs font-bold text-gray-200 focus:ring-purple-500 focus:border-purple-500">
                    <option value="" class="bg-gray-900 text-white">All Statuses</option>
                    <option value="success" {{ request('status') === 'success' ? 'selected' : '' }} class="bg-gray-900 text-white">Success</option>
                    <option value="payment_pending" {{ request('status') === 'payment_pending' ? 'selected' : '' }} class="bg-gray-900 text-white">Payment Pending</option>
                    <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }} class="bg-gray-900 text-white">Topup Pending</option>
                    <option value="failed" {{ request('status') === 'failed' ? 'selected' : '' }} class="bg-gray-900 text-white">Failed</option>
                </select>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer User ID</label>
                <input type="number" name="user_id" value="{{ request('user_id') }}" placeholder="User ID..." class="bg-white/5 border-white/10 rounded-xl text-xs font-mono text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500">
            </div>
            <button type="submit" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                Filter
            </button>
            <a href="{{ route('admin.purchase_transactions.index') }}" class="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition">
                Clear
            </a>
        </form>
    </div>

    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">Timestamp</th>
                        <th class="px-6 py-4">User</th>
                        <th class="px-6 py-4">Free Fire ID</th>
                        <th class="px-6 py-4">Package Item</th>
                        <th class="px-6 py-4">Amount / Method</th>
                        <th class="px-6 py-4">Reference / Receipt</th>
                        <th class="px-6 py-4 text-right">Status & Action</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                    @forelse($transactions as $transaction)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                                {{ $transaction->created_at->format('M d, Y H:i:s') }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-white">{{ $transaction->user->name ?? 'Deleted Account' }}</div>
                                <div class="text-[10px] text-purple-400 font-extrabold uppercase font-mono mt-0.5">{{ $transaction->price_tier }} Tier</div>
                            </td>
                            <td class="px-6 py-4 font-mono font-black text-amber-400">
                                {{ $transaction->free_fire_player_id }}
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-bold text-white">{{ $transaction->package->package_name ?? 'Deleted Package' }}</div>
                                <div class="text-[10px] text-gray-400 font-mono mt-0.5">Shell Acc: #{{ $transaction->shell_account_id }}</div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="font-mono font-black text-white text-base">LKR {{ number_format($transaction->price_paid, 2) }}</div>
                                <div class="text-[10px] text-gray-400 font-mono uppercase mt-0.5">
                                    Method: <span class="{{ $transaction->payment_method === 'paypal' ? 'text-sky-400 font-bold' : 'text-emerald-400 font-bold' }}">{{ strtoupper(str_replace('_', ' ', $transaction->payment_method)) }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-xs font-mono text-gray-400">
                                @if($transaction->payment_method === 'paypal')
                                    <span class="text-sky-300">{{ $transaction->paypal_order_id ?? 'N/A' }}</span>
                                @elseif($transaction->receipt_path)
                                    <a href="{{ asset('storage/' . $transaction->receipt_path) }}" target="_blank" class="text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest underline flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        View Slip
                                    </a>
                                @else
                                    <span class="text-gray-500">N/A</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                @if($transaction->status === 'success')
                                    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Success</span>
                                @elseif($transaction->status === 'payment_pending')
                                    <span class="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Payment Pending</span>
                                    <div class="mt-2 flex flex-col items-end gap-1">
                                        <form action="{{ route('admin.purchase_transactions.verify', $transaction) }}" method="POST">
                                            @csrf
                                            <button type="submit" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition shadow-md">Verify & Topup</button>
                                        </form>
                                        <form action="{{ route('admin.purchase_transactions.reject', $transaction) }}" method="POST">
                                            @csrf
                                            <button type="submit" class="px-3 py-1 bg-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-[10px] font-bold uppercase tracking-wider transition">Reject</button>
                                        </form>
                                    </div>
                                @elseif($transaction->status === 'pending')
                                    <span class="px-3 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Topup Pending</span>
                                @else
                                    <span class="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">Failed</span>
                                    <form action="{{ route('admin.purchase_transactions.retry', $transaction) }}" method="POST" class="mt-2 text-right">
                                        @csrf
                                        <button type="submit" class="px-3 py-1 bg-white/10 hover:bg-purple-600 hover:text-white text-gray-300 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider transition">Retry Dispatch</button>
                                    </form>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-gray-400 text-sm">No purchase transactions found matching criteria.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="p-6 bg-white/[0.02] border-t border-white/5">
            {{ $transactions->links() }}
        </div>
    </div>
</x-admin-layout>

