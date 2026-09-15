'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  Zap,
  Package,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  Hourglass,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface PackCapacity {
  id: string;
  packageName: string;
  packageType: string;
  diamondAmount: number;
  shellCost: number;
  maxPacks: number;
  status: 'low' | 'moderate' | 'healthy';
  imageUrl: string | null;
  badge: string | null;
}

interface StockEnduranceData {
  totalShellStock: number;
  accountsCount: number;
  burnRatePerHour: number;
  burnRateSource: string;
  shellsConsumed24h: number;
  ordersCount24h: number;
  enduranceHours: number;
  enduranceFormatted: string;
  estimatedDepletionFormatted: string;
  status: 'critical' | 'warning' | 'moderate' | 'healthy';
  packCapacities: PackCapacity[];
  lastUpdated: string;
}

interface Props {
  compact?: boolean;
}

export default function AdminStockEnduranceWidget({ compact = false }: Props) {
  const [data, setData] = useState<StockEnduranceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllPacks, setShowAllPacks] = useState(false);

  const fetchEndurance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock-endurance');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching stock endurance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndurance();
  }, []);

  if (!data && loading) {
    return (
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 animate-pulse text-slate-500 text-xs font-mono flex items-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
        <span>Computing live stock endurance & pack capacity...</span>
      </div>
    );
  }

  if (!data) return null;

  const isCritical = data.status === 'critical';
  const isWarning = data.status === 'warning';
  const isModerate = data.status === 'moderate';

  const displayedPacks = showAllPacks
    ? data.packCapacities
    : data.packCapacities.slice(0, 6);

  return (
    <div
      className={`rounded-3xl border relative overflow-hidden transition-all shadow-2xl ${
        isCritical
          ? 'bg-gradient-to-br from-rose-950/40 via-[#141229] to-[#0e0c1f] border-rose-500/60 shadow-rose-500/10 ring-1 ring-rose-500/30'
          : isWarning
          ? 'bg-gradient-to-br from-amber-950/30 via-[#141229] to-[#0e0c1f] border-amber-500/50 shadow-amber-500/10'
          : 'bg-gradient-to-br from-[#121028] via-[#141229] to-[#0e0c1f] border-purple-800/40 shadow-purple-950/20'
      } ${compact ? 'p-5 space-y-4' : 'p-6 space-y-6'}`}
    >
      {/* Top Laser Accent Rim */}
      <div
        className={`w-full absolute top-0 left-0 h-[2px] ${
          isCritical
            ? 'bg-gradient-to-r from-transparent via-rose-500 to-transparent'
            : isWarning
            ? 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'
            : 'bg-gradient-to-r from-transparent via-purple-500 to-cyan-400'
        }`}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCritical
                  ? 'bg-rose-500 animate-ping'
                  : isWarning
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]'
              }`}
            />
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-300">
              GARENA SHELL INVENTORY • STOCK ENDURANCE & PURCHASING CAPACITY
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${
                isCritical
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300 animate-pulse'
                  : isWarning
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300'
                  : isModerate
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                  : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
              }`}
            >
              {isCritical
                ? 'CRITICAL (< 3H RUNWAY)'
                : isWarning
                ? 'LOW RUNWAY (< 12H)'
                : isModerate
                ? 'MODERATE RUNWAY'
                : 'HEALTHY STOCK (> 24H)'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time projection of when shell inventory will be exhausted based on live order consumption rate.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchEndurance}
            disabled={loading}
            className="p-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:text-white hover:bg-purple-900/60 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Refresh Stock Endurance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <Link
            href="/admin/shell-accounts"
            className="px-3.5 py-2 rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 hover:text-white hover:bg-cyan-900/60 text-xs font-bold font-gaming uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <span>Top Up Shells</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Stock */}
        <div className="p-4 rounded-2xl bg-[#0d0b1d] border border-purple-950/60 relative overflow-hidden">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
            Current Shell Stock
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
              {data.totalShellStock.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Shells</span>
          </div>
          <span className="text-[10px] text-purple-300/70 font-mono block mt-1">
            Across {data.accountsCount} active Garena account{data.accountsCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Metric 2: Stock Endurance (Depletion Assumption) */}
        <div
          className={`p-4 rounded-2xl border relative overflow-hidden ${
            isCritical
              ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
              : isWarning
              ? 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-[#0d0b1d] border-purple-950/60'
          }`}
        >
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
            <Hourglass className="w-3 h-3 text-purple-400" /> Stock Endurance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span
              className={`text-2xl sm:text-3xl font-black font-gaming tracking-wide ${
                isCritical
                  ? 'text-rose-400 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : isWarning
                  ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                  : 'text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]'
              }`}
            >
              ~{data.enduranceFormatted}
            </span>
            <span className="text-[11px] font-mono uppercase text-slate-400">left</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            {isCritical
              ? '⚠️ Immediate stock recharge required'
              : isWarning
              ? '⚠️ Plan shell top-up today'
              : 'Safe operational buffer'}
          </span>
        </div>

        {/* Metric 3: Hourly Burn Rate */}
        <div className="p-4 rounded-2xl bg-[#0d0b1d] border border-purple-950/60 relative overflow-hidden">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" /> Hourly Burn Velocity
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ~{data.burnRatePerHour}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase font-mono">Shells/hr</span>
          </div>
          <span className="text-[10px] text-purple-300/70 font-mono block mt-1">
            {data.shellsConsumed24h.toLocaleString()} shells consumed in last 24h ({data.ordersCount24h} orders)
          </span>
        </div>

        {/* Metric 4: Projected Depletion Timestamp */}
        <div className="p-4 rounded-2xl bg-[#0d0b1d] border border-purple-950/60 relative overflow-hidden">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Projected Depletion
          </span>
          <div className="mt-1">
            <span className="text-lg sm:text-xl font-bold text-white font-mono block leading-snug">
              {data.estimatedDepletionFormatted}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            At current order fulfillment velocity
          </span>
        </div>
      </div>

      {/* Section 2: Pack Purchasing Capacity Matrix */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase font-gaming tracking-wider flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-400" />
              <span>Current Stock Purchasing Capacity (How Many Packs Can Be Fulfilled)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Maximum purchasable units of each package from the current {data.totalShellStock.toLocaleString()} Shells:
            </p>
          </div>

          {data.packCapacities.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllPacks(!showAllPacks)}
              className="text-xs font-mono font-semibold text-purple-400 hover:text-cyan-300 transition-colors shrink-0"
            >
              {showAllPacks ? 'Show Top 6 Packs' : `View All (${data.packCapacities.length}) Packs →`}
            </button>
          )}
        </div>

        {/* Capacity Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {displayedPacks.map((pack) => {
            const isZero = pack.maxPacks === 0;
            const isLow = pack.maxPacks > 0 && pack.maxPacks < 5;

            return (
              <div
                key={pack.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
                  isZero
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : isLow
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-[#0d0b1d] border-purple-950/60 hover:border-purple-500/40 hover:shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400 truncate">
                      {pack.shellCost} Shells
                    </span>
                    {pack.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-purple-950/80 text-purple-300 border border-purple-700/50">
                        {pack.badge}
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-white text-xs truncate" title={pack.packageName}>
                    {pack.packageName}
                  </h5>
                </div>

                <div className="pt-2 border-t border-purple-950/60">
                  <span className="text-[9px] font-mono uppercase text-slate-400 block">Can Fulfill</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span
                      className={`text-xl font-black font-gaming tracking-wide ${
                        isZero
                          ? 'text-rose-400'
                          : isLow
                          ? 'text-amber-300'
                          : 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                      }`}
                    >
                      {pack.maxPacks.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">packs</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

