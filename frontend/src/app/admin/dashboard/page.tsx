'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchDatabaseOrders, DatabaseOrder } from '@/lib/ordersService';
import AdminStockEnduranceWidget from '@/components/AdminStockEnduranceWidget';
import {
  ExpectedProfitsConfig,
  DEFAULT_EXPECTED_PROFITS,
} from '@/lib/expectedProfitsConfig';
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
  Award,
  Trophy,
  Calculator,
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
  const [allDbOrders, setAllDbOrders] = useState<DatabaseOrder[]>([]);

  // Expected Profits & Dynamic Package Breakdown State
  const [expectedProfits, setExpectedProfits] = useState<ExpectedProfitsConfig>(DEFAULT_EXPECTED_PROFITS);
  const [editingProfits, setEditingProfits] = useState<ExpectedProfitsConfig>(DEFAULT_EXPECTED_PROFITS);
  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [savingProfits, setSavingProfits] = useState(false);

  const [profitBreakdown, setProfitBreakdown] = useState({
    weekly: { count: 0, sales: 0, profit: 0 },
    monthly: { count: 0, sales: 0, profit: 0 },
    lite: { count: 0, sales: 0, profit: 0 },
    etc: { count: 0, sales: 0, profit: 0 },
  });

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

  // Dynamic calculation of order expected profit
  function classifyAndCalculateOrderProfit(order: DatabaseOrder, config: ExpectedProfitsConfig) {
    const name = (order.package_name || '').toLowerCase();

    if (name.includes('lite')) {
      const units = Math.max(1, Math.round(order.totalAmount / 140));
      return { category: 'lite' as const, profit: units * (config.lite ?? 93), units };
    }

    if (name.includes('weekly')) {
      const units = Math.max(1, Math.round(order.totalAmount / 650));
      return { category: 'weekly' as const, profit: units * (config.weekly ?? 104), units };
    }

    if (name.includes('monthly')) {
      const units = Math.max(1, Math.round(order.totalAmount / 3200));
      return { category: 'monthly' as const, profit: units * (config.monthly ?? 470), units };
    }

    // Specific diamond packages
    if (name.includes('100 ') || name.includes('100 diamonds') || name.includes('100d')) {
      const units = Math.max(1, Math.round(order.totalAmount / 350));
      return { category: 'etc' as const, profit: units * (config.d100 ?? 90), units };
    }
    if (name.includes('310')) {
      const units = Math.max(1, Math.round(order.totalAmount / 1050));
      return { category: 'etc' as const, profit: units * (config.d310 ?? 270), units };
    }
    if (name.includes('520')) {
      const units = Math.max(1, Math.round(order.totalAmount / 1750));
      return { category: 'etc' as const, profit: units * (config.d520 ?? 450), units };
    }
    if (name.includes('1060')) {
      const units = Math.max(1, Math.round(order.totalAmount / 3450));
      return { category: 'etc' as const, profit: units * (config.d1060 ?? 850), units };
    }
    if (name.includes('2180')) {
      const units = Math.max(1, Math.round(order.totalAmount / 6900));
      return { category: 'etc' as const, profit: units * (config.d2180 ?? 1700), units };
    }
    if (name.includes('5600')) {
      const units = Math.max(1, Math.round(order.totalAmount / 17500));
      return { category: 'etc' as const, profit: units * (config.d5600 ?? 4500), units };
    }
    if (name.includes('11500')) {
      const units = Math.max(1, Math.round(order.totalAmount / 34000));
      return { category: 'etc' as const, profit: units * (config.d11500 ?? 9200), units };
    }

    // Fallback for general diamonds / custom orders
    const fallbackProfit = (order.totalAmount * (config.fallbackMarginPercent ?? 26.0)) / 100;
    return { category: 'etc' as const, profit: fallbackProfit, units: 1 };
  }

  function recalculateProfitsWithOrders(orders: DatabaseOrder[], config: ExpectedProfitsConfig) {
    const completedOrders = orders.filter((o) => o.fulfillmentStatus === 'COMPLETED');
    const completedSum = completedOrders.reduce((acc, o) => acc + o.totalAmount, 0);

    let wCount = 0, wSales = 0, wProfit = 0;
    let mCount = 0, mSales = 0, mProfit = 0;
    let lCount = 0, lSales = 0, lProfit = 0;
    let eCount = 0, eSales = 0, eProfit = 0;

    completedOrders.forEach((o) => {
      const res = classifyAndCalculateOrderProfit(o, config);
      if (res.category === 'weekly') {
        wCount += res.units;
        wSales += o.totalAmount;
        wProfit += res.profit;
      } else if (res.category === 'monthly') {
        mCount += res.units;
        mSales += o.totalAmount;
        mProfit += res.profit;
      } else if (res.category === 'lite') {
        lCount += res.units;
        lSales += o.totalAmount;
        lProfit += res.profit;
      } else {
        eCount += res.units;
        eSales += o.totalAmount;
        eProfit += res.profit;
      }
    });

    const netProfit = wProfit + mProfit + lProfit + eProfit;
    const salesRevenue = completedSum;
    const calculatedMargin = salesRevenue > 0 ? ((netProfit / salesRevenue) * 100) : 26.0;

    setProfitBreakdown({
      weekly: { count: wCount, sales: wSales, profit: wProfit },
      monthly: { count: mCount, sales: mSales, profit: mProfit },
      lite: { count: lCount, sales: lSales, profit: lProfit },
      etc: { count: eCount, sales: eSales, profit: eProfit },
    });

    setTotalSales(salesRevenue);
    setTotalProfit(netProfit);
    setProfitMargin(calculatedMargin);
  }

  const loadExpectedProfits = async () => {
    let currentConfig = DEFAULT_EXPECTED_PROFITS;
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('shadow_expected_profits');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.weekly === 'number') {
            currentConfig = { ...DEFAULT_EXPECTED_PROFITS, ...parsed };
            setExpectedProfits(currentConfig);
            setEditingProfits(currentConfig);
          }
        }
      }

      const res = await fetch('/api/admin/expected-profits');
      const data = await res.json();
      if (data.success && data.profits) {
        currentConfig = { ...DEFAULT_EXPECTED_PROFITS, ...data.profits };
        setExpectedProfits(currentConfig);
        setEditingProfits(currentConfig);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shadow_expected_profits', JSON.stringify(currentConfig));
        }
      }
    } catch (e) {
      console.warn('Note loading expected profits:', e);
    }
    return currentConfig;
  };

  const handleSaveExpectedProfits = async () => {
    setSavingProfits(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('shadow_expected_profits', JSON.stringify(editingProfits));
      }
      setExpectedProfits(editingProfits);
      recalculateProfitsWithOrders(allDbOrders, editingProfits);

      await fetch('/api/admin/expected-profits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProfits),
      });

      setProfitModalOpen(false);
    } catch (err) {
      console.error('Failed to save expected profits:', err);
    } finally {
      setSavingProfits(false);
    }
  };

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

        // Fetch configured expected profits
        const currentProfits = await loadExpectedProfits();

        // Fetch Live Database Orders
        const dbOrders = await fetchDatabaseOrders();
        setAllDbOrders(dbOrders);
        setRecentOrders(dbOrders.slice(0, 10));

        // Recalculate profit metrics using formula: Weekly + Monthly + Lite + Etc
        recalculateProfitsWithOrders(dbOrders, currentProfits);

        const pendingCount = dbOrders.filter((o) => o.fulfillmentStatus === 'PENDING').length;
        
        const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const todaySum = dbOrders
          .filter((o) => o.fulfillmentStatus === 'COMPLETED' && o.date === todayDateStr)
          .reduce((acc, o) => acc + o.totalAmount, 0);

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
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-[#141229] to-[#141229] border border-emerald-500/40 relative overflow-hidden shadow-xl shadow-emerald-500/5 group hover:border-emerald-500/70 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> TOTAL PROFIT
                </span>
                <button
                  onClick={() => {
                    setEditingProfits({ ...expectedProfits });
                    setProfitModalOpen(true);
                  }}
                  className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-[9px] font-mono text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all"
                  title="Configure Expected Profit Formula"
                >
                  <Sliders className="w-2.5 h-2.5" /> Formula
                </button>
              </div>
              <h3 className="text-2xl font-black text-emerald-300 font-mono">
                LKR {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <div className="flex flex-col gap-1 mt-1">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold w-fit">
                  <Percent className="w-3 h-3" /> +{profitMargin.toFixed(1)}% NET MARGIN
                </div>
                <span className="text-[9px] font-mono text-slate-400 truncate">
                  Weekly + Monthly + Lite + Etc.
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingProfits({ ...expectedProfits });
                setProfitModalOpen(true);
              }}
              className="w-10 h-10 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 transition-transform active:scale-95"
              title="Edit Expected Profit Formula"
            >
              <TrendingUp className="w-5 h-5" />
            </button>
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

      {/* Package Profit Indicators (Formula Breakdown: Weekly, Monthly, Lite, +Etc.) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#141229] via-[#121026] to-[#0d0b1a] border border-purple-900/40 space-y-5 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Package Profit Indicators (Formula Breakdown)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                Weekly + Monthly + Lite + Etc.
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live realized profits calculated dynamically per package using your expected profit formula.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingProfits({ ...expectedProfits });
              setProfitModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            Manually Set Expected Profit
          </button>
        </div>

        {/* The 4 Category Profit Indicator Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {/* Card 1: Weekly Pass Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-blue-500/30 relative overflow-hidden group hover:border-blue-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
                  Weekly Pass Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.weekly.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                {profitBreakdown.weekly.count} passes
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Expected / Unit:</span>
                <span className="text-blue-300 font-bold">LKR {expectedProfits.weekly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.weekly.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: units × expected profit
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Pass Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Monthly Pass Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.monthly.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                {profitBreakdown.monthly.count} passes
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Expected / Unit:</span>
                <span className="text-amber-300 font-bold">LKR {expectedProfits.monthly.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.monthly.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: units × expected profit
              </div>
            </div>
          </div>

          {/* Card 3: Weekly Lite Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-purple-500/30 relative overflow-hidden group hover:border-purple-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                  Lite Pass Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.lite.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                {profitBreakdown.lite.count} passes
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Expected / Unit:</span>
                <span className="text-purple-300 font-bold">LKR {expectedProfits.lite.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.lite.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: units × expected profit
              </div>
            </div>
          </div>

          {/* Card 4: +Etc. Diamonds Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-emerald-500/30 relative overflow-hidden group hover:border-emerald-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  +Etc. Diamonds Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.etc.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                {profitBreakdown.etc.count} orders
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Expected Margin:</span>
                <span className="text-emerald-300 font-bold">Configured / ~{expectedProfits.fallbackMarginPercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.etc.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: 100d–11500d + margin
              </div>
            </div>
          </div>
        </div>

        {/* Formula Equation Summary Strip */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <span className="text-slate-500 font-bold">FORMULA:</span>
            <span className="text-white font-black">Total Profit</span>
            <span className="text-slate-500">=</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Weekly ({profitBreakdown.weekly.profit.toFixed(0)} LKR)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Monthly ({profitBreakdown.monthly.profit.toFixed(0)} LKR)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Lite ({profitBreakdown.lite.profit.toFixed(0)} LKR)
            </span>
            <span className="text-slate-500">+</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              +Etc. ({profitBreakdown.etc.profit.toFixed(0)} LKR)
            </span>
          </div>

          <div className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Net Realized: LKR {totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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

      {/* Manual Expected Profit Formula Configurator Modal */}
      {profitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#121028] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-white my-8 max-h-[90vh] flex flex-col space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-800 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Manual Expected Profit Formula Configurator
                  </h3>
                </div>
                <p className="text-xs text-slate-400">
                  Manually define expected net profit per package. Total Profit updates dynamically using:{' '}
                  <span className="text-emerald-400 font-mono font-bold">Weekly + Monthly + Lite + Etc.</span>
                </p>
              </div>
              <button
                onClick={() => setProfitModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shrink-0 ml-3"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto pr-2 space-y-6 flex-1">
              {/* Category 1: Memberships & Passes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-blue-300">
                    Membership Passes (Expected Net Profit / Unit)
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Weekly */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      Weekly Pass (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.weekly}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, weekly: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-[9px] text-slate-400">Default: 104 LKR (Retail ~650)</p>
                  </div>

                  {/* Monthly */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Monthly Pass (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.monthly}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, monthly: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[9px] text-slate-400">Default: 470 LKR (Retail ~3,200)</p>
                  </div>

                  {/* Weekly Lite */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                      Lite Pass (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.lite}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, lite: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                    />
                    <p className="text-[9px] text-slate-400">Default: 93 LKR (Retail ~240)</p>
                  </div>
                </div>
              </div>

              {/* Category 2: Diamonds Packages (+Etc) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                    +Etc. Diamonds Top-Up Packages (Expected Net Profit / Order)
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* 100 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      100 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d100}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d100: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 90 LKR</p>
                  </div>

                  {/* 310 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      310 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d310}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d310: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 270 LKR</p>
                  </div>

                  {/* 520 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      520 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d520}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d520: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 450 LKR</p>
                  </div>

                  {/* 1060 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      1,060 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d1060}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d1060: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 850 LKR</p>
                  </div>

                  {/* 2180 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      2,180 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d2180}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d2180: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 1,700 LKR</p>
                  </div>

                  {/* 5600 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      5,600 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d5600}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d5600: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 4,500 LKR</p>
                  </div>

                  {/* 11500 Diamonds */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-300 font-bold block">
                      11,500 Diamonds
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits.d11500}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({ ...prev, d11500: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 9,200 LKR</p>
                  </div>

                  {/* Fallback % */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                    <label className="text-[10px] font-mono uppercase text-emerald-300 font-bold block">
                      Custom Margin (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="100"
                      value={editingProfits.fallbackMarginPercent}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          fallbackMarginPercent: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: 26.0%</p>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Simulation Preview */}
              {(() => {
                const completedOrders = allDbOrders.filter((o) => o.fulfillmentStatus === 'COMPLETED');
                let simW = 0, simM = 0, simL = 0, simE = 0;
                completedOrders.forEach((o) => {
                  const res = classifyAndCalculateOrderProfit(o, editingProfits);
                  if (res.category === 'weekly') simW += res.profit;
                  else if (res.category === 'monthly') simM += res.profit;
                  else if (res.category === 'lite') simL += res.profit;
                  else simE += res.profit;
                });
                const simTotal = simW + simM + simL + simE;
                const diff = simTotal - totalProfit;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950/30 to-slate-950 border border-emerald-500/40 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live Simulation on Database Orders:
                      </span>
                      <span className="text-emerald-300 font-black text-sm">
                        LKR {simTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                      <span>Weekly: LKR {simW.toFixed(0)}</span>
                      <span>Monthly: LKR {simM.toFixed(0)}</span>
                      <span>Lite: LKR {simL.toFixed(0)}</span>
                      <span>+Etc: LKR {simE.toFixed(0)}</span>
                      <span className={diff >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                        {diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} LKR delta
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setEditingProfits({ ...DEFAULT_EXPECTED_PROFITS })}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all"
              >
                Reset to Recommended Defaults
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setProfitModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpectedProfits}
                  disabled={savingProfits}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-900/30 active:scale-95"
                >
                  {savingProfits ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving & Applying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save & Apply Formula</span>
                    </>
                  )}
                </button>
              </div>
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
