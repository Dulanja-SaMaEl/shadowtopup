<x-admin-layout>
    <div class="mb-10">
        <a href="{{ route('admin.packages.index') }}" class="text-xs font-bold text-gray-400 hover:text-purple-400 transition flex items-center gap-2 mb-4">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            <span>Back to Package List</span>
        </a>
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Add Free Fire Package</h2>
        <p class="text-gray-400 text-sm mt-1">Configure a new diamond or membership package tier.</p>
    </div>

    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl p-8 max-w-2xl">
        <form action="{{ route('admin.packages.store') }}" method="POST">
            @csrf

            <div class="space-y-6">
                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Package Name</label>
                    <input type="text" name="package_name" value="{{ old('package_name') }}" placeholder="e.g. 100 Diamonds, Weekly Pass" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                    @error('package_name') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Package Type</label>
                    <select name="package_type" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                        <option value="diamond" {{ old('package_type') == 'diamond' ? 'selected' : '' }} class="bg-gray-900 text-white">Diamond Pack</option>
                        <option value="membership" {{ old('package_type') == 'membership' ? 'selected' : '' }} class="bg-gray-900 text-white">Membership Pack</option>
                    </select>
                    @error('package_type') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Diamond Amount (if Diamond Pack)</label>
                    <input type="number" name="diamond_amount" value="{{ old('diamond_amount') }}" placeholder="e.g. 100" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner">
                    @error('diamond_amount') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Garena Shell Cost</label>
                    <input type="number" name="shell_cost" value="{{ old('shell_cost') }}" placeholder="e.g. 50" class="w-full bg-white/5 border-white/10 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-gray-500 focus:ring-purple-500 focus:border-purple-500 transition shadow-inner" required>
                    <p class="text-[11px] text-gray-400 mt-1.5">End-user prices (Normal, Silver, Gold) are dynamically calculated based on this cost and your Pricing Settings markup rules.</p>
                    @error('shell_cost') <span class="text-rose-400 text-xs mt-1.5 font-bold block">{{ $message }}</span> @enderror
                </div>

                <div class="flex items-center gap-3 pt-2">
                    <input type="hidden" name="is_active" value="0">
                    <input type="checkbox" name="is_active" value="1" id="is_active" {{ old('is_active', true) ? 'checked' : '' }} class="w-4 h-4 rounded bg-white/5 border-white/10 text-purple-600 focus:ring-purple-500">
                    <label for="is_active" class="text-sm font-bold text-gray-200 cursor-pointer">Active (Visible on customer top-up store)</label>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-white/10">
                <button type="submit" class="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                    Save Package
                </button>
            </div>
        </form>
    </div>
</x-admin-layout>

