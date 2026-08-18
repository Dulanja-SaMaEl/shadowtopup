'use client';

import { useState } from 'react';
import { Sliders, AlertTriangle, Info, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminPricingRulesPage() {
  const [basePrice, setBasePrice] = useState('3380.00'); // 1300 Shells = 3380 LKR (2.60 LKR / shell)
  const [markupType, setMarkupType] = useState('Percentage (%)');
  const [normalMarkup, setNormalMarkup] = useState('35.00');
  const [silverMarkup, setSilverMarkup] = useState('23.00');
  const [goldMarkup, setGoldMarkup] = useState('15.00');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live simulation calculations
  const basePriceNum = parseFloat(basePrice) || 3380;
  const unitShellCost = basePriceNum / 1300;
  
  const sample100ShellCost = 100 * unitShellCost; // 260 LKR
  const sample100Normal = sample100ShellCost * (1 + (parseFloat(normalMarkup) || 35) / 100);
  const sample100Silver = sample100ShellCost * (1 + (parseFloat(silverMarkup) || 23) / 100);
  const sample100Gold = sample100ShellCost * (1 + (parseFloat(goldMarkup) || 15) / 100);

  const handleUpdate = async () => {
    setUpdating(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice1300: basePriceNum,
          normalMarkup: parseFloat(normalMarkup) || 35,
          silverMarkup: parseFloat(silverMarkup) || 23,
          goldMarkup: parseFloat(goldMarkup) || 15,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update catalog prices' });
      }
    } catch (err: any) {
      console.error('Error updating pricing rules:', err);
      setMsg({ type: 'error', text: 'Network error updating pricing rules' });
    }

    setUpdating(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Pricing Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure automated local pricing formula and reseller tier markup percentages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Box */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
              Base Price for 1,300 Shells (Local Currency LKR)
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
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Formula: Unit Cost = Base Price / 1300</span>
              <span className="text-emerald-400 font-bold">1 Shell = LKR {unitShellCost.toFixed(2)}</span>
            </div>
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
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">
                Normal User (%)
              </label>
              <input
                type="text"
                value={normalMarkup}
                onChange={(e) => setNormalMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-cyan-400">
                Silver Reseller (%)
              </label>
              <input
                type="text"
                value={silverMarkup}
                onChange={(e) => setSilverMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-amber-400">
                Gold Reseller (%)
              </label>
              <input
                type="text"
                value={goldMarkup}
                onChange={(e) => setGoldMarkup(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-amber-300 font-mono text-xs font-bold text-center focus:outline-none"
              />
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            These profit margins apply automatically on top of the calculated Garena Shell base cost across all database packages.
          </p>

          <button
            onClick={handleUpdate}
            disabled={updating}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Recalculating Database Packages...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Update Engine & Recalculate Catalog
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-amber-400 text-[10px] font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Immediately recalculates prices for all active database packages.
          </div>

          {msg && (
            <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {msg.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {msg.text}
            </div>
          )}
        </div>

        {/* Right Info Box: Calculation Logic Breakdown */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" /> Calculation Logic Breakdown
          </h3>

          <div className="space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
            <p>
              <strong className="text-white font-bold">Step 1:</strong> Define the local currency cost for 1,300 Garena Shells.
            </p>
            <p>
              <strong className="text-white font-bold">Step 2:</strong> For every package with a <span className="text-purple-300 font-bold font-mono">Shell Cost</span> (e.g. 100 shells), base cost is calculated:
            </p>

            <div className="p-3 bg-[#0e0c1f] border border-purple-950/60 rounded-xl font-mono text-[11px] text-purple-300 font-bold">
              Base Cost = Shell Cost × (Base Price / 1300)
            </div>

            <p>
              <strong className="text-white font-bold">Step 3:</strong> Markup percentage is added per customer tier (Normal, Silver, Gold).
            </p>
          </div>

          {/* Simulation Example Box */}
          <div className="p-5 rounded-2xl bg-[#0e0c1f] border border-purple-950/50 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Live Formula Preview (100 Diamonds / 100 Shells)
            </div>
            <div className="font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-slate-400 font-bold">1,300 Shells = LKR {basePriceNum.toFixed(2)} (LKR {unitShellCost.toFixed(2)}/shell)</p>
              <p className="text-purple-300">Base Shell Cost (100 Shells) = LKR {sample100ShellCost.toFixed(2)}</p>
              <p className="text-emerald-400 font-bold">Normal Price (+{normalMarkup}%): LKR {sample100Normal.toFixed(2)}</p>
              <p className="text-cyan-300 font-bold">Silver Reseller (+{silverMarkup}%): LKR {sample100Silver.toFixed(2)}</p>
              <p className="text-amber-300 font-bold">Gold Reseller (+{goldMarkup}%): LKR {sample100Gold.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
