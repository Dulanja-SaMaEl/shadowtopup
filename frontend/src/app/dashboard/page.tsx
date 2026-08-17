'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile, PurchaseTransaction } from '@/types/database';
import {
  ShoppingBag,
  Zap,
  Award,
  ShieldCheck,
  LogOut,
  ChevronRight,
  User as UserIcon,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>({
    id: 'demo-user',
    name: 'USER ONE',
    email: 'USER1@DEMO.COM',
    role: 'normal',
    reseller_status: 'none',
    created_at: '2026-05-11T00:00:00Z',
    updated_at: '2026-05-11T00:00:00Z',
  });

  const [transactions, setTransactions] = useState<any[]>([
    { id: '25', package_name: '25 Diamond Pack', items: '2X ITEMS', amount: 5.00, status: 'COMPLETED', time: '11:30 AM', date: 'MAY 11, 2026' },
    { id: '22', package_name: '100 Diamonds', items: '1X ITEMS', amount: 10.00, status: 'COMPLETED', time: '10:00 AM', date: 'MAY 03, 2026' },
    { id: '18', package_name: '50 Diamonds', items: '1X ITEMS', amount: 5.00, status: 'PENDING', time: '10:15 AM', date: 'APR 23, 2026' },
  ]);

  const [resellerTier, setResellerTier] = useState<'silver' | 'gold'>('silver');
  const [applying, setApplying] = useState(false);
  const [resellerMsg, setResellerMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (prof) {
          setProfile({
            ...prof,
            name: prof.name || user.email?.split('@')[0].toUpperCase() || 'USER ONE',
            email: prof.email?.toUpperCase() || user.email?.toUpperCase() || 'USER@DEMO.COM',
          } as Profile);
        }

        const { data: txs } = await supabase
          .from('purchase_transactions')
          .select('*, package:packages(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (txs && txs.length > 0) {
          setTransactions(
            txs.map((tx: any, idx: number) => ({
              id: (txs.length - idx).toString(),
              package_name: tx.package?.package_name || 'Free Fire Diamonds',
              items: '1X ITEMS',
              amount: Number(tx.price_paid || 5.00),
              status: (tx.status || 'completed').toUpperCase(),
              time: '10:00 AM',
              date: new Date(tx.created_at).toLocaleDateString(),
            }))
          );
        }
      }
    }
    loadDashboardData();
  }, []);

  const handleApplyReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setResellerMsg(null);

    if (profile?.id && profile.id !== 'demo-user') {
      await supabase
        .from('profiles')
        .update({
          reseller_status: 'pending',
          requested_tier: resellerTier,
        })
        .eq('id', profile.id);
    }

    setProfile({
      ...profile!,
      reseller_status: 'pending',
      requested_tier: resellerTier,
    });
    setResellerMsg('Application submitted! Admin will review your reseller tier.');
    setApplying(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Mock 30-day analytics data
  const lineData = [
    { date: 'Jul 18', spent: 0 },
    { date: 'Jul 24', spent: 0 },
    { date: 'Jul 29', spent: 0 },
    { date: 'Aug 03', spent: 10 },
    { date: 'Aug 08', spent: 10 },
    { date: 'Aug 13', spent: 22 },
  ];

  // Mock Package Pricing Tiers Bar Chart
  const barData = [
    { name: '25 Diamond Pack', Normal: 75, Silver: 73, Gold: 72 },
  ];

  const totalSpent = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 22.00);

  return (
    <div className="min-h-screen bg-[#0a0814] pb-20 space-y-8">
      {/* 1. Top Banner matching screenshot 2 */}
      <div className="relative h-48 bg-[#120f26] border-b border-purple-950/40 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-purple-950/30 to-transparent" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg">
            MY DASHBOARD
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase text-slate-400">
            <Link href="/" className="hover:text-cyan-400">HOME</Link>
            <span>:</span>
            <span className="text-red-500 font-black">DASHBOARD</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Admin Quick Switch */}
        {profile?.role === 'admin' && (
          <div className="bg-purple-950/60 border border-purple-800 p-6 rounded-3xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase">ADMINISTRATOR CONTROL DETECTED</h4>
                <p className="text-xs text-purple-300 font-mono">Access store settings, packages, shell accounts & reseller applications.</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl">
              GO TO ADMIN PANEL
            </Link>
          </div>
        )}

        {/* 2. User Profile Header Card matching screenshot 2 */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-2xl font-black">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{profile?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{profile?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-mono font-bold uppercase border border-slate-700">
                {profile?.role.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700">
              EDIT PROFILE
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          </div>
        </div>

        {/* 3. Metrics Summary Row matching screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL ORDERS</span>
            <h3 className="text-3xl font-black text-white">{transactions.length > 0 ? transactions.length : 8}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL SPENT</span>
            <h3 className="text-3xl font-black text-white">LKR {totalSpent.toFixed(2)}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACTIVE ORDERS</span>
            <h3 className="text-3xl font-black text-cyan-400">2</h3>
          </div>
        </div>

        {/* 4. 4 Details Info Grid Cards matching screenshot 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">FULL NAME</span>
            <p className="text-xs font-bold text-white uppercase mt-1">{profile?.name}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">EMAIL ADDRESS</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">{profile?.email}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">ACCOUNT ROLE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">{profile?.role.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MEMBER SINCE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">MAY 11, 2026</p>
          </div>
        </div>

        {/* 5. RESELLER STATUS / Application Card matching screenshot 2 */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-red-500" /> RESELLER STATUS
          </div>

          <div className="p-6 rounded-2xl bg-[#0e0c1f] border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">BECOME A RESELLER</h4>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              GET EXCLUSIVE DISCOUNTS ON ALL TOP-UP PACKAGES BY BECOMING A RESELLER. APPLY BELOW.
            </p>

            <form onSubmit={handleApplyReseller} className="space-y-3 max-w-md">
              <label className="block text-[9px] font-mono text-slate-400 uppercase">SELECT TIER</label>
              <select
                value={resellerTier}
                onChange={(e) => setResellerTier(e.target.value as 'silver' | 'gold')}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-red-500"
              >
                <option value="silver">Silver Reseller Tier</option>
                <option value="gold">Gold Reseller Tier</option>
              </select>

              <button
                type="submit"
                disabled={applying || profile?.reseller_status === 'pending'}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {profile?.reseller_status === 'pending' ? 'APPLICATION PENDING' : 'SUBMIT APPLICATION'}
              </button>
            </form>

            {resellerMsg && (
              <p className="text-xs text-amber-400 font-mono font-bold mt-2">{resellerMsg}</p>
            )}
          </div>
        </div>

        {/* 6. CHARTS ROW matching screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase History (30 Days) */}
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> PURCHASE HISTORY (30 DAYS)
            </div>
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e0c1f', borderColor: '#334155', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="spent" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Package Pricing Tiers */}
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-amber-400" /> PACKAGE PRICING TIERS
            </div>
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e0c1f', borderColor: '#334155', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Normal" fill="#64748b" />
                  <Bar dataKey="Silver" fill="#cbd5e1" />
                  <Bar dataKey="Gold" fill="#eab308" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 7. Recent Orders List matching screenshot 2 */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">RECENT ORDERS</h3>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/80 flex items-center justify-between hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-900 text-slate-300 font-mono text-xs font-bold flex items-center justify-center border border-slate-800">
                    #{tx.id}
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs uppercase">{tx.package_name}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">{tx.items} • {tx.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white text-xs">
                    LKR {Number(tx.amount).toFixed(2)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                    tx.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {tx.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
