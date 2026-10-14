'use client';

import { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, Info, Sparkles, CheckCircle2, RefreshCw, Loader2, Database, Layers, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPricingRulesPage() {
  const [basePrice, setBasePrice] = useState('3380.00');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load saved pricing rules from DB on page load
  useEffect(() => {
    async function loadPricingRules() {
      setLoadingSettings(true);
      try {
        const res = await fetch('/api/admin/pricing-rules');
        const data = await res.json();
        if (data.success && data.pricingRules) {
          const rules = data.pricingRules;
          if (rules.basePrice1300 !== undefined) setBasePrice(rules.basePrice1300.toString());
        }
      } catch (err) {
        console.error('Error fetching pricing rules from DB:', err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadPricingRules();
  }, []);

  const basePriceNum = parseFloat(basePrice) || 3380;
  const unitShellCost = basePriceNum / 1300;

  // 100 Shells sample
  const sample100ShellCost = 100 * unitShellCost;

  const handleUpdate = async () => {
    setUpdating(true);
    setMsg(null);

    try {
      const res = await fetch('/api/admin/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          basePrice1300: basePriceNum,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMsg({ type: 'success', text: data.message });
        if (data.pricingRules && data.pricingRules.basePrice1300 !== undefined) {
          setBasePrice(data.pricingRules.basePrice1300.toString());
        }
      } else {
        setMsg({ type: 'error', text: data.message || 'Failed to update base pricing' });
      }
    } catch (err: any) {
      console.error('Error updating pricing rules:', err);
      setMsg({ type: 'error', text: 'Network error updating pricing rules' });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-7 h-7 text-purple-400" /> Base Pricing Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure the 1,300 Garena Shells base price to establish unit shell costs. Admin sets package selling prices manually.
          </p>
        </div>

        {loadingSettings ? (
          <div className="px-4 py-2 rounded-xl bg-purple-950/40 border border-purple-800/40 text-purple-300 text-xs font-mono font-bold flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> Loading saved settings...
          </div>
        ) : (
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" /> Synced with Database
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Box */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
              Base Price for 1,300 Garena Shells (LKR)
            </label>
            <div className="flex items-center rounded-xl bg-[#0e0c1f] border border-slate-800 overflow-hidden focus-within:border-purple-500 transition-colors">
              <span className="px-4 py-3 bg-purple-950/40 text-purple-300 font-mono font-bold text-xs border-r border-slate-800">
                LKR
              </span>
              <input
                type="text"
                disabled={loadingSettings}
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-white font-mono text-sm font-bold focus:outline-none disabled:opacity-50"
                placeholder="e.g. 3380.00"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
              <span>Formula: Unit Cost = Base Price / 1300</span>
              <span className="text-emerald-400 font-bold">1 Shell = LKR {unitShellCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/40 space-y-2">
            <div className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Manual Package Pricing
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Automated package price overwriting is disabled. You set selling prices manually for each tier (Normal Customer, Standard Reseller, and Elite Reseller) directly under{' '}
              <Link href="/admin/packages" className="text-cyan-400 underline font-semibold hover:text-cyan-300">
                Packages Management
              </Link>
              . Profits for each tier are calculated dynamically from this 1,300 shells base price.
            </p>
          </div>

          <button
            onClick={handleUpdate}
            disabled={updating || loadingSettings}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {updating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving 1,300 Shells Base Price...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Save 1,300 Shells Base Price
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Updates stock value &amp; package profit margins immediately
            </span>
            <Link href="/admin/packages" className="text-purple-400 hover:text-purple-300 underline flex items-center gap-1">
              Go to Packages <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {msg && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}
            >
              {msg.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
              {msg.text}
            </div>
          )}
        </div>

        {/* Right Info Box: Calculation Logic Breakdown */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" /> Calculation Formula Breakdown
          </h3>

          <div className="space-y-4 text-xs text-slate-300 font-sans leading-relaxed">
            <p>
              <strong className="text-white font-bold">Step 1:</strong> Define the local currency cost for 1,300 Garena Shells (e.g. LKR {basePriceNum.toFixed(2)}).
            </p>
            <p>
              <strong className="text-white font-bold">Step 2:</strong> Unit Shell Cost is derived from the standard 1,300 pack ratio:
            </p>

            <div className="p-3 bg-[#0e0c1f] border border-purple-950/60 rounded-xl font-mono text-[11px] text-purple-300 font-bold">
              Unit Shell Cost = LKR {basePriceNum.toFixed(2)} / 1,300 = LKR {unitShellCost.toFixed(2)} / Shell
            </div>

            <p>
              <strong className="text-white font-bold">Step 3:</strong> Base Cost for any package is calculated as:
            </p>

            <div className="p-3 bg-[#0e0c1f] border border-purple-950/60 rounded-xl font-mono text-[11px] text-purple-300 font-bold">
              Package Shell Cost = Package Shells × Unit Shell Cost
            </div>

            <p>
              <strong className="text-white font-bold">Step 4:</strong> Profits for each customer and reseller tier update dynamically based on the manually entered price:
            </p>

            <div className="p-3 bg-[#0e0c1f] border border-purple-950/60 rounded-xl font-mono text-[10px] text-slate-300 space-y-1">
              <div><span className="text-emerald-400 font-bold">Customer Profit</span> = Normal Selling Price - Package Shell Cost</div>
              <div><span className="text-cyan-300 font-bold">Standard Reseller Profit</span> = Standard Selling Price - Package Shell Cost</div>
              <div><span className="text-amber-300 font-bold">Elite Reseller Profit</span> = Elite Selling Price - Package Shell Cost</div>
            </div>
          </div>

          {/* Simulation Example Box */}
          <div className="p-5 rounded-2xl bg-[#0e0c1f] border border-purple-950/50 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-purple-400" /> Live Formula Preview (100 Shells / 100 Diamonds)
            </div>
            <div className="font-mono text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p className="text-slate-400 font-bold">1,300 Shells = LKR {basePriceNum.toFixed(2)} (LKR {unitShellCost.toFixed(2)}/shell)</p>
              <p className="text-purple-300">Base Cost (100 Shells) = LKR {sample100ShellCost.toFixed(2)}</p>
              <p className="text-emerald-400 font-bold">
                Customer Profit = Manual Normal Price - LKR {sample100ShellCost.toFixed(2)}
              </p>
              <p className="text-cyan-300 font-bold">
                Standard Reseller Profit = Manual Standard Price - LKR {sample100ShellCost.toFixed(2)}
              </p>
              <p className="text-amber-300 font-bold">
                Elite Reseller Profit = Manual Elite Price - LKR {sample100ShellCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
