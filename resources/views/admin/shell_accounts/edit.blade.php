<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.shell_accounts.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Shell Accounts List</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Edit Shell Account: <span class="text-purple-400">{{ $shellAccount->account_name }}</span></h2>
        <p class="text-gray-400 text-sm mt-1">Manage credentials, balance allocations, and primary state.</p>
    </div>

    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl p-8 max-w-2xl">
        <form action="{{ route('admin.shell_accounts.update', $shellAccount) }}" method="POST">
            @csrf
            @method('PUT')

            <div class="space-y-6">
                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Friendly Name</label>
                    <input type="text" name="account_name" value="{{ old('account_name', $shellAccount->account_name) }}" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                    @error('account_name') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Username / ID</label>
                    <input type="text" name="account_username" value="{{ old('account_username', $shellAccount->account_username) }}" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                    @error('account_username') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Account Password <span class="text-gray-500 normal-case font-normal">(leave blank to keep current)</span></label>
                    <input type="password" name="account_password" placeholder="••••••••••••" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    @error('account_password') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Available Shell Balance</label>
                    <input type="number" name="available_balance" value="{{ old('available_balance', $shellAccount->available_balance) }}" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                    @error('available_balance') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div class="flex items-center gap-3 pt-2">
                    <input type="hidden" name="is_main" value="0">
                    <input type="checkbox" name="is_main" value="1" id="is_main" {{ old('is_main', $shellAccount->is_main) ? 'checked' : '' }} class="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500">
                    <label for="is_main" class="text-sm font-bold text-gray-200 cursor-pointer">Set as Primary Shell Account (Default for dispatches)</label>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-white/10">
                <button type="submit" class="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Update Account
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>

