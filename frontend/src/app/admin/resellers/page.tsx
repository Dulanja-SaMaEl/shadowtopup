'use client';

import { useState, useEffect } from 'react';
import { Award, Clock, Star, Users, Check, X, ArrowUpCircle, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface ResellerUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gold' | 'silver' | 'normal';
  requested_tier?: 'silver' | 'gold';
  reseller_status?: 'pending' | 'approved' | 'rejected' | 'none';
  expires: string;
}

export default function AdminResellersPage() {
  const [pendingApplications, setPendingApplications] = useState<ResellerUser[]>([]);
  const [goldResellers, setGoldResellers] = useState<ResellerUser[]>([]);
  const [silverResellers, setSilverResellers] = useState<ResellerUser[]>([]);
  const [normalUsers, setNormalUsers] = useState<ResellerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadResellers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resellers');
      const data = await res.json();
      if (data.success && data.profiles) {
        const rawProfiles: any[] = data.profiles;

        const pending = rawProfiles.filter((u) => u.reseller_status === 'pending');
        const gold = rawProfiles.filter((u) => u.role === 'gold');
        const silver = rawProfiles.filter((u) => u.role === 'silver');
        const normal = rawProfiles.filter((u) => u.role === 'normal' && u.reseller_status !== 'pending');

        setPendingApplications(
          pending.map((u) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Applicant',
            email: u.email || 'N/A',
            role: u.role || 'normal',
            requested_tier: u.requested_tier || 'silver',
            reseller_status: 'pending',
            expires: 'Pending Approval',
          }))
        );

        setGoldResellers(
          gold.map((u) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Gold Reseller',
            email: u.email || 'N/A',
            role: 'gold',
            expires: u.reseller_expires_at ? new Date(u.reseller_expires_at).toLocaleDateString() : 'Active Partner',
          }))
        );

        setSilverResellers(
          silver.map((u) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Silver Reseller',
            email: u.email || 'N/A',
            role: 'silver',
            expires: u.reseller_expires_at ? new Date(u.reseller_expires_at).toLocaleDateString() : 'Active Partner',
          }))
        );

        setNormalUsers(
          normal.map((u) => ({
            id: u.id,
            name: u.name || u.email?.split('@')[0] || 'Customer Account',
            email: u.email || 'N/A',
            role: 'normal',
            expires: 'N/A',
          }))
        );
      }
    } catch (err) {
      console.error('Error loading admin resellers:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadResellers();
  }, []);

  // Action Handlers
  const handleApproveApplication = async (app: ResellerUser) => {
    setProcessingId(app.id);
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: app.id,
          action: 'approve',
          target_role: app.requested_tier || 'silver',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadResellers();
      }
    } catch (e) {
      console.error('Error approving reseller application:', e);
    }
    setProcessingId(null);
  };

  const handleRejectApplication = async (app: ResellerUser) => {
    setProcessingId(app.id);
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: app.id, action: 'reject' }),
      });
      const data = await res.json();
      if (data.success) {
        await loadResellers();
      }
    } catch (e) {
      console.error('Error rejecting reseller application:', e);
    }
    setProcessingId(null);
  };

  const handlePromoteUser = async (user: ResellerUser, targetTier: 'silver' | 'gold' | 'normal') => {
    setProcessingId(user.id);
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, action: 'promote', target_role: targetTier }),
      });
      const data = await res.json();
      if (data.success) {
        await loadResellers();
      }
    } catch (e) {
      console.error('Error updating user reseller tier:', e);
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Reseller Tier Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review reseller applications, grant Silver & Gold tiers, and manage partner accounts.</p>
        </div>

        <button
          onClick={loadResellers}
          className="px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Resellers
        </button>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#141229] border border-amber-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Pending Requests</span>
            <h3 className="text-xl font-black text-amber-300 font-mono">{pendingApplications.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-amber-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Gold Partners</span>
            <h3 className="text-xl font-black text-amber-400 font-mono">{goldResellers.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-cyan-500/30 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Silver Partners</span>
            <h3 className="text-xl font-black text-cyan-300 font-mono">{silverResellers.length}</h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#141229] border border-purple-950/40 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-slate-400">Normal Customers</span>
            <h3 className="text-xl font-black text-white font-mono">{normalUsers.length}</h3>
          </div>
        </div>
      </div>

      {/* 1. Pending Reseller Applications Section */}
      {pendingApplications.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#141229] to-[#141229] border border-amber-500/40 space-y-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Reseller Applications
            </h3>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
              {pendingApplications.length} ACTION REQUIRED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Requested Tier</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pendingApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-white">
                      {app.name}
                      <span className="block text-[10px] text-slate-400 font-mono font-normal">{app.email}</span>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-300 uppercase">
                      {app.requested_tier} TIER
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase">
                        PENDING APPROVAL
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveApplication(app)}
                        disabled={processingId === app.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1 shadow-md shadow-emerald-600/20"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve {app.requested_tier?.toUpperCase()}
                      </button>
                      <button
                        onClick={() => handleRejectApplication(app)}
                        disabled={processingId === app.id}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-mono font-bold text-[10px] uppercase flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Gold Resellers Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-amber-500/40 space-y-6 shadow-2xl">
        <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Active Gold Tier Resellers (Max Wholesale Discount)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Partner Account</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status / Expiry</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {goldResellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 font-mono">
                    No Gold tier resellers assigned yet.
                  </td>
                </tr>
              ) : (
                goldResellers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" /> {user.name}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{user.email}</td>
                    <td className="p-4 font-mono text-amber-300 text-[11px]">{user.expires}</td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handlePromoteUser(user, 'silver')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono font-bold uppercase"
                      >
                        Downgrade to Silver
                      </button>
                      <button
                        onClick={() => handlePromoteUser(user, 'normal')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold uppercase"
                      >
                        Demote to Normal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Silver Resellers Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-cyan-500/40 space-y-6 shadow-2xl">
        <h3 className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400" /> Active Silver Tier Resellers (Standard Discount)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Partner Account</th>
                <th className="p-4">Email</th>
                <th className="p-4">Status / Expiry</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {silverResellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 font-mono">
                    No Silver tier resellers assigned yet.
                  </td>
                </tr>
              ) : (
                silverResellers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-cyan-400" /> {user.name}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{user.email}</td>
                    <td className="p-4 font-mono text-cyan-300 text-[11px]">{user.expires}</td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handlePromoteUser(user, 'gold')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono font-bold uppercase shadow-md shadow-amber-600/20"
                      >
                        Upgrade to Gold
                      </button>
                      <button
                        onClick={() => handlePromoteUser(user, 'normal')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-[10px] font-mono font-bold uppercase"
                      >
                        Demote to Normal
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Normal Users List (Grant Reseller Tier) */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" /> Standard Customer Accounts (Grant Reseller Access)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User Account</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Grant Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {normalUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500 font-mono">
                    No standard user accounts found.
                  </td>
                </tr>
              ) : (
                normalUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-900/50">
                    <td className="p-4 font-bold text-white">{user.name}</td>
                    <td className="p-4 font-mono text-slate-300">{user.email}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">NORMAL USER</td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handlePromoteUser(user, 'silver')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-[10px] font-mono font-bold uppercase"
                      >
                        + Grant Silver
                      </button>
                      <button
                        onClick={() => handlePromoteUser(user, 'gold')}
                        disabled={processingId === user.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-mono font-bold uppercase shadow-md shadow-amber-600/20"
                      >
                        + Grant Gold
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
