<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <a href="{{ route('admin.shell_accounts.index') }}" class="text-xs font-extrabold text-purple-400 uppercase tracking-[0.2em] mb-2 inline-flex items-center gap-1 hover:text-purple-300 transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                <span>Back to accounts</span>
            </a>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">{{ $shellAccount->account_name }}</h2>
            <p class="text-gray-400 text-sm mt-1">Garena Shell Account Details & Transaction Audit Log</p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <!-- Account Details Card -->
        <div class="glass-card rounded-2xl border border-white/10 shadow-xl p-6 col-span-1 flex flex-col justify-between">
            <div>
                <h3 class="text-sm font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 00-3 3h6a3 3 0 00-3-3z"></path></svg>
                    Account Credentials & Balance
                </h3>
                
                <div class="space-y-4">
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Username</div>
                        <div class="font-mono font-bold text-white mt-1 text-base">{{ $shellAccount->account_username }}</div>
                    </div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">System Status</div>
                        @if($shellAccount->is_main)
                            <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider mt-1 inline-block">⭐ Main Account</span>
                        @else
                            <form action="{{ route('admin.shell_accounts.set-main', $shellAccount) }}" method="POST" class="mt-1">
                                @csrf
                                <button type="submit" class="px-3 py-1 bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-purple-300 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider transition">Set as Main</button>
                            </form>
                        @endif
                    </div>
                    <div>
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Last Synced</div>
                        <div class="text-xs text-gray-300 font-mono mt-1" id="last-synced">
                            {{ $shellAccount->last_synced_at ? $shellAccount->last_synced_at->diffForHumans() : 'Never synced' }}
                        </div>
                    </div>
                    <div class="pt-4 border-t border-white/10">
                        <div class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Available Shell Balance</div>
                        <div class="text-4xl font-black text-purple-400 font-mono mt-2 flex items-baseline gap-2">
                            <span id="available-balance">{{ number_format($shellAccount->available_balance) }}</span>
                            <span class="text-sm font-bold text-gray-400">Shells</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sync Balance Buttons -->
            <div class="mt-6 pt-6 border-t border-white/10 space-y-2">
                <p class="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-2">Live Sync Options:</p>

                <form action="{{ route('admin.shell_accounts.sync-balance', $shellAccount) }}" method="POST">
                    @csrf
                    <button type="submit" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white transition shadow-lg shadow-purple-600/20">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        <span>Sync Balance (Headless)</span>
                    </button>
                </form>

                <form action="{{ route('admin.shell_accounts.manual-login', $shellAccount) }}" method="POST">
                    @csrf
                    <button type="submit" onclick="return confirm('This will open a visible browser session. Continue?')" class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white border border-amber-500/30 transition">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4v-3.252l7.536-7.536a6 6 0 118.464-8.464z"></path></svg>
                        <span>Initialize Manual Session</span>
                    </button>
                </form>

                <a href="https://shop.garena.my/?app=10094" target="_blank" class="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    <span>Open Garena Shop</span>
                </a>
            </div>
        </div>

        <!-- Redeem PIN & Manual Balance Card -->
        <div class="glass-card rounded-2xl border border-white/10 shadow-xl p-6 col-span-1 lg:col-span-2 relative overflow-hidden">
            <h3 class="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5z"></path></svg>
                Redeem Republic GG PIN
            </h3>
            <p class="text-gray-400 text-xs mb-4">Add shells to this account by logging a Republic GG PIN redemption.</p>
            
            <div class="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs font-bold flex items-start gap-2">
                <svg class="w-4 h-4 mt-0.5 shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span>Note: This logs the transaction and increments your database balance. Ensure the PIN code is redeemed on the official portal.</span>
            </div>

            <form action="{{ route('admin.shell_accounts.redeem-pin', $shellAccount) }}" method="POST">
                @csrf
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">PIN Code</label>
                        <input type="text" name="pin_code" class="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" placeholder="Enter Republic GG PIN..." required>
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Shells to Add</label>
                        <input type="number" name="added_shells" class="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" placeholder="e.g. 1300" required>
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receiver Name</label>
                        <input type="text" name="receiver_name" class="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" placeholder="Customer or Ref Name" required>
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Receiver Email</label>
                        <input type="email" name="receiver_email" class="w-full bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" placeholder="email@domain.com" required>
                    </div>
                </div>
                <button type="submit" class="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Redeem PIN & Credit Account Balance
                </button>
            </form>

            <!-- Manual Balance Update -->
            <div class="mt-6 pt-6 border-t border-white/10">
                <h4 class="text-xs font-black text-white uppercase tracking-widest mb-2">Manual Balance Override</h4>
                <p class="text-gray-400 text-xs mb-3">Directly overwrite the stored shell balance with the exact live amount from Garena.</p>
                <form action="{{ route('admin.shell_accounts.update', $shellAccount) }}" method="POST" class="flex gap-3">
                    @csrf
                    @method('PUT')
                    <input type="hidden" name="account_name" value="{{ $shellAccount->account_name }}">
                    <input type="hidden" name="account_username" value="{{ $shellAccount->account_username }}">
                    <input type="hidden" name="is_main" value="{{ $shellAccount->is_main ? '1' : '0' }}">
                    <input type="number" name="available_balance" value="{{ $shellAccount->available_balance }}" class="flex-1 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500" placeholder="Actual Shell balance..." required>
                    <button type="submit" class="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition">
                        Update
                    </button>
                </form>
            </div>
        </div>
    </div>

    <!-- Transaction History Table -->
    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div class="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <h3 class="font-black text-white uppercase tracking-wider text-sm flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Transaction History Log
            </h3>
            <span class="text-xs text-purple-400 font-mono font-bold">{{ $transactions->total() }} Total Events</span>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">Timestamp</th>
                        <th class="px-6 py-4">Type</th>
                        <th class="px-6 py-4">Description / Customer</th>
                        <th class="px-6 py-4 text-right">Shell Amount</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                    @forelse($transactions as $transaction)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4 text-xs font-mono text-gray-400">
                                {{ $transaction->created_at->format('M d, Y H:i:s') }}
                            </td>
                            <td class="px-6 py-4">
                                @if($transaction->transaction_type === 'credit')
                                    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Credit (In)</span>
                                @else
                                    <span class="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Debit (Out)</span>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-white font-bold block">{{ $transaction->description }}</span>
                                @if($transaction->user)
                                    <span class="text-[10px] text-purple-400 font-mono">User: {{ $transaction->user->name }} ({{ $transaction->user->email }})</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                <span class="font-mono font-black text-base {{ $transaction->transaction_type === 'credit' ? 'text-emerald-400' : 'text-rose-400' }}">
                                    {{ $transaction->transaction_type === 'credit' ? '+' : '-' }}{{ number_format($transaction->amount) }} Shells
                                </span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-gray-400 text-sm">
                                No transactions recorded for this shell account yet.
                            </td>
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

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const accountId = {{ $shellAccount->id }};
        const balanceSpan = document.getElementById('available-balance');
        const lastSyncedDiv = document.getElementById('last-synced');

        async function fetchBalance() {
            try {
                const response = await fetch(`/admin/shell_accounts/${accountId}/balance`);
                if (response.ok) {
                    const data = await response.json();
                    balanceSpan.innerText = data.balance;
                    lastSyncedDiv.innerText = data.last_synced_at;
                }
            } catch (e) {
                console.error('Error fetching balance:', e);
            }
        }

        // Poll every 30 seconds
        setInterval(fetchBalance, 30000);
    });
</script>

