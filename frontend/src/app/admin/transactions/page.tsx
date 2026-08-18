'use client';

import { useState } from 'react';
import { Receipt, Search, Filter } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [userIdFilter, setUserIdFilter] = useState('');

  const [transactions] = useState([
    {
      timestamp: 'Aug 18, 2026 11:30:00',
      user: 'User Account',
      userTier: 'NORMAL TIER',
      freeFireId: '8777843685',
      packageItem: '100 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 750.00',
      method: 'BANK TRANSFER',
      receipt: 'VERIFIED RECEIPT',
      status: 'COMPLETED',
    },
    {
      timestamp: 'Aug 17, 2026 10:15:00',
      user: 'User Account',
      userTier: 'NORMAL TIER',
      freeFireId: '8777843685',
      packageItem: '310 Diamond Pack',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 2,100.00',
      method: 'BANK TRANSFER',
      receipt: 'RECEIPT UPLOADED',
      status: 'PENDING',
    },
    {
      timestamp: 'Aug 16, 2026 14:20:00',
      user: 'Gold Reseller',
      userTier: 'GOLD TIER',
      freeFireId: '1092837465',
      packageItem: '520 Diamond Pack',
      shellAcc: 'Shell Acc: #2',
      amount: 'LKR 3,450.00',
      method: 'VISA / MASTERCARD',
      receipt: 'PAYPAL REF #9921',
      status: 'COMPLETED',
    },
    {
      timestamp: 'Aug 15, 2026 09:05:00',
      user: 'Silver Reseller',
      userTier: 'SILVER TIER',
      freeFireId: '4455667788',
      packageItem: 'Weekly Diamond Pass',
      shellAcc: 'Shell Acc: #1',
      amount: 'LKR 1,200.00',
      method: 'EZ CASH',
      receipt: 'EZ #7712',
      status: 'COMPLETED',
    },
    {
      timestamp: 'Aug 12, 2026 16:40:00',
      user: 'Dulanja Abeysinghe',
      userTier: 'ADMIN TIER',
      freeFireId: '9876543210',
      packageItem: '1060 Diamond Pack',
      shellAcc: 'Shell Acc: #3',
      amount: 'LKR 6,800.00',
      method: 'BANK TRANSFER',
      receipt: 'VERIFIED RECEIPT',
      status: 'COMPLETED',
    },
  ]);

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'All Statuses' && tx.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (userIdFilter && !tx.user.toLowerCase().includes(userIdFilter.toLowerCase()) && !tx.freeFireId.includes(userIdFilter)) {
      return false;
    }
    return true;
  });

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
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Customer User ID / Player ID
            </label>
            <input
              type="text"
              placeholder="Search User or Player ID..."
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              className="px-4 py-2 bg-[#0e0c1f] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none w-56 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStatusFilter('All Statuses'); setUserIdFilter(''); }}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset Filters
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
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((tx, idx) => (
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
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status}
                    </span>
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
