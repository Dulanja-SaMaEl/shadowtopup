'use client';

import { useState } from 'react';
import { Receipt, Search, Filter } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [userIdFilter, setUserIdFilter] = useState('');

  const [transactions] = useState([
    {
      timestamp: 'Aug 11, 2026 19:04:19',
      user: 'User One',
      userTier: 'NORMAL TIER',
      freeFireId: '123456789',
      packageItem: '25 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 75.26',
      method: 'PAYPAL',
      receipt: 'N/A',
      status: 'TOPUP PENDING',
    },
    {
      timestamp: 'Jul 02, 2026 03:09:42',
      user: 'Dulanja Abeysinghe',
      userTier: 'SILVER TIER',
      freeFireId: '8777843685',
      packageItem: '25 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 73.13',
      method: 'BANK TRANSFER',
      receipt: 'N/A',
      status: 'TOPUP PENDING',
    },
    {
      timestamp: 'Jul 02, 2026 03:09:32',
      user: 'Dulanja Abeysinghe',
      userTier: 'SILVER TIER',
      freeFireId: '8777843685',
      packageItem: '25 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 73.13',
      method: 'PAYPAL',
      receipt: 'N/A',
      status: 'TOPUP PENDING',
    },
    {
      timestamp: 'Jun 29, 2026 05:54:34',
      user: 'User One',
      userTier: 'NORMAL TIER',
      freeFireId: '9484238215',
      packageItem: '25 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 71.00',
      method: 'PAYPAL',
      receipt: 'N/A',
      status: 'TOPUP PENDING',
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Purchase Transactions</h1>
        <p className="text-xs text-slate-400 mt-1">Audit log of customer top-up transactions, payment statuses, and Garena dispatch records.</p>
      </div>

      {/* Filter Bar Card */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#0e0c1f] border border-purple-950/60 rounded-xl text-xs text-white focus:outline-none w-44"
            >
              <option>All Statuses</option>
              <option>Pending</option>
              <option>Completed</option>
              <option>Failed</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Customer User ID
            </label>
            <input
              type="text"
              placeholder="User ID..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="px-4 py-2 bg-[#0e0c1f] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-2">
            <button className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30">
              Filter
            </button>
            <button className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Free Fire ID</th>
                <th className="p-4">Package Item</th>
                <th className="p-4">Amount / Method</th>
                <th className="p-4">Reference / Receipt</th>
                <th className="p-4">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{tx.timestamp}</td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{tx.user}</h5>
                      <p className="text-[9px] text-purple-400 font-mono font-bold">{tx.userTier}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-amber-400 text-xs">{tx.freeFireId}</td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{tx.packageItem}</h5>
                      <p className="text-[9px] text-slate-400 font-mono">{tx.shellAcc}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-emerald-400 font-mono text-xs">{tx.amount}</h5>
                      <p className="text-[9px] text-cyan-400 font-mono font-bold">METHOD: {tx.method}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400 text-[10px]">{tx.receipt}</td>
                  <td className="p-4">
                    <button className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase tracking-wider">
                      {tx.status}
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
