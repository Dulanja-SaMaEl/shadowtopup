<x-admin-layout>
    <div class="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
            <h2 class="text-3xl font-black text-white uppercase tracking-tight">Free Fire Packages</h2>
            <p class="text-gray-400 text-sm mt-1">Manage Garena Shell cost structures and tiered prices (Normal / Silver / Gold).</p>
        </div>
        
        <a href="{{ route('admin.packages.create') }}" class="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            <span>Add Package</span>
        </a>
    </div>

    <div class="glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-white/5 text-[11px] text-gray-400 font-bold uppercase tracking-widest border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">Package Name</th>
                        <th class="px-6 py-4">Type</th>
                        <th class="px-6 py-4">Shell Cost</th>
                        <th class="px-6 py-4">Calculated Prices (N / S / G)</th>
                        <th class="px-6 py-4">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="text-sm text-gray-300 divide-y divide-white/5">
                    @forelse($packages as $package)
                        <tr class="hover:bg-white/5 transition-colors">
                            <td class="px-6 py-4">
                                <div class="font-bold text-white text-base">{{ $package->package_name }}</div>
                                @if($package->package_type === 'diamond')
                                    <div class="text-[10px] text-purple-400 font-mono font-bold mt-0.5">{{ number_format($package->diamond_amount) }} Diamonds</div>
                                @endif
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-3 py-1 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                                    {{ $package->package_type }}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-mono font-black text-purple-400 text-base">
                                {{ number_format($package->shell_cost) }}
                            </td>
                            <td class="px-6 py-4 font-mono text-xs space-y-0.5">
                                <div class="text-gray-300"><span class="text-gray-500 font-bold">N:</span> LKR {{ number_format($package->normal_price, 2) }}</div>
                                <div class="text-cyan-300"><span class="text-cyan-500/60 font-bold">S:</span> LKR {{ number_format($package->silver_price, 2) }}</div>
                                <div class="text-amber-400"><span class="text-amber-500/60 font-bold">G:</span> LKR {{ number_format($package->gold_price, 2) }}</div>
                            </td>
                            <td class="px-6 py-4">
                                @if($package->is_active)
                                    <span class="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                                @else
                                    <span class="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">Inactive</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="{{ route('admin.packages.edit', $package) }}" class="p-2 text-purple-300 hover:text-white bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl transition" title="Edit Package">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </a>
                                    <form action="{{ route('admin.packages.destroy', $package) }}" method="POST" onsubmit="return confirm('Delete this package?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="p-2 text-rose-400 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition" title="Delete Package">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" class="px-6 py-8 text-center text-gray-400 text-sm">No Free Fire packages configured.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</x-admin-layout>

