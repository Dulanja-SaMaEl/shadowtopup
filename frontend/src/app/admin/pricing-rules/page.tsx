'use client';

import { useState } from 'react';
import { Sliders, Save } from 'lucide-react';

export default function AdminPricingRulesPage() {
  const [silverDiscount, setSilverDiscount] = useState(8);
  const [goldDiscount, setGoldDiscount] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Pricing Rules & Tier Rates</h1>
        <p className="text-xs text-slate-400 mt-1">Set automatic percentage discounts for Silver and Gold reseller tiers.</p>
      </div>

      <div className="max-w-2xl p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Silver Reseller Discount (%)
            </label>
            <input
              type="number"
              value={silverDiscount}
              onChange={(e) => setSilverDiscount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
              Gold Reseller Discount (%)
            </label>
            <input
              type="number"
              value={goldDiscount}
              onChange={(e) => setGoldDiscount(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-purple-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Rules
        </button>

        {saved && (
          <p className="text-xs font-bold text-emerald-400">Pricing rules saved successfully!</p>
        )}
      </div>
    </div>
  );
}
