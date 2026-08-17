'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ShellAccount } from '@/types/database';
import { Database, Plus, Eye, Edit2, Trash2, X, RefreshCw } from 'lucide-react';

export default function AdminShellAccountsPage() {
  const [accounts, setAccounts] = useState<ShellAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAcc, setSelectedAcc] = useState<ShellAccount | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [balance, setBalance] = useState('2213');
  const [isMain, setIsMain] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadAccounts = async () => {
    setLoading(true);
    const { data } = await supabase.from('shell_accounts').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) {
      setAccounts(data as ShellAccount[]);
    } else {
      // Fallback display if DB is unseeded
      setAccounts([
        {
          id: '1',
          account_username: 'SHADOW_TOPUP1',
          password: 'Password123!',
          available_balance: 2213,
          is_main: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const newAcc = {
      account_username: username,
      password: password || 'DefaultSecret123!',
      available_balance: parseInt(balance) || 0,
      is_main: isMain,
      last_synced_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('shell_accounts').insert([newAcc]).select().single();
    if (!error && data) {
      setAccounts([data as ShellAccount, ...accounts]);
    } else {
      setAccounts([{ id: Date.now().toString(), ...newAcc, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ShellAccount, ...accounts]);
    }
    setIsAddModalOpen(false);
    setUsername('');
    setPassword('');
    setSaving(false);
  };

  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc) return;
    setSaving(true);

    const updated = {
      account_username: username,
      available_balance: parseInt(balance) || 0,
      is_main: isMain,
      updated_at: new Date().toISOString(),
    };

    await supabase.from('shell_accounts').update(updated).eq('id', selectedAcc.id);
    setAccounts(accounts.map((a) => (a.id === selectedAcc.id ? { ...a, ...updated } : a)));
    setIsEditModalOpen(false);
    setSelectedAcc(null);
    setSaving(false);
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shell account?')) return;
    await supabase.from('shell_accounts').delete().eq('id', id);
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  const openEditModal = (acc: ShellAccount) => {
    setSelectedAcc(acc);
    setUsername(acc.account_username);
    setBalance(acc.available_balance.toString());
    setIsMain(acc.is_main);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Shell Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Garena Shell API accounts and monitor real-time stock balances.</p>
        </div>

        <button
          onClick={() => {
            setUsername('');
            setPassword('');
            setBalance('2000');
            setIsMain(false);
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" /> Add Shell Account
        </button>
      </div>

      {/* Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Account Name</th>
                <th className="p-4">Username</th>
                <th className="p-4">Live Balance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">Shdaow topup shell {acc.id}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">0 Transactions</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-300 uppercase">{acc.account_username}</td>
                  <td className="p-4 font-mono font-bold text-purple-400 text-sm">
                    {acc.available_balance.toLocaleString()} Shells
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      acc.is_main
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {acc.is_main ? 'MAIN ACCOUNT' : 'SECONDARY'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => alert(`Username: ${acc.account_username}\nBalance: ${acc.available_balance} Shells`)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Shell Account</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Garena Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Shell Balance</label>
                <input
                  type="number"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mainAcc"
                  checked={isMain}
                  onChange={(e) => setIsMain(e.target.checked)}
                  className="rounded border-slate-800 bg-[#0e0c1f]"
                />
                <label htmlFor="mainAcc" className="text-slate-300 font-bold">Set as Main Account</label>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Save Account'}
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
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit Shell Account</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAccount} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Available Shell Balance</label>
                <input
                  type="number"
                  required
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
