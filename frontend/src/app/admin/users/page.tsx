'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Pagination from '@/components/Pagination';
import { Users, Search, Plus, Eye, Edit2, Ban, X, Wallet, PlusCircle, MinusCircle, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  wallet_balance: number;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<UserItem[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Wallet adjustment modal state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletTargetUser, setWalletTargetUser] = useState<UserItem | null>(null);
  const [adjustAction, setAdjustAction] = useState<'add' | 'deduct'>('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [walletMsg, setWalletMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data && data.length > 0) {
      setUsers(
        data.map((u) => ({
          id: u.id,
          name: u.name || 'User Account',
          email: u.email || 'user@demo.com',
          role: (u.role || 'USER').toUpperCase(),
          status: u.is_banned ? 'BANNED' : 'ACTIVE',
          joined: new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          wallet_balance: parseFloat(u.wallet_balance || 0),
        }))
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newUser: UserItem = {
      id: Date.now().toString(),
      name,
      email,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      wallet_balance: 0,
    };

    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setSaving(false);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);

    const updated = {
      role: role.toUpperCase(),
    };

    const lowerRole = role.toLowerCase();
    const sanitizedRole = lowerRole === 'user' ? 'normal' : lowerRole;

    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          action: 'update_role',
          target_role: sanitizedRole,
        }),
      });
      if (!res.ok) {
        await supabase.from('profiles').update({ role: sanitizedRole }).eq('id', selectedUser.id);
      }
    } catch {
      await supabase.from('profiles').update({ role: sanitizedRole }).eq('id', selectedUser.id);
    }

    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updated } : u)));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSaving(false);
  };

  const handleToggleBan = async (userItem: UserItem) => {
    const newStatus = userItem.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const isBanned = newStatus === 'BANNED';

    await supabase
      .from('profiles')
      .update({
        is_banned: isBanned,
        banned_at: isBanned ? new Date().toISOString() : null,
      })
      .eq('id', userItem.id);
    setUsers(users.map((u) => (u.id === userItem.id ? { ...u, status: newStatus } : u)));
  };

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setRole(u.role);
    setIsEditModalOpen(true);
  };

  const openWalletModal = (u: UserItem) => {
    setWalletTargetUser(u);
    setAdjustAction('add');
    setAdjustAmount('');
    setAdjustReason('');
    setWalletMsg(null);
    setIsWalletModalOpen(true);
  };

  const handleWalletAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletTargetUser) return;

    const num = parseFloat(adjustAmount);
    if (isNaN(num) || num <= 0) {
      setWalletMsg({ type: 'error', text: 'Please enter a valid amount greater than 0.' });
      return;
    }

    if (adjustAction === 'deduct' && walletTargetUser.wallet_balance < num) {
      setWalletMsg({
        type: 'error',
        text: `Cannot deduct LKR ${num.toFixed(2)}. User balance is only LKR ${walletTargetUser.wallet_balance.toFixed(2)}.`,
      });
      return;
    }

    setAdjusting(true);
    setWalletMsg(null);

    try {
      const res = await fetch('/api/admin/wallet/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: walletTargetUser.id,
          action: adjustAction,
          amount: num,
          reason: adjustReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && typeof data.newBalance === 'number') {
        setUsers((prev) =>
          prev.map((u) => (u.id === walletTargetUser.id ? { ...u, wallet_balance: data.newBalance } : u))
        );
        setWalletTargetUser((prev) => (prev ? { ...prev, wallet_balance: data.newBalance } : null));
        setWalletMsg({ type: 'success', text: data.message });
        setAdjustAmount('');
        setAdjustReason('');
      } else {
        setWalletMsg({ type: 'error', text: data.message || 'Failed to adjust wallet balance.' });
      }
    } catch (err: any) {
      setWalletMsg({ type: 'error', text: err?.message || 'Network error updating wallet balance.' });
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage platform accounts, security permissions, and customer ban status.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name or Email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={() => {
              setName('New Customer');
              setEmail('newuser@example.com');
              setRole('USER');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Wallet Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{u.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : u.role === 'GOLD'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : u.role === 'SILVER'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {u.role === 'GOLD' ? 'ELITE RESELLER' : u.role === 'SILVER' ? 'STANDARD RESELLER' : u.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400 text-xs">
                    LKR {Number(u.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{u.joined}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => openWalletModal(u)}
                      className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 hover:text-white transition-colors"
                      title="Add or Deduct Wallet Balance"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => alert(`User Details:\nName: ${u.name}\nEmail: ${u.email}\nRole: ${u.role}\nWallet Balance: LKR ${Number(u.wallet_balance || 0).toFixed(2)}`)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="Edit User Role"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBan(u)}
                      className={`p-2 rounded-xl border ${
                        u.status === 'ACTIVE'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredUsers.length / pageSize)}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 15, 25, 50]}
        />
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Platform User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="SILVER">STANDARD RESELLER</option>
                  <option value="GOLD">ELITE RESELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit User Role</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="SILVER">STANDARD RESELLER</option>
                  <option value="GOLD">ELITE RESELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Role'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Adjustment Modal (Add / Deduct Funds) */}
      {isWalletModalOpen && walletTargetUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Shadow Wallet Management
                </span>
                <h3 className="text-sm font-bold text-white mt-1">
                  Adjust Balance: {walletTargetUser.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
                  {walletTargetUser.email}
                </p>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="p-3.5 rounded-2xl bg-[#0e0c1f] border border-purple-900/40 flex items-center justify-between font-mono">
              <span className="text-xs text-slate-400">Current Balance:</span>
              <span className="text-sm font-extrabold text-emerald-400">
                LKR {Number(walletTargetUser.wallet_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {walletMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  walletMsg.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                {walletMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{walletMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleWalletAdjust} className="space-y-4 text-xs">
              {/* Action Toggle (Add vs Deduct) */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAction('add')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      adjustAction === 'add'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400/50'
                        : 'bg-[#0e0c1f] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <span>Add Funds (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustAction('deduct')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      adjustAction === 'deduct'
                        ? 'bg-red-500/20 border-red-500 text-red-300 ring-1 ring-red-400/50'
                        : 'bg-[#0e0c1f] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4 text-red-400" />
                    <span>Deduct Funds (-)</span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Amount (LKR)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="Enter amount (e.g. 1000)"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-mono font-bold text-slate-500">
                    LKR
                  </span>
                </div>

                {/* Quick Amount Pills */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[200, 500, 1000, 2500, 5000].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setAdjustAmount(String(quick))}
                      className="px-2 py-1 rounded-lg bg-[#0e0c1f] hover:bg-purple-950/60 border border-slate-800 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                    >
                      +{quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Note */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Reason / Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank slip verified / Reseller promotion / Manual refund"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* New Projected Balance Preview */}
              {adjustAmount && !isNaN(parseFloat(adjustAmount)) && parseFloat(adjustAmount) > 0 && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Projected Balance:</span>
                  <span
                    className={`font-bold ${
                      adjustAction === 'add'
                        ? 'text-emerald-400'
                        : walletTargetUser.wallet_balance - parseFloat(adjustAmount) < 0
                        ? 'text-red-400'
                        : 'text-amber-300'
                    }`}
                  >
                    LKR{' '}
                    {(
                      adjustAction === 'add'
                        ? walletTargetUser.wallet_balance + parseFloat(adjustAmount)
                        : walletTargetUser.wallet_balance - parseFloat(adjustAmount)
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={adjusting}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  adjustAction === 'add'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30'
                } disabled:opacity-50`}
              >
                {adjusting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : adjustAction === 'add' ? (
                  <>
                    <PlusCircle className="w-4 h-4" /> Confirm Add Funds
                  </>
                ) : (
                  <>
                    <MinusCircle className="w-4 h-4" /> Confirm Deduct Funds
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
