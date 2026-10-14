'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchDatabaseOrders, DatabaseOrder } from '@/lib/ordersService';
import AdminStockEnduranceWidget from '@/components/AdminStockEnduranceWidget';
import { Package } from '@/types/database';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';
import {
  ExpectedProfitsConfig,
  MultiTierExpectedProfitsConfig,
  ExpectedProfitsTierConfig,
  UserTier,
  DEFAULT_EXPECTED_PROFITS,
  DEFAULT_TIER_PROFITS,
  getTierProfitConfig,
  normalizeExpectedProfits,
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
  Boxes,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalUsers, setTotalUsers] = useState(8);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);
  const [profitMargin, setProfitMargin] = useState(25.4);
  const [recentOrders, setRecentOrders] = useState<DatabaseOrder[]>([]);
  const [allDbOrders, setAllDbOrders] = useState<DatabaseOrder[]>([]);
  const [totalShellStock, setTotalShellStock] = useState(6495);
  const [basePrice1300, setBasePrice1300] = useState(3380);
  const [dbPackages, setDbPackages] = useState<Package[]>([]);

  const unitShellCost = (basePrice1300 || 3380) / 1300;
  const currentStockValueLkr = totalShellStock * unitShellCost;

  const displayPackages = dbPackages.length > 0 ? dbPackages : OFFICIAL_GARENA_PACKAGES;
  const pricingMatrixRows = displayPackages.map((pkg) => {
    const shells = pkg.shell_cost || 0;
    const baseCost = shells * unitShellCost;
    const recNormal = Number(pkg.normal_price) || 0;
    const recSilver = Number(pkg.silver_price) || recNormal;
    const recGold = Number(pkg.gold_price) || recNormal;
    const estProfit = recNormal - baseCost;
    const margin = recNormal > 0 ? (estProfit / recNormal) * 100 : 0;
    return {
      id: pkg.id,
      name: pkg.package_name,
      shells,
      baseCost,
      recNormal,
      recSilver,
      recGold,
      estProfit,
      margin,
    };
  });

  // Expected Profits & Dynamic Package Breakdown State
  const [expectedProfits, setExpectedProfits] = useState<ExpectedProfitsConfig>(DEFAULT_EXPECTED_PROFITS);
  const [editingProfits, setEditingProfits] = useState<ExpectedProfitsConfig>(DEFAULT_EXPECTED_PROFITS);
  const [profitModalOpen, setProfitModalOpen] = useState(false);
  const [savingProfits, setSavingProfits] = useState(false);
  const [activeTierTab, setActiveTierTab] = useState<UserTier>('normal');

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

  // Dynamic calculation of order expected profit based on customer tier
  function classifyAndCalculateOrderProfit(order: DatabaseOrder, config: ExpectedProfitsConfig) {
    const role: UserTier = (order.customerRole === 'gold' || order.customerRole === 'silver') ? order.customerRole : 'normal';
    const tierConfig: ExpectedProfitsTierConfig = getTierProfitConfig(config, role);
    const name = (order.package_name || '').toLowerCase();

    if (name.includes('lite')) {
      const denom = role === 'gold' ? 230 : role === 'silver' ? 250 : 280;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'lite' as const, profit: units * (tierConfig.lite ?? 93), units, tier: role };
    }

    if (name.includes('weekly')) {
      const denom = role === 'gold' ? 550 : role === 'silver' ? 600 : 650;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'weekly' as const, profit: units * (tierConfig.weekly ?? 104), units, tier: role };
    }

    if (name.includes('monthly')) {
      const denom = role === 'gold' ? 2800 : role === 'silver' ? 3000 : 3200;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'monthly' as const, profit: units * (tierConfig.monthly ?? 470), units, tier: role };
    }

    // Specific diamond packages
    if (name.includes('100 ') || name.includes('100 diamonds') || name.includes('100d')) {
      const denom = role === 'gold' ? 300 : role === 'silver' ? 320 : 350;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d100 ?? 90), units, tier: role };
    }
    if (name.includes('310')) {
      const denom = role === 'gold' ? 920 : role === 'silver' ? 980 : 1050;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d310 ?? 270), units, tier: role };
    }
    if (name.includes('520')) {
      const denom = role === 'gold' ? 1500 : role === 'silver' ? 1620 : 1750;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d520 ?? 450), units, tier: role };
    }
    if (name.includes('1060')) {
      const denom = role === 'gold' ? 3000 : role === 'silver' ? 3200 : 3450;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d1060 ?? 850), units, tier: role };
    }
    if (name.includes('2180')) {
      const denom = role === 'gold' ? 6000 : role === 'silver' ? 6400 : 6900;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d2180 ?? 1700), units, tier: role };
    }
    if (name.includes('5600')) {
      const denom = role === 'gold' ? 15000 : role === 'silver' ? 16200 : 17500;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d5600 ?? 4500), units, tier: role };
    }
    if (name.includes('11500')) {
      const denom = role === 'gold' ? 30200 : role === 'silver' ? 32600 : 35200;
      const units = Math.max(1, Math.round(order.totalAmount / denom));
      return { category: 'etc' as const, profit: units * (tierConfig.d11500 ?? 9200), units, tier: role };
    }

    // Fallback for general diamonds / custom orders
    const fallbackProfit = (order.totalAmount * (tierConfig.fallbackMarginPercent ?? 26.0)) / 100;
    return { category: 'etc' as const, profit: fallbackProfit, units: 1, tier: role };
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
          try {
            const parsed = JSON.parse(saved);
            currentConfig = normalizeExpectedProfits(parsed);
            setExpectedProfits(currentConfig);
            setEditingProfits(currentConfig);
          } catch (e) {}
        }
      }

      const res = await fetch('/api/admin/expected-profits');
      const data = await res.json();
      if (data.success && data.profits) {
        currentConfig = normalizeExpectedProfits(data.profits);
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

        const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const todaySum = dbOrders
          .filter((o) => o.fulfillmentStatus === 'COMPLETED' && o.date === todayDateStr)
          .reduce((acc, o) => acc + o.totalAmount, 0);

        setTodayRevenue(todaySum);

        // Fetch Live Active Packages directly from Supabase
        try {
          const { data: pkgs } = await supabase
            .from('packages')
            .select('*')
            .eq('is_active', true)
            .order('shell_cost', { ascending: true });
          if (pkgs && pkgs.length > 0) {
            setDbPackages(pkgs);
          }
        } catch (pErr) {
          console.warn('Note fetching direct supabase packages for dashboard:', pErr);
        }

        // Fetch Live Shell Inventory, Base Pricing & Live Packages API
        try {
          const [enduranceRes, pricingRes, packagesRes] = await Promise.all([
            fetch('/api/admin/stock-endurance'),
            fetch('/api/admin/pricing-rules'),
            fetch('/api/packages'),
          ]);
          const enduranceData = await enduranceRes.json();
          if (enduranceData.success && typeof enduranceData.totalShellStock === 'number') {
            setTotalShellStock(enduranceData.totalShellStock);
          }
          const pricingData = await pricingRes.json();
          if (pricingData.success && pricingData.pricingRules && pricingData.pricingRules.basePrice1300) {
            setBasePrice1300(Number(pricingData.pricingRules.basePrice1300));
          }
          const packagesData = await packagesRes.json();
          if (packagesData.success && Array.isArray(packagesData.packages) && packagesData.packages.length > 0) {
            setDbPackages(packagesData.packages);
          }
        } catch (e) {
          console.warn('Note fetching stock endurance, pricing rules, or packages for dashboard:', e);
        }
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
          <p className="text-xs text-slate-400 mt-1">Live database statistics, profit analytics, and real-time stock valuation.</p>
        </div>

        <Link
          href="/admin/orders"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
        >
          Manage Orders
        </Link>
      </div>

      {/* Top 4 Live Stock & Metric Cards (Purple Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/60 relative overflow-hidden group hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-purple-400" /> Today&apos;s Sales
              </span>
              <h3 className="text-2xl font-black text-white font-mono">
                LKR {todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-purple-400 font-bold font-mono">
                {allDbOrders.filter((o) => o.fulfillmentStatus === 'COMPLETED' && o.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })).length} Today&apos;s Orders
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Sales (Exact completed transaction volume) */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/60 relative overflow-hidden group hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-purple-400" /> Total Sales
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold">
                  +{profitMargin.toFixed(1)}% margin
                </span>
              </div>
              <h3 className="text-2xl font-black text-white font-mono">
                LKR {totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-purple-400 font-bold font-mono">
                {allDbOrders.filter((o) => o.fulfillmentStatus === 'COMPLETED').length} Completed Orders
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Current Stock Value (LKR) - (Total Shell Stock / Total Shell Qty) * 1300 pack ratio */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/60 relative overflow-hidden group hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
                <Boxes className="w-3 h-3 text-purple-400" /> Current Stock Value (LKR)
              </span>
              <h3 className="text-2xl font-black text-cyan-400 font-mono">
                LKR {currentStockValueLkr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {totalShellStock.toLocaleString()} Shells @ LKR {unitShellCost.toFixed(2)}/sh
              </p>
            </div>
            <Link
              href="/admin/shell-accounts"
              className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 hover:bg-purple-600/30 transition-colors"
              title="Manage Shell Accounts"
            >
              <Boxes className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Card 4: Total Users */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/60 relative overflow-hidden group hover:border-purple-600/50 transition-all">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-300 flex items-center gap-1">
                <Users className="w-3 h-3 text-purple-400" /> Total Users
              </span>
              <h3 className="text-2xl font-black text-white font-mono">{totalUsers}</h3>
              <p className="text-[10px] text-purple-400/90 font-bold font-mono">Profiles registered</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Users className="w-5 h-5" />
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
          {/* Card 1: Weekly Membership Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-blue-500/30 relative overflow-hidden group hover:border-blue-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 block">
                  Weekly Membership Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.weekly.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold">
                {profitBreakdown.weekly.count} memberships
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Formula (3 Tiers):</span>
                <span className="text-blue-300 font-bold">LKR {expectedProfits.normal?.weekly ?? 104} / unit</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                <span>Normal: <b className="text-emerald-400">{expectedProfits.normal?.weekly ?? 104}</b></span>
                <span>Silver: <b className="text-cyan-400">{expectedProfits.silver?.weekly ?? 54}</b></span>
                <span>Gold: <b className="text-amber-400">{expectedProfits.gold?.weekly ?? 25}</b></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.weekly.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: tier expected profit × units
              </div>
            </div>
          </div>

          {/* Card 2: Monthly Membership Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  Monthly Membership Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.monthly.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold">
                {profitBreakdown.monthly.count} memberships
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Formula (3 Tiers):</span>
                <span className="text-amber-300 font-bold">LKR {expectedProfits.normal?.monthly ?? 470} / unit</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                <span>Normal: <b className="text-emerald-400">{expectedProfits.normal?.monthly ?? 470}</b></span>
                <span>Silver: <b className="text-cyan-400">{expectedProfits.silver?.monthly ?? 270}</b></span>
                <span>Gold: <b className="text-amber-400">{expectedProfits.gold?.monthly ?? 70}</b></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.monthly.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: tier expected profit × units
              </div>
            </div>
          </div>

          {/* Card 3: Weekly Lite Profit */}
          <div className="p-5 rounded-2xl bg-[#0f0d22] border border-purple-500/30 relative overflow-hidden group hover:border-purple-500/60 transition-all shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                  Weekly Lite Profit
                </span>
                <h4 className="text-xl font-black text-white font-mono">
                  LKR {profitBreakdown.lite.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold">
                {profitBreakdown.lite.count} units
              </span>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Formula (3 Tiers):</span>
                <span className="text-purple-300 font-bold">LKR {expectedProfits.normal?.lite ?? 93} / unit</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                <span>Normal: <b className="text-emerald-400">{expectedProfits.normal?.lite ?? 93}</b></span>
                <span>Silver: <b className="text-cyan-400">{expectedProfits.silver?.lite ?? 68}</b></span>
                <span>Gold: <b className="text-amber-400">{expectedProfits.gold?.lite ?? 48}</b></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.lite.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: tier expected profit × units
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
                <span className="text-emerald-300 font-bold">~{expectedProfits.normal?.fallbackMarginPercent ?? 26}%</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                <span>Normal: <b className="text-emerald-400">{expectedProfits.normal?.fallbackMarginPercent ?? 26}%</b></span>
                <span>Silver: <b className="text-cyan-400">{expectedProfits.silver?.fallbackMarginPercent ?? 15}%</b></span>
                <span>Gold: <b className="text-amber-400">{expectedProfits.gold?.fallbackMarginPercent ?? 8}%</b></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Revenue:</span>
                <span className="text-slate-300">LKR {profitBreakdown.etc.sales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-[9px] text-slate-500 text-right mt-1">
                Formula: 100d–11500d + tier margin
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
              {/* 3 User Types Tier Selector Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    Select User Pricing Tier to Configure:
                  </label>
                  <span className="text-[10px] font-mono text-purple-400 font-semibold">
                    3 User Types Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                  {/* Tab 1: Normal Customer */}
                  <button
                    type="button"
                    onClick={() => setActiveTierTab('normal')}
                    className={`px-3 py-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                      activeTierTab === 'normal'
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/20 border border-emerald-500/50 text-white shadow-md'
                        : 'hover:bg-slate-900 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTierTab === 'normal' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Normal Customer</div>
                      <div className="text-[9px] font-mono text-emerald-400 font-semibold truncate">Retail Price Profit</div>
                    </div>
                  </button>

                  {/* Tab 2: Standard Reseller */}
                  <button
                    type="button"
                    onClick={() => setActiveTierTab('silver')}
                    className={`px-3 py-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                      activeTierTab === 'silver'
                        ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 border border-cyan-500/50 text-white shadow-md'
                        : 'hover:bg-slate-900 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTierTab === 'silver' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Standard Reseller</div>
                      <div className="text-[9px] font-mono text-cyan-400 font-semibold truncate">Silver (~5% Discount)</div>
                    </div>
                  </button>

                  {/* Tab 3: Elite Reseller */}
                  <button
                    type="button"
                    onClick={() => setActiveTierTab('gold')}
                    className={`px-3 py-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 ${
                      activeTierTab === 'gold'
                        ? 'bg-gradient-to-r from-amber-600/30 to-yellow-600/20 border border-amber-500/50 text-white shadow-md'
                        : 'hover:bg-slate-900 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activeTierTab === 'gold' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Elite Reseller</div>
                      <div className="text-[9px] font-mono text-amber-400 font-semibold truncate">Gold (~10% Discount)</div>
                    </div>
                  </button>
                </div>

                {/* Active Tier Guidance Banner */}
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      activeTierTab === 'gold' ? 'bg-amber-400' : activeTierTab === 'silver' ? 'bg-cyan-400' : 'bg-emerald-400'
                    }`} />
                    <span className="text-slate-300">
                      Configuring Expected Profit for:{' '}
                      <strong className={activeTierTab === 'gold' ? 'text-amber-300' : activeTierTab === 'silver' ? 'text-cyan-300' : 'text-emerald-300'}>
                        {activeTierTab === 'gold' ? 'Elite Reseller (Gold)' : activeTierTab === 'silver' ? 'Standard Reseller (Silver)' : 'Normal Customer (Retail)'}
                      </strong>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {activeTierTab === 'gold'
                      ? 'Wholesale max discount (est. ~15% margin)'
                      : activeTierTab === 'silver'
                      ? 'Wholesale standard discount (est. ~23% margin)'
                      : 'Direct consumer retail (est. ~35% margin)'}
                  </span>
                </div>
              </div>

              {/* Category 1: Memberships */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-blue-300">
                    Memberships (Expected Net Profit / Unit for {activeTierTab.toUpperCase()})
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Weekly */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-blue-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-blue-400 font-bold block">
                      Weekly Membership (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits[activeTierTab]?.weekly ?? DEFAULT_TIER_PROFITS[activeTierTab].weekly}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            weekly: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-[9px] text-slate-400">
                      Default: {DEFAULT_TIER_PROFITS[activeTierTab].weekly} LKR (Shell Cost ~546)
                    </p>
                  </div>

                  {/* Monthly */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Monthly Membership (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits[activeTierTab]?.monthly ?? DEFAULT_TIER_PROFITS[activeTierTab].monthly}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            monthly: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[9px] text-slate-400">
                      Default: {DEFAULT_TIER_PROFITS[activeTierTab].monthly} LKR (Shell Cost ~2,730)
                    </p>
                  </div>

                  {/* Weekly Lite */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                      Weekly Lite (LKR)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editingProfits[activeTierTab]?.lite ?? DEFAULT_TIER_PROFITS[activeTierTab].lite}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            lite: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                    />
                    <p className="text-[9px] text-slate-400">
                      Default: {DEFAULT_TIER_PROFITS[activeTierTab].lite} LKR (Shell Cost ~182)
                    </p>
                  </div>
                </div>
              </div>

              {/* Category 2: Diamonds Packages (+Etc) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-emerald-300">
                    +Etc. Diamonds Top-Up Packages (Expected Net Profit for {activeTierTab.toUpperCase()})
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
                      value={editingProfits[activeTierTab]?.d100 ?? DEFAULT_TIER_PROFITS[activeTierTab].d100}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d100: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d100} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d310 ?? DEFAULT_TIER_PROFITS[activeTierTab].d310}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d310: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d310} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d520 ?? DEFAULT_TIER_PROFITS[activeTierTab].d520}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d520: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d520} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d1060 ?? DEFAULT_TIER_PROFITS[activeTierTab].d1060}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d1060: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d1060} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d2180 ?? DEFAULT_TIER_PROFITS[activeTierTab].d2180}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d2180: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d2180} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d5600 ?? DEFAULT_TIER_PROFITS[activeTierTab].d5600}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d5600: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d5600} LKR</p>
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
                      value={editingProfits[activeTierTab]?.d11500 ?? DEFAULT_TIER_PROFITS[activeTierTab].d11500}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            d11500: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].d11500} LKR</p>
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
                      value={editingProfits[activeTierTab]?.fallbackMarginPercent ?? DEFAULT_TIER_PROFITS[activeTierTab].fallbackMarginPercent}
                      onChange={(e) =>
                        setEditingProfits((prev) => ({
                          ...prev,
                          [activeTierTab]: {
                            ...(prev[activeTierTab] || DEFAULT_TIER_PROFITS[activeTierTab]),
                            fallbackMarginPercent: Number(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[9px] text-slate-500">Def: {DEFAULT_TIER_PROFITS[activeTierTab].fallbackMarginPercent}%</p>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Simulation Preview */}
              {(() => {
                const completedOrders = allDbOrders.filter((o) => o.fulfillmentStatus === 'COMPLETED');
                let simW = 0, simM = 0, simL = 0, simE = 0;
                let normCount = 0, normProfit = 0;
                let silvCount = 0, silvProfit = 0;
                let goldCount = 0, goldProfit = 0;

                completedOrders.forEach((o) => {
                  const res = classifyAndCalculateOrderProfit(o, editingProfits);
                  if (res.category === 'weekly') simW += res.profit;
                  else if (res.category === 'monthly') simM += res.profit;
                  else if (res.category === 'lite') simL += res.profit;
                  else simE += res.profit;

                  if (res.tier === 'gold') {
                    goldCount += res.units;
                    goldProfit += res.profit;
                  } else if (res.tier === 'silver') {
                    silvCount += res.units;
                    silvProfit += res.profit;
                  } else {
                    normCount += res.units;
                    normProfit += res.profit;
                  }
                });
                const simTotal = simW + simM + simL + simE;
                const diff = simTotal - totalProfit;

                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 border border-purple-500/40 space-y-3">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Live Simulation on {completedOrders.length} Completed Database Orders:
                      </span>
                      <span className="text-emerald-300 font-black text-sm">
                        LKR {simTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* 3 User Types Breakdown Pills */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono">
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-emerald-500/30 flex justify-between items-center">
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Normal ({normCount}):
                        </span>
                        <span className="text-white font-bold">LKR {normProfit.toFixed(0)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex justify-between items-center">
                        <span className="text-cyan-400 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Silver ({silvCount}):
                        </span>
                        <span className="text-white font-bold">LKR {silvProfit.toFixed(0)}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/30 flex justify-between items-center">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Gold ({goldCount}):
                        </span>
                        <span className="text-white font-bold">LKR {goldProfit.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditingProfits((prev) => ({
                      ...prev,
                      [activeTierTab]: { ...DEFAULT_TIER_PROFITS[activeTierTab] },
                    }))
                  }
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
                >
                  Reset {activeTierTab.toUpperCase()} to Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProfits(JSON.parse(JSON.stringify(DEFAULT_EXPECTED_PROFITS)))}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-all"
                >
                  Reset All 3 Tiers
                </button>
              </div>

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
              Based on Garena Shell unit cost rate of <span className="text-emerald-400 font-mono font-bold">LKR {unitShellCost.toFixed(2)} / shell</span> (1,300 Pack @ LKR {basePrice1300.toFixed(2)})
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
              {pricingMatrixRows.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> {item.name}
                  </td>
                  <td className="p-4 font-mono text-slate-300">{item.shells} Shells</td>
                  <td className="p-4 font-mono text-slate-400">LKR {item.baseCost.toFixed(2)}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">LKR {item.recNormal.toFixed(2)}</td>
                  <td className="p-4 font-mono text-cyan-300">LKR {item.recSilver.toFixed(2)}</td>
                  <td className="p-4 font-mono text-amber-300">LKR {item.recGold.toFixed(2)}</td>
                  <td className={`p-4 font-mono font-bold ${item.estProfit >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                    {item.estProfit >= 0 ? `+LKR ${item.estProfit.toFixed(2)}` : `-LKR ${Math.abs(item.estProfit).toFixed(2)}`}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                        item.margin >= 20
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : item.margin >= 10
                          ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                          : 'bg-red-500/10 border border-red-500/30 text-red-400'
                      }`}
                    >
                      {item.margin >= 0 ? `+${item.margin.toFixed(1)}%` : `${item.margin.toFixed(1)}%`}
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
