'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Award, Clock, Star, Users, Check, X, ArrowUpCircle } from 'lucide-react';

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
  const [pendingApplications, setPendingApplications] = useState<ResellerUser[]>([
    { id: 'p1', name: 'Samir Perera', email: 'samir.perera@example.com', role: 'normal', requested_tier: 'gold', reseller_status: 'pending', expires: 'Pending Approval' },
    { id: 'p2', name: 'Kavindu Silva', email: 'kavindu.silva@example.com', role: 'normal', requested_tier: 'silver', reseller_status: 'pending', expires: 'Pending Approval' },
  ]);

  const [goldResellers, setGoldResellers] = useState<ResellerUser[]>([
    { id: 'g1', name: 'Gold Reseller Account', email: 'gold@shadowtopup.com', role: 'gold', expires: 'Aug 30, 2027' },
    { id: 'g2', name: 'Lanka Topup Hub', email: 'lankatopup@gmail.com', role: 'gold', expires: 'Dec 15, 2026' },
  ]);

  const [silverResellers, setSilverResellers] = useState<ResellerUser[]>([
    { id: 's1', name: 'Dulanja Abeysinghe', email: 'dulanja150abeysinghe@gmail.com', role: 'silver', expires: 'Jul 23, 2026' },
    { id: 's2', name: 'Silver Reseller Account', email: 'silver@shadowtopup.com', role: 'silver', expires: 'Nov 10, 2026' },
  ]);

  const [normalUsers, setNormalUsers] = useState<ResellerUser[]>([
    { id: 'n1', name: 'Standard User Account', email: 'user@shadowtopup.com', role: 'normal', expires: 'N/A' },
    { id: 'n2', name: 'User One', email: 'user1@demo.com', role: 'normal', expires: 'N/A' },
    { id: 'n3', name: 'Test Customer', email: 'testcustomer@gmail.com', role: 'normal', expires: 'N/A' },
  ]);

  const supabase = createClient();

  useEffect(() => {
    async function loadResellers() {
      const { data } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        const pending = data.filter((u) => u.reseller_status === 'pending');
        const gold = data.filter((u) => u.role === 'gold');
        const silver = data.filter((u) => u.role === 'silver');
        const normal = data.filter((u) => u.role === 'normal' && u.reseller_status !== 'pending');

        if (pending.length > 0) {
          setPendingApplications(
            pending.map((u) => ({
              id: u.id,
              name: u.name || 'Applicant',
              email: u.email,
              role: u.role || 'normal',
              requested_tier: u.requested_tier || 'silver',
              reseller_status: 'pending',
              expires: 'Pending Approval',
            }))
          );
        }

        if (gold.length > 0) {
          setGoldResellers(
            gold.map((u) => ({
              id: u.id,
              name: u.name || 'Gold Reseller',
              email: u.email,
              role: 'gold',
              expires: u.reseller_expires_at ? new Date(u.reseller_expires_at).toLocaleDateString() : 'Aug 30, 2027',
            }))
          );
        }

        if (silver.length > 0) {
          setSilverResellers(
            silver.map((u) => ({
              id: u.id,
              name: u.name || 'Silver Reseller',
              email: u.email,
              role: 'silver',
              expires: u.reseller_expires_at ? new Date(u.reseller_expires_at).toLocaleDateString() : 'Jul 23, 2026',
            }))
          );
        }

        if (normal.length > 0) {
          setNormalUsers(
            normal.map((u) => ({
              id: u.id,
              name: u.name || 'User Account',
              email: u.email,
              role: 'normal',
              expires: 'N/A',
            }))
          );
        }
      }
    }
    loadResellers();
  }, []);

  // Action Handlers
  const handleApproveApplication = async (app: ResellerUser) => {
    const newRole = app.requested_tier || 'silver';
    await supabase.from('profiles').update({ role: newRole, reseller_status: 'approved' }).eq('id', app.id);

    setPendingApplications(pendingApplications.filter((p) => p.id !== app.id));

    const approvedUser: ResellerUser = { ...app, role: newRole as any, expires: 'Aug 30, 2027' };
    if (newRole === 'gold') {
      setGoldResellers([...goldResellers, approvedUser]);
    } else {
      setSilverResellers([...silverResellers, approvedUser]);
    }
  };

  const handleRejectApplication = async (app: ResellerUser) => {
    await supabase.from('profiles').update({ reseller_status: 'rejected' }).eq('id', app.id);
    setPendingApplications(pendingApplications.filter((p) => p.id !== app.id));
  };

  const handleDemoteToNormal = async (user: ResellerUser) => {
    await supabase.from('profiles').update({ role: 'normal' }).eq('id', user.id);
    if (user.role === 'gold') {
      setGoldResellers(goldResellers.filter((g) => g.id !== user.id));
    } else if (user.role === 'silver') {
      setSilverResellers(silverResellers.filter((s) => s.id !== user.id));
    }
    setNormalUsers([...normalUsers, { ...user, role: 'normal', expires: 'N/A' }]);
  };

  const handlePromoteUser = async (user: ResellerUser, targetTier: 'silver' | 'gold') => {
    await supabase.from('profiles').update({ role: targetTier }).eq('id', user.id);
    setNormalUsers(normalUsers.filter((n) => n.id !== user.id));

    const promoted: ResellerUser = { ...user, role: targetTier, expires: 'Aug 30, 2027' };
    if (targetTier === 'gold') {
      setGoldResellers([...goldResellers, promoted]);
    } else {
      setSilverResellers([...silverResellers, promoted]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Reseller Management</h1>
        <p className="text-xs text-slate-400 mt-1">Review reseller tier applications, manage active Gold & Silver subscribers, and promote standard users.</p>
      </div>

      {/* 1. Pending Tier Applications */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Tier Applications
          </h3>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-400 font-mono">
            {pendingApplications.length} Requests
          </span>
        </div>

        {pendingApplications.length === 0 ? (
          <div className="py-8 text-center bg-[#0e0c1f] rounded-2xl border border-slate-800/40">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              No pending reseller applications at this time.
            </p>
          </div>
        ) : (
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
                  <tr key={app.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div>
                        <h5 className="font-bold text-white text-xs">{app.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{app.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono ${
                        app.requested_tier === 'gold'
                          ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                          : 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                      }`}>
                        {(app.requested_tier || 'silver').toUpperCase()} TIER
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase">
                        PENDING
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handleApproveApplication(app)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectApplication(app)}
                        className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold uppercase flex items-center gap-1"
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

      {/* 2. Gold Tier Resellers */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Gold Tier Resellers ({goldResellers.length})
        </h3>

        {goldResellers.length === 0 ? (
          <div className="py-8 text-center bg-[#0e0c1f] rounded-2xl border border-slate-800/40">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              No active Gold tier resellers found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Subscription Expires</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {goldResellers.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div>
                        <h5 className="font-bold text-white text-xs">{r.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{r.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-amber-400 text-xs">{r.expires}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleDemoteToNormal(r)}
                        className="px-4 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Demote to Normal
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Silver Tier Resellers */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Silver Tier Resellers ({silverResellers.length})
        </h3>

        {silverResellers.length === 0 ? (
          <div className="py-8 text-center bg-[#0e0c1f] rounded-2xl border border-slate-800/40">
            <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
              No active Silver tier resellers found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Subscription Expires</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {silverResellers.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40">
                    <td className="p-4">
                      <div>
                        <h5 className="font-bold text-white text-xs">{r.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{r.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-cyan-400 text-xs">{r.expires}</td>
                    <td className="p-4 flex items-center gap-2">
                      <button
                        onClick={() => handlePromoteUser(r, 'gold')}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Upgrade Gold
                      </button>
                      <button
                        onClick={() => handleDemoteToNormal(r)}
                        className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                      >
                        Demote
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Standard Normal Users */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-400" /> Standard Normal Accounts ({normalUsers.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Current Tier</th>
                <th className="p-4">Promote Tier Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {normalUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{u.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-bold uppercase">
                      NORMAL
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => handlePromoteUser(u, 'silver')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30 text-[10px] font-bold uppercase font-mono"
                    >
                      + Promote Silver
                    </button>
                    <button
                      onClick={() => handlePromoteUser(u, 'gold')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30 text-[10px] font-bold uppercase font-mono"
                    >
                      + Promote Gold
                    </button>
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
