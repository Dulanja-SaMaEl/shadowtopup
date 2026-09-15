'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchDatabaseOrders, DatabaseOrder } from '@/lib/ordersService';
import AdminStockEnduranceWidget from '@/components/AdminStockEnduranceWidget';
import {
  ShoppingBag,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Percent,
  Sparkles,
  Zap,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Sliders,
  Key,
  X,
  Check,
} from 'lucide-react';

const SHELL_UNIT_COST_LKR = 2.60; // 1 Garena Shell base cost in LKR

const recommendedPricingMatrix = [
  {
    name: '100 Diamonds',
    shells: 100,
    baseCost: 100 * SHELL_UNIT_COST_LKR, // 260 LKR
    recNormal: 350.00,
    recSilver: 320.00,
    recGold: 300.00,
    estProfit: 350.00 - (100 * SHELL_UNIT_COST_LKR), // 90 LKR
    margin: 25.7,
  },
  {
    name: '310 Diamonds',
    shells: 300,
    baseCost: 300 * SHELL_UNIT_COST_LKR, // 780 LKR
    recNormal: 1050.00,
    recSilver: 980.00,
    recGold: 920.00,
    estProfit: 1050.00 - (300 * SHELL_UNIT_COST_LKR), // 270 LKR
    margin: 25.7,
  },
  {
    name: '520 Diamonds',
    shells: 500,
    baseCost: 500 * SHELL_UNIT_COST_LKR, // 1300 LKR
    recNormal: 1750.00,
    recSilver: 1620.00,
    recGold: 1500.00,
    estProfit: 1750.00 - (500 * SHELL_UNIT_COST_LKR), // 450 LKR
    margin: 25.7,
  },
  {
    name: '1060 Diamonds',
    shells: 1000,
    baseCost: 1000 * SHELL_UNIT_COST_LKR, // 2600 LKR
    recNormal: 3450.00,
    recSilver: 3200.00,
    recGold: 3000.00,
    estProfit: 3450.00 - (1000 * SHELL_UNIT_COST_LKR), // 850 LKR
    margin: 24.6,
  },
  {
    name: '2180 Diamonds',
    shells: 2000,
    baseCost: 2000 * SHELL_UNIT_COST_LKR, // 5200 LKR
    recNormal: 6900.00,
    recSilver: 6400.00,
    recGold: 6000.00,
    estProfit: 6900.00 - (2000 * SHELL_UNIT_COST_LKR), // 1700 LKR
    margin: 24.6,
  },
  {
    name: '5600 Diamonds',
    shells: 5000,
    baseCost: 5000 * SHELL_UNIT_COST_LKR, // 13000 LKR
    recNormal: 17500.00,
    recSilver: 16200.00,
    recGold: 15000.00,
    estProfit: 17500.00 - (5000 * SHELL_UNIT_COST_LKR), // 4500 LKR
    margin: 25.7,
  },
  {
    name: 'Weekly Membership Pass',
    shells: 210,
    baseCost: 210 * SHELL_UNIT_COST_LKR, // 546 LKR
    recNormal: 650.00,
    recSilver: 600.00,
    recGold: 550.00,
    estProfit: 650.00 - (210 * SHELL_UNIT_COST_LKR), // 104 LKR
    margin: 16.0,
  },
  {
    name: 'Weekly Lite Pass',
    shells: 70,
    baseCost: 70 * SHELL_UNIT_COST_LKR, // 182 LKR
    recNormal: 280.00,
    recSilver: 250.00,
    recGold: 230.00,
    estProfit: 280.00 - (70 * SHELL_UNIT_COST_LKR), // 98 LKR
    margin: 35.0,
  },
  {
    name: 'Monthly Membership Pass',
    shells: 1050,
    baseCost: 1050 * SHELL_UNIT_COST_LKR, // 2730 LKR
    recNormal: 3200.00,
    recSilver: 3000.00,
    recGold: 2800.00,
    estProfit: 3200.00 - (1050 * SHELL_UNIT_COST_LKR), // 470 LKR
    margin: 14.7,
  },
];

export default function AdminDashboardPage() {
  const [totalSales, setTotalSales] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(0);
  const [totalUsers, setTotalUsers] = useState(8);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(25.4);
  const [recentOrders, setRecentOrders] = useState<DatabaseOrder[]>([]);

  // HL Gaming Quota State
  const [quota, setQuota] = useState<{
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    developerUid: string;
    apiKey: string;
    limitResetAt: string;
    status: 'healthy' | 'low' | 'exhausted';
  }>({
    dailyLimit: 25,
    usedToday: 11,
    remainingToday: 14,
    developerUid: 'Xv00AKjlBJMgOpxr05VP2Sreu0z1',
    apiKey: 'Kjt47EN5VEvYVa77afIsd4hEAFicFg',
    limitResetAt: '',
    status: 'healthy',
  });
  const [loadingQuota, setLoadingQuota] = useState(false);
  const [quotaModalOpen, setQuotaModalOpen] = useState(false);
  const [calibrateUsedCount, setCalibrateUsedCount] = useState(11);
  const [calibrateDailyLimit, setCalibrateDailyLimit] = useState(25);
  const [savingQuota, setSavingQuota] = useState(false);

  const loadQuota = async () => {
    setLoadingQuota(true);
    try {
      const res = await fetch('/api/admin/hlgaming-quota');
      const data = await res.json();
      if (data.success && data.quota) {
        setQuota(data.quota);
        setCalibrateUsedCount(data.quota.usedToday);
        setCalibrateDailyLimit(data.quota.dailyLimit);
      }
    } catch (err) {
      console.error('Failed to load HLGaming quota:', err);
    } finally {
      setLoadingQuota(false);
    }
  };

  const handleSaveQuotaCalibration = async () => {
    setSavingQuota(true);
    try {
      const res = await fetch('/api/admin/hlgaming-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usedToday: Number(calibrateUsedCount),
          dailyLimit: Number(calibrateDailyLimit),
        }),
      });
      const data = await res.json();
      if (data.success && data.quota) {
        setQuota(data.quota);
        setQuotaModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to update quota:', err);
    } finally {
      setSavingQuota(false);
    }
  };

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const supabase = createClient();
        
        // Fetch User Count from Supabase
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (uCount !== null && uCount > 0) setTotalUsers(uCount);

        // Fetch Live Database Orders
        const dbOrders = await fetchDatabaseOrders();
        setRecentOrders(dbOrders.slice(0, 10));

        const completedOrders = dbOrders.filter((o) => o.fulfillmentStatus === 'COMPLETED');
        const completedSum = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

        // Calculate total shell costs for completed orders
        const estimatedShellCosts = completedOrders.reduce((acc, o) => {
          const cost = o.totalAmount * 0.74; // ~74% cost, 26% profit
          return acc + cost;
        }, 0);

        const netProfit = completedSum - estimatedShellCosts;
        const salesRevenue = completedSum;
        const calculatedMargin = salesRevenue > 0 ? ((netProfit / salesRevenue) * 100) : 26.0;

        const pendingCount = dbOrders.filter((o) => o.fulfillmentStatus === 'PENDING').length;
        
        const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const todaySum = dbOrders
          .filter((o) => o.fulfillmentStatus === 'COMPLETED' && o.date === todayDateStr)
          .reduce((acc, o) => acc + o.totalAmount, 0);

        setTotalSales(salesRevenue);
        setTotalProfit(netProfit);
        setProfitMargin(calculatedMargin);
        setPendingVerification(pendingCount);
        setTodayRevenue(todaySum);
      } catch (err) {
        console.error('Error loading dashboard stats from database:', err);
      }
    }
    loadDashboardMetrics();
    loadQuota();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Live database statistics, profit analytics, and recommended pricing.</p>
        </div>

        <Link
          href="/admin/orders"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
        >
          Manage Orders
        </Link>
      </div>

      {/* Top 5 Metric Cards including Total Profit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Profit Indicator */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#141229] to-[#141229] border border-emerald-500/40 relative overflow-hidden shadow-xl shadow-emerald-500/5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> TOTAL PROFIT
              </span>
              <h3 className="text-2xl font-black text-emerald-300 font-mono">
                LKR {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold mt-1">
                <Percent className="w-3 h-3" /> +{profitMargin.toFixed(1)}% NET MARGIN
              </div>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Sales</span>
              <h3 className="text-2xl font-black text-white">LKR {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-purple-400 font-bold">All-time revenue</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending</span>
              <h3 className="text-2xl font-black text-white">{pendingVerification}</h3>
              <p className="text-[10px] text-amber-400 font-bold">Requires review</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Users</span>
              <h3 className="text-2xl font-black text-white">{totalUsers}</h3>
              <p className="text-[10px] text-pink-400 font-bold">Profiles registered</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Today's Revenue</span>
              <h3 className="text-2xl font-black text-cyan-400">LKR {todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className="text-[10px] text-cyan-400/80 font-bold">Daily gross revenue</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Garena Shell Inventory Stock Endurance & Purchasing Capacity Widget */}
      <AdminStockEnduranceWidget />

      {/* HL Gaming Player Verification API Live Quota Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121028] via-[#141229] to-[#0e0c1f] border border-purple-800/40 relative overflow-hidden shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-400">
                HL GAMING OFFICIAL API • PLAYER ID VERIFICATION QUOTA
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-extrabold uppercase tracking-wider ${
                  quota.remainingToday > 10
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : quota.remainingToday > 3
                    ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300'
                }`}
              >
                {quota.remainingToday > 10
                  ? 'Active & Healthy'
                  : quota.remainingToday > 3
                  ? 'Low Quota Warning'
                  : 'Critical / Quota Exhausted'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wide flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400 shrink-0" />
              Free Fire Regional Player Name Lookup Service
            </h2>
            <p className="text-xs text-slate-400">
              Live quota consumption tracker. Official limit: <strong className="text-slate-200 font-mono">25 requests/day</strong>. In-memory player caching preserves daily quota.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCalibrateUsedCount(quota.usedToday);
                setCalibrateDailyLimit(quota.dailyLimit);
                setQuotaModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
            >
              <Sliders className="w-3.5 h-3.5" /> Calibrate Quota
            </button>
            <button
              onClick={loadQuota}
              disabled={loadingQuota}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Quota"
            >
              <RefreshCw className={`w-4 h-4 ${loadingQuota ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Live Quota Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-950/60 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Remaining Today
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono ${
                  quota.remainingToday > 10
                    ? 'text-emerald-400'
                    : quota.remainingToday > 3
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {quota.remainingToday}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {quota.dailyLimit}</span>
            </div>
            <span className="text-[10px] text-slate-400 block font-medium">Verifications left</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-950/60 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Used Today
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                {quota.usedToday}
              </span>
              <span className="text-xs font-mono text-slate-500">requests</span>
            </div>
            <span className="text-[10px] text-cyan-400/80 block font-medium">
              {Math.round((quota.usedToday / quota.dailyLimit) * 100)}% of daily allowance
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-950/60 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Daily Limit
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                {quota.dailyLimit}
              </span>
              <span className="text-xs font-mono text-slate-500">per day</span>
            </div>
            <span className="text-[10px] text-purple-400 block font-medium">Resets daily at 00:00 UTC</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-950/60 space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Developer UID
            </span>
            <div className="font-mono text-xs font-bold text-slate-200 truncate pt-1">
              {quota.developerUid}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block">
              Key: {quota.apiKey.slice(0, 8)}... (V2.0.0 Active)
            </span>
          </div>
        </div>

        {/* Dynamic Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold">
            <span>Daily Consumption: {quota.usedToday} / {quota.dailyLimit} used ({Math.round((quota.usedToday / quota.dailyLimit) * 100)}%)</span>
            <span className={quota.remainingToday <= 5 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
              {quota.remainingToday} Requests Remaining
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                quota.remainingToday > 10
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                  : quota.remainingToday > 3
                  ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                  : 'bg-gradient-to-r from-red-600 to-pink-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(4, (quota.usedToday / quota.dailyLimit) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Quota Calibration Modal */}
      {quotaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#121028] border border-purple-800/60 rounded-3xl p-6 shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                Calibrate HL Gaming API Quota
              </h3>
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Synchronize the local counter with your official HL Gaming developer portal if manual verification requests were made.
            </p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Requests Used Today
                </label>
                <input
                  type="number"
                  min="0"
                  max={calibrateDailyLimit}
                  value={calibrateUsedCount}
                  onChange={(e) => setCalibrateUsedCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Daily Limit Allowance
                </label>
                <input
                  type="number"
                  min="1"
                  value={calibrateDailyLimit}
                  onChange={(e) => setCalibrateDailyLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Calculated Remaining:</span>
                  <span className="font-bold text-emerald-400">
                    {Math.max(0, calibrateDailyLimit - calibrateUsedCount)} requests
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveQuotaCalibration}
                disabled={savingQuota}
                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingQuota ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Update Quota Count</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setQuotaModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommended Package Pricing Matrix for Profit */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Package Profitability & Recommended Retail Pricing Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Based on Garena Shell unit cost rate of <span className="text-emerald-400 font-mono font-bold">LKR 2.60 / shell</span>
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
            Target Margin: 25% - 35%
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Package</th>
                <th className="p-4">Shell Cost</th>
                <th className="p-4">Base Cost (LKR)</th>
                <th className="p-4">Rec. Normal Price</th>
                <th className="p-4">Rec. Standard Reseller</th>
                <th className="p-4">Rec. Elite Reseller</th>
                <th className="p-4">Est. Profit / Order</th>
                <th className="p-4">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recommendedPricingMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> {item.name}
                  </td>
                  <td className="p-4 font-mono text-slate-300">{item.shells} Shells</td>
                  <td className="p-4 font-mono text-slate-400">LKR {item.baseCost.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">LKR {item.recNormal.toFixed(2)}</td>
                  <td className="p-4 font-mono text-cyan-300">LKR {item.recSilver.toFixed(2)}</td>
                  <td className="p-4 font-mono text-amber-300">LKR {item.recGold.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-emerald-300">+LKR {item.estProfit.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                      +{item.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            Recent Database Orders
          </h3>
          <Link href="/admin/orders" className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase">
            View All ›
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((order) => (
                <tr key={order.raw_id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-400">{order.id}</td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white">{order.customerName}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">LKR {order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        order.fulfillmentStatus === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : order.fulfillmentStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {order.fulfillmentStatus === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                      {order.fulfillmentStatus === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                      {order.fulfillmentStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{order.date}</td>
                  <td className="p-4">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Details ›
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
