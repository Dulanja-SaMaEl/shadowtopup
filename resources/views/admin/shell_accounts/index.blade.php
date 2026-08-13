<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Shell Accounts</h2>
            <p class="text-gray-400 text-sm mt-1">Manage Garena Shell API accounts and monitor real-time stock balances.</p>
        </div>
        
        <a href="{{ route('admin.shell_accounts.create') }}" class="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Shell Account</span>
        </a>
    </div>

    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">Account Name</th>
                        <th class="px-6 py-4">Username</th>
                        <th class="px-6 py-4">Live Balance</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                    @forelse($accounts as $account)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-white">{{ $account->account_name }}</div>
                                <div class="text-[10px] text-gray-400 font-mono mt-0.5">{{ $account->shell_transactions_count }} Transactions</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-400 font-mono">
                                {{ $account->account_username }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="font-mono font-black text-purple-400 account-balance text-base" id="balance-{{ $account->id }}" data-account-id="{{ $account->id }}">
                                    {{ number_format($account->available_balance) }} Shells
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                @if($account->is_main)
                                    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">Main Account</span>
                                @else
                                    <form action="{{ route('admin.shell_accounts.set-main', $account) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="text-xs text-purple-400 font-bold hover:text-purple-300 hover:underline transition">Set as Main</button>
                                    </form>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('admin.shell_accounts.show', $account) }}" class="p-2 text-sky-400 hover:text-white bg-sky-500/15 hover:bg-sky-500/30 border border-sky-500/30 rounded-xl transition" title="View Account Details">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    </a>
                                    <a href="{{ route('admin.shell_accounts.edit', $account) }}" class="p-2 text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition" title="Edit Credentials">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </a>
                                    <form action="{{ route('admin.shell_accounts.destroy', $account) }}" method="POST" onsubmit="return confirm('Delete this shell account?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition" title="Delete Account">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-8 text-center text-gray-400 text-sm">No shell accounts configured.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
    
    <div class="mt-6">
        {{ $accounts->links() }}
    </div>
</x-admin-layout>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        function fetchBalances() {
            const balanceElements = document.querySelectorAll('.account-balance');
            balanceElements.forEach(async (el) => {
                const accountId = el.getAttribute('data-account-id');
                try {
                    const response = await fetch(`/admin/shell_accounts/${accountId}/balance`);
                    if (response.ok) {
                        const data = await response.json();
                        el.innerText = `${data.balance} Shells`;
                    }
                } catch (e) {
                    console.error('Error fetching balance:', e);
                }
            });
        }

        // Poll every 30 seconds
        setInterval(fetchBalances, 30000);
    });
</script>

