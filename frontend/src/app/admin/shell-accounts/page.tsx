'use client';

import { useState } from 'react';
import { Database, Plus, Eye, Edit2, Trash2 } from 'lucide-react';

export default function AdminShellAccountsPage() {
  const [shellAccounts] = useState([
    {
      id: '1',
      accountName: 'Shdaow topup shell 1',
      transactionsCount: 0,
      username: 'SHADOW_TOPUP1',
      liveBalance: '2,213 Shells',
      status: 'MAIN ACCOUNT',
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Shell Accounts</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Garena Shell API accounts and monitor real-time stock balances.</p>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30">
          <Plus className="w-4 h-4" /> Add Shell Account
        </button>
      </div>

      {/* Accounts Table */}
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
              {shellAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{acc.accountName}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{acc.transactionsCount} Transactions</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-300 uppercase">{acc.username}</td>
                  <td className="p-4 font-mono font-bold text-purple-400 text-sm">{acc.liveBalance}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      {acc.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="w-3.5 h-3.5" />
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
