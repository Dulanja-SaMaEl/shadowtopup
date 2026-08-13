<x-admin-layout>
    <div class="mb-10">
        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Pricing Settings</h2>
        <p class="text-gray-400 text-sm mt-1">Configure automated local pricing formula and reseller tier markup percentages.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Settings Form -->
        <div class="glass-card rounded-2xl border border-white/10 shadow-2xl p-8">
            <form action="{{ route('admin.pricing.update') }}" method="POST">
                @csrf
                <div class="space-y-6">
                    <div class="pb-6 border-b border-white/10">
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Base Price for 1300 Shells (Local Currency)</label>
                        <div class="flex items-center">
                            <span class="px-4 py-3 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-purple-400 font-mono font-bold text-xs">LKR</span>
                            <input type="number" step="0.01" name="shells_1300_price" value="{{ old('shells_1300_price', $setting->shells_1300_price) }}" class="w-full bg-white/5 border-white/10 rounded-r-xl focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-base font-bold" required>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">Formula: Package Base Price = (Shell Cost / 1300) × Base Price.</p>
                    </div>

                    <div>
                        <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Markup Engine Type</label>
                        <select name="markup_type" class="w-full bg-white/5 border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-white font-bold text-sm" required>
                            <option value="percent" {{ old('markup_type', $setting->markup_type) == 'percent' ? 'selected' : '' }} class="bg-gray-900 text-white">Percentage (%)</option>
                            <option value="fixed" {{ old('markup_type', $setting->markup_type) == 'fixed' ? 'selected' : '' }} class="bg-gray-900 text-white">Fixed Amount (LKR)</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div>
                            <label class="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Normal User</label>
                            <input type="number" step="0.01" name="markup_normal" value="{{ old('markup_normal', $setting->markup_normal) }}" class="w-full bg-white/5 border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-white font-mono text-sm font-bold" required>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-2">Silver Reseller</label>
                            <input type="number" step="0.01" name="markup_silver" value="{{ old('markup_silver', $setting->markup_silver) }}" class="w-full bg-white/5 border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-cyan-300 font-mono text-sm font-bold" required>
                        </div>
                        <div>
                            <label class="block text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-2">Gold Reseller</label>
                            <input type="number" step="0.01" name="markup_gold" value="{{ old('markup_gold', $setting->markup_gold) }}" class="w-full bg-white/5 border-white/10 rounded-xl focus:ring-purple-500 focus:border-purple-500 text-amber-300 font-mono text-sm font-bold" required>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400">These profit margins apply automatically on top of the calculated base cost.</p>
                </div>

                <div class="mt-8 pt-6 border-t border-white/10">
                    <button type="submit" class="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition shadow-lg shadow-purple-600/20">
                        Update Engine & Recalculate Catalog
                    </button>
                    <p class="text-xs text-rose-400 mt-3 text-center font-bold flex items-center justify-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>Warning: Immediately recalculates prices for all active packages.</span>
                    </p>
                </div>
            </form>
        </div>

        <!-- Explanation Card -->
        <div class="glass-card rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col justify-between">
            <div>
                <h3 class="text-base font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Calculation Logic Breakdown
                </h3>
                <div class="space-y-4 text-xs text-gray-300">
                    <p><strong class="text-white">Step 1:</strong> Define the local currency cost for 1,300 Garena Shells.</p>
                    <p><strong class="text-white">Step 2:</strong> For every package with a <span class="font-mono text-purple-400 font-bold">Shell Cost</span> (e.g. 50 shells), base cost is calculated: <br>
                        <code class="bg-white/10 text-purple-300 font-mono px-2.5 py-1 rounded-md text-[11px] inline-block mt-1">Base = (Shell Cost / 1300) × 1300_Price</code>
                    </p>
                    <p><strong class="text-white">Step 3:</strong> Markup percentage or fixed amount is added per customer tier (Normal, Silver, Gold).</p>
                </div>
            </div>

            <div class="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30 mt-6">
                <h4 class="font-extrabold text-purple-300 uppercase tracking-widest text-[10px] mb-2 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    Simulation Example
                </h4>
                <ul class="text-xs space-y-1 font-mono text-purple-200">
                    <li>1300 Shells = LKR 1,000</li>
                    <li>Item: 100 Diamonds (Cost: 50 Shells)</li>
                    <li>Base Cost = (50/1300) * 1000 = LKR 38.46</li>
                    <li>Normal (+20%) = LKR 46.15</li>
                    <li>Silver (+10%) = LKR 42.30</li>
                    <li>Gold (+5%) = LKR 40.38</li>
                </ul>
            </div>
        </div>
    </div>
</x-admin-layout>

