'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ShieldCheck, Users, Package, Database, Check, X, Loader2, ShoppingBag, Activity, RefreshCw, Server } from 'lucide-react';

interface ServiceHealth {
  status: string;
  latencyMs: number;
  label: string;
}

export default function AdminDashboardPage() {
  const [resellerApps, setResellerApps] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<Record<string, ServiceHealth>>({});
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchHealthStatus = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/admin/health');
      if (res.ok) {
        const json = await res.json();
        setHealthData(json.services || {});
      }
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    async function loadAdminData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (prof && prof.role === 'admin') {
            const { data: apps } = await supabase
              .from('profiles')
              .select('*')
              .eq('reseller_status', 'pending');
            if (apps) setResellerApps(apps as Profile[]);
          }
        }
      } catch (err) {
        console.error('Admin load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
    fetchHealthStatus();
  }, []);

  const handleApproveReseller = async (userId: string, targetTier: 'silver' | 'gold') => {
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({
          role: targetTier,
          reseller_status: 'approved',
        })
        .eq('id', userId);

      setResellerApps(resellerApps.filter((a) => a.id !== userId));
    } catch (err) {
      console.error('Approve reseller error:', err);
    }
  };

  const handleRejectReseller = async (userId: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('profiles')
        .update({
          reseller_status: 'rejected',
        })
        .eq('id', userId);

      setResellerApps(resellerApps.filter((a) => a.id !== userId));
    } catch (err) {
      console.error('Reject reseller error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="bg-purple-950/40 border border-purple-800/60 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono uppercase text-purple-300">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            Package Pricing
          </Link>
          <Link
            href="/admin/shell-accounts"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            Shell Accounts
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            Receipt Approvals
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500/50 transition-all"
          >
            User Roles
          </Link>
        </div>
      </div>

      {/* Real-time Infrastructure & Services Health Pointers */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Live System Diagnostics & Service Status</h3>
          </div>
          <button
            onClick={fetchHealthStatus}
            disabled={healthLoading}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
          >
            {healthLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Diagnostics
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(healthData).map(([key, service]) => (
            <div key={key} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate">{service.label}</span>
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    service.status === 'online' ? 'bg-emerald-400' : service.status === 'standby' ? 'bg-amber-400' : 'bg-red-400'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    service.status === 'online' ? 'bg-emerald-500' : service.status === 'standby' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></span>
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-bold text-white capitalize">{service.status}</span>
                <span className="text-[10px] font-mono text-slate-500">{service.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Link href="/admin/users" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-4">
          <Users className="w-8 h-8 text-cyan-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Pending Resellers</span>
            <h3 className="text-2xl font-extrabold text-white">{resellerApps.length}</h3>
          </div>
        </Link>

        <Link href="/admin/packages" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-4">
          <Package className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Diamond Packages</span>
            <h3 className="text-2xl font-extrabold text-white">4 Active</h3>
          </div>
        </Link>

        <Link href="/admin/shell-accounts" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-4">
          <Database className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Garena Shell Stock</span>
            <h3 className="text-2xl font-extrabold text-white">14,500 Shells</h3>
          </div>
        </Link>

        <Link href="/admin/orders" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-4">
          <ShoppingBag className="w-8 h-8 text-purple-400 shrink-0" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Orders</span>
            <h3 className="text-2xl font-extrabold text-white">2 Pending</h3>
          </div>
        </Link>
      </div>

      {/* Pending Reseller Approvals */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
        <h3 className="text-lg font-bold text-white">Pending Reseller Applications</h3>

        {resellerApps.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">No pending reseller applications.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Requested Tier</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {resellerApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-950/50">
                    <td className="p-4 font-bold text-white">{app.name}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{app.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/10 border border-amber-500/30 text-amber-400">
                        {app.requested_tier}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveReseller(app.id, app.requested_tier || 'silver')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectReseller(app.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 text-xs font-bold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
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
