'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ShieldCheck, Users, Package, Database, Check, X, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const [resellerApps, setResellerApps] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadAdminData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Verify Admin
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!prof || prof.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }

      // Fetch Pending Reseller Applications
      const { data: apps } = await supabase
        .from('profiles')
        .select('*')
        .eq('reseller_status', 'pending');

      if (apps) setResellerApps(apps as Profile[]);
      setLoading(false);
    }
    loadAdminData();
  }, [supabase]);

  const handleApproveReseller = async (userId: string, targetTier: 'silver' | 'gold') => {
    await supabase
      .from('profiles')
      .update({
        role: targetTier,
        reseller_status: 'approved',
      })
      .eq('id', userId);

    setResellerApps(resellerApps.filter((a) => a.id !== userId));
  };

  const handleRejectReseller = async (userId: string) => {
    await supabase
      .from('profiles')
      .update({
        reseller_status: 'rejected',
      })
      .eq('id', userId);

    setResellerApps(resellerApps.filter((a) => a.id !== userId));
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
      <div className="bg-purple-950/40 border border-purple-800/60 rounded-3xl p-6 sm:p-8 flex items-center justify-between backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-mono uppercase text-purple-300">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white"
          >
            Package Pricing
          </Link>
          <Link
            href="/admin/shell-accounts"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white"
          >
            Shell Accounts
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <Users className="w-8 h-8 text-cyan-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Pending Resellers</span>
            <h3 className="text-2xl font-extrabold text-white">{resellerApps.length}</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <Package className="w-8 h-8 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Free Fire Packages</span>
            <h3 className="text-2xl font-extrabold text-white">4 Active</h3>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <Database className="w-8 h-8 text-emerald-400" />
          <div>
            <span className="text-xs text-slate-400 uppercase font-mono">Garena Shell Stock</span>
            <h3 className="text-2xl font-extrabold text-white">14,500 Shells</h3>
          </div>
        </div>
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
