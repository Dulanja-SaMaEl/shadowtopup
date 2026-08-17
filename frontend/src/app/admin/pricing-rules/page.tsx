'use client';

import { useState } from 'react';
import { Sliders, AlertTriangle, Info } from 'lucide-react';

export default function AdminPricingRulesPage() {
  const [basePrice, setBasePrice] = useState('7100.00');
  const [markupType, setMarkupType] = useState('Percentage (%)');
  const [normalMarkup, setNormalMarkup] = useState('6.00');
  const [silverMarkup, setSilverMarkup] = useState('3.00');
  const [goldMarkup, setGoldMarkup] = useState('2.00');
  const [msg, setMsg] = useState<string | null>(null);

  const handleUpdate = () => {
    setMsg('Catalog pricing updated & recalculated successfully!');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Pricing Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure automated local pricing formula and reseller tier markup percentages.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Box */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
              Base Price for 1300 Shells (Local Currency)
            </label>
            <div className="flex items-center rounded-xl bg-[#0e0c1f] border border-slate-800 overflow-hidden">
              <span className="px-4 py-3 bg-purple-950/40 text-purple-300 font-mono font-bold text-xs border-r border-slate-800">
                LKR
              </span>
              <input
                type="text"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-white font-mono text-sm font-bold focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-mono italic">
              Formula: Package Base Price = (Shell Cost / 1300) × Base Price.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
              Markup Engine Type
            </label>
            <select
              value={markupType}
              onChange={(e) => setMarkupType(e.target.value)}
              className="w-full px-4 py-3 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none"
            >
              <option>Percentage (%)</option>
              <option>Fixed Amount (LKR)</option>
            </select>
          </div>

          {/* 3 User Tier Inputs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                Normal User
              </label>
              <input
                type="text"
                value={normalMarkup}
                onChange={(e) => setNormalMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-cyan-400">
                Silver Reseller
              </label>
              <input
                type="text"
                value={silverMarkup}
                onChange={(e) => setSilverMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-amber-400">
                Gold Reseller
              </label>
              <input
                type="text"
                value={goldMarkup}
                onChange={(e) => setGoldMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            These profit margins apply automatically on top of the calculated base cost.
          </p>

          <button
            onClick={handleUpdate}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
          >
            Update Engine & Recalculate Catalog
          </button>

          <div className="flex items-center justify-center gap-1.5 text-red-400 text-[10px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Warning: Immediately recalculates prices for all active packages.
          </div>

          {msg && <p className="text-xs text-emerald-400 text-center font-bold">{msg}</p>}
        </div>

        {/* Right Info Box: Calculation Logic Breakdown */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" /> Calculation Logic Breakdown
          </h3>

          <div className="space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
            <p>
              <strong className="text-white font-bold">Step 1:</strong> Define the local currency cost for 1,300 Garena Shells.
            </p>
            <p>
              <strong className="text-white font-bold">Step 2:</strong> For every package with a <span className="text-purple-300 font-bold font-mono">Shell Cost</span> (e.g. 50 shells), base cost is calculated:
            </p>

            <div className="p-3 bg-[#0e0c1f] border border-purple-950/60 rounded-xl font-mono text-[11px] text-purple-300 font-bold">
              Base = (Shell Cost / 1300) × 1300_Price
            </div>

            <p>
              <strong className="text-white font-bold">Step 3:</strong> Markup percentage or fixed amount is added per customer tier (Normal, Silver, Gold).
            </p>
          </div>

          {/* Simulation Example Box */}
          <div className="p-5 rounded-2xl bg-[#0e0c1f] border border-purple-950/50 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Simulation Example
            </div>
            <div className="font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-slate-400 font-bold">1300 Shells = LKR 1,000</p>
              <p className="text-purple-300">Item: 100 Diamonds (Cost: 50 Shells)</p>
              <p className="text-slate-300">Base Cost = (50/1300) * 1000 = LKR 38.46</p>
              <p className="text-slate-200">Normal (+20%) = LKR 46.15</p>
              <p className="text-cyan-400 font-bold">Silver (+10%) = LKR 42.30</p>
              <p className="text-amber-400 font-bold">Gold (+5%) = LKR 40.38</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
