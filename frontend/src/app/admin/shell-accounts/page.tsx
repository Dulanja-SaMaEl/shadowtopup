'use client';

import { useState, useEffect } from 'react';
import { ShellAccount } from '@/types/database';
import { Plus, Edit2, Trash2, X, RefreshCw, CheckCircle2, AlertCircle, Zap, Shield, Save } from 'lucide-react';

export default function AdminShellAccountsPage() {
  const [accounts, setAccounts] = useState<ShellAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<ShellAccount | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Form states for Add
  const [username, setUsername] = useState('SHADOW_TOPUP1');
  const [password, setPassword] = useState('Shadow-2008');
  const [isMain, setIsMain] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shell-accounts');
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Error loading shell accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSyncAccount = async (acc: ShellAccount) => {
    setSyncingId(acc.id);
    try {
      // 1. Try local worker endpoint first (which reads directly from native Chrome extension tab)
      let liveBalFromWorker: number | null = null;
      try {
        const workerRes = await fetch('http://localhost:3456/api/shell-balance');
        if (workerRes.ok) {
          const wData = await workerRes.json();
          if (wData.success && typeof wData.balance === 'number') {
            liveBalFromWorker = wData.balance;
          }
        }
      } catch (e) {}

      if (liveBalFromWorker !== null) {
        // Save worker balance to Supabase
        const updateRes = await fetch('/api/admin/shell-accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: acc.id, available_balance: liveBalFromWorker }),
        });
        const uData = await updateRes.json();
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === acc.id
              ? { ...a, available_balance: liveBalFromWorker, last_synced_at: new Date().toISOString() }
              : a
          )
        );
        showToast('success', `Live Chrome Extension sync: Fetched ${liveBalFromWorker.toLocaleString()} Shells for ${acc.account_username}!`);
        return;
      }

      // 2. Otherwise query backend sync API
      const res = await fetch('/api/admin/shell-accounts/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: acc.id,
          username: acc.account_username,
          password: acc.password || 'Shadow-2008',
        }),
      });
      const data = await res.json();
      if (data.success && typeof data.liveBalance === 'number' && data.liveBalance > 0) {
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === acc.id
              ? { ...a, available_balance: data.liveBalance, last_synced_at: data.lastSyncedAt }
              : a
          )
        );
        showToast('success', `Synced balance for ${acc.account_username}: ${data.liveBalance.toLocaleString()} Shells`);
      } else {
        showToast('error', 'Open shop.garena.my in Chrome with local worker active to auto-sync, or click Edit to update manually!');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error connecting to sync service');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (accounts.length === 0) return;
    setSyncingAll(true);
    try {
      for (const acc of accounts) {
        await handleSyncAccount(acc);
      }
    } catch (e) {
      showToast('error', 'Error syncing shell accounts');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAcc) return;
    const newBal = parseFloat(editBalance);
    if (isNaN(newBal) || newBal < 0) {
      showToast('error', 'Please enter a valid numeric Shell balance amount');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/shell-accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editAcc.id, available_balance: newBal }),
      });
      const json = await res.json();
      if (json.success) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editAcc.id ? { ...a, available_balance: newBal, last_synced_at: json.lastSyncedAt } : a))
        );
        showToast('success', `Successfully set Shell balance for ${editAcc.account_username} to ${newBal.toLocaleString()} Shells!`);
        setEditAcc(null);
      } else {
        showToast('error', json.message || 'Failed to update balance');
      }
    } catch (e) {
      showToast('error', 'Failed to save updated balance');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/shell-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_username: username,
          password: password,
          is_main: isMain,
        }),
      });

      const data = await res.json();
      if (data.success && data.account) {
        setAccounts([data.account, ...accounts.filter((a) => a.id !== data.account.id)]);
        showToast('success', data.message || `Added shell account ${username} successfully!`);
        setIsAddModalOpen(false);
        setUsername('SHADOW_TOPUP1');
        setPassword('Shadow-2008');
      } else {
        showToast('error', data.message || 'Failed to add shell account');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to connect to API');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shell account?')) return;
    try {
      const res = await fetch(`/api/admin/shell-accounts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setAccounts(accounts.filter((a) => a.id !== id));
        showToast('success', 'Shell account removed successfully.');
      }
    } catch (err: any) {
      showToast('error', 'Failed to delete account');
    }
  };

  const totalShellStock = accounts.reduce((acc, a) => acc + (a.available_balance || 0), 0);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xl transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-7 h-7 text-cyan-400" /> Garena Shell Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Garena Top-Up Center (<span className="text-cyan-400 font-mono">shop.garena.my</span>) automated stock sync engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-900/60 text-purple-300 hover:text-white hover:border-purple-600 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync Live Balances</span>
          </button>

          <button
            onClick={() => {
              setUsername('SHADOW_TOPUP1');
              setPassword('Shadow-2008');
              setIsMain(true);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Shell Account
          </button>
        </div>
      </div>

      {/* Total Stock Banner */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">Total Available Shell Inventory</span>
          <h2 className="text-3xl font-black text-cyan-400 font-mono mt-1">
            {totalShellStock.toLocaleString()} <span className="text-sm font-sans text-purple-400 uppercase font-bold">Shells</span>
          </h2>
        </div>

        <div className="text-right font-mono text-xs text-slate-400 space-y-1">
          <div>Accounts Registered: <span className="text-white font-bold">{accounts.length}</span></div>
          <div>Sync Method: <span className="text-emerald-400 font-bold">Chrome Extension / Native Bridge</span></div>
        </div>
      </div>

      {/* Account Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Account ID</th>
                <th className="p-4">Garena Username</th>
                <th className="p-4">Available Shell Stock</th>
                <th className="p-4">Last Synced</th>
                <th className="p-4">Account Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">Loading shell accounts...</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">No Garena shell accounts configured. Click "Add Shell Account" above!</td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 text-slate-400 font-bold">#{String(acc.id).slice(0, 8)}</td>
                    <td className="p-4 font-extrabold text-white uppercase flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{acc.account_username}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-base font-black text-purple-400 font-mono">
                        {acc.available_balance.toLocaleString()} Shells
                      </span>
                    </td>
                    <td className="p-4 text-[10px] text-slate-400">
                      {acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString() : 'Just now'}
                    </td>
                    <td className="p-4 font-sans">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                          acc.is_main
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {acc.is_main ? 'PRIMARY MAIN' : 'SECONDARY'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditAcc(acc);
                            setEditBalance(String(acc.available_balance || 0));
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-300 hover:text-white hover:bg-indigo-900 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all"
                          title="Edit Shell Balance"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleSyncAccount(acc)}
                          disabled={syncingId === acc.id}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800/80 text-purple-300 hover:text-white hover:bg-purple-900 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                          title="Sync live balance from Chrome Extension"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>{syncingId === acc.id ? 'Syncing...' : 'Sync'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Balance Modal */}
      {editAcc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Set Exact Shell Balance</h3>
                <p className="text-[10px] text-slate-400 font-mono">Account: {editAcc.account_username}</p>
              </div>
              <button onClick={() => setEditAcc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Available Shell Balance</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={editBalance}
                  onChange={(e) => setEditBalance(e.target.value)}
                  placeholder="e.g. 1300"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold text-base focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-sans">
                💡 Enter the exact Shell count shown on your Garena account on <strong>shop.garena.my</strong> (e.g. 1,300 Shells).
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-sans text-xs disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : <><Save className="w-4 h-4" /> Save Shell Balance</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Garena Shell Account</h3>
                <p className="text-[10px] text-slate-400 font-mono">Connect official shop.garena.my credentials</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SHADOW_TOPUP1"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Shadow-2008"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="mainAcc"
                  checked={isMain}
                  onChange={(e) => setIsMain(e.target.checked)}
                  className="rounded border-slate-800 bg-[#0e0c1f] text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="mainAcc" className="text-slate-300 font-bold text-xs font-sans">
                  Set as Primary Main Account
                </label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 font-sans text-xs disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Save Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
