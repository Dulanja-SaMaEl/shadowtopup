'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, PurchaseTransaction } from '@/types/database';
import {
  ShoppingBag,
  DollarSign,
  Zap,
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<PurchaseTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [resellerTier, setResellerTier] = useState<'silver' | 'gold'>('silver');
  const [applying, setApplying] = useState(false);
  const [resellerMsg, setResellerMsg] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Fetch Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (prof) setProfile(prof as Profile);

      // Fetch Recent Transactions
      const { data: txs } = await supabase
        .from('purchase_transactions')
        .select('*, package:packages(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txs) setTransactions(txs as any);
      setLoading(false);
    }

    loadDashboardData();
  }, [supabase]);

  const handleApplyReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setApplying(true);
    setResellerMsg(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        reseller_status: 'pending',
        requested_tier: resellerTier,
      })
      .eq('id', profile.id);

    if (error) {
      setResellerMsg(error.message);
    } else {
      setProfile({
        ...profile,
        reseller_status: 'pending',
        requested_tier: resellerTier,
      });
      setResellerMsg('Application submitted! Admin will review your reseller tier.');
    }
    setApplying(false);
  };

  // Mock 30-day analytics data for chart
  const chartData = [
    { date: 'Day 1', spent: 10 },
    { date: 'Day 5', spent: 25 },
    { date: 'Day 10', spent: 18 },
    { date: 'Day 15', spent: 45 },
    { date: 'Day 20', spent: 30 },
    { date: 'Day 25', spent: 60 },
    { date: 'Today', spent: 75 },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const totalSpent = transactions.reduce((acc, t) => acc + Number(t.price_paid || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Welcome Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono uppercase text-slate-400">User Dashboard</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              profile?.role === 'admin'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : profile?.role === 'gold'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : profile?.role === 'silver'
                ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}>
              {profile?.role.toUpperCase()} USER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {profile?.name}
          </h1>
        </div>

        {/* Reseller Application Banner */}
        {profile?.role === 'normal' && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
            <Award className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Upgrade to Reseller</h4>
              <p className="text-xs text-slate-400">Apply for Silver or Gold pricing tiers</p>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Total Orders</span>
            <h3 className="text-2xl font-extrabold text-white">{transactions.length}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Total Spent</span>
            <h3 className="text-2xl font-extrabold text-white">${totalSpent.toFixed(2)}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Reseller Status</span>
            <h3 className="text-lg font-bold text-white capitalize">
              {profile?.reseller_status === 'none' ? 'Standard User' : profile?.reseller_status}
            </h3>
          </div>
        </div>
      </div>

      {/* 30-Day Spending Chart */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-6">30-Day Spending Analytics</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
              <Line type="monotone" dataKey="spent" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reseller Application Modal / Box */}
      {profile?.role === 'normal' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> Apply for Reseller Tier
          </h3>
          <p className="text-xs text-slate-400">
            Select a target tier. Admins review applications manually for high-volume top-up sellers.
          </p>

          <form onSubmit={handleApplyReseller} className="flex flex-col sm:flex-row gap-4 items-center">
            <select
              value={resellerTier}
              onChange={(e) => setResellerTier(e.target.value as 'silver' | 'gold')}
              className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
            >
              <option value="silver">Silver Reseller Tier</option>
              <option value="gold">Gold Reseller Tier</option>
            </select>

            <button
              type="submit"
              disabled={applying || profile.reseller_status === 'pending'}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {profile.reseller_status === 'pending' ? 'Application Pending' : 'Submit Application'}
            </button>
          </form>

          {resellerMsg && (
            <p className="text-xs text-amber-400 font-mono mt-2">{resellerMsg}</p>
          )}
        </div>
      )}

      {/* Recent Orders Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-white">Recent Top-Up Orders</h3>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No top-up transactions found yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Package</th>
                  <th className="p-4">Player UID</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-950/50">
                    <td className="p-4 font-bold text-white">{tx.package?.package_name || 'Free Fire Package'}</td>
                    <td className="p-4 font-mono text-cyan-400">{tx.free_fire_player_id}</td>
                    <td className="p-4 font-mono text-white">${Number(tx.price_paid).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase flex items-center gap-1 w-fit ${
                        tx.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : tx.status === 'failed'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {tx.status === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : tx.status === 'failed' ? (
                          <XCircle className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
