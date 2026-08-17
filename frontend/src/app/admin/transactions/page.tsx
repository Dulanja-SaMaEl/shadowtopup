'use client';

import { useState } from 'react';
import { Receipt, CheckCircle2 } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [transactions] = useState([
    { id: 'TXN-9021', user: 'Dulanja Abeysinghe', package: '520 Diamonds', player_id: '891024810', shells: 500, price: 'Rs. 580.00', status: 'success', date: 'May 16, 2026' },
    { id: 'TXN-9020', user: 'User One', package: '100 Diamonds', player_id: '124810294', shells: 100, price: 'Rs. 120.00', status: 'success', date: 'May 11, 2026' },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Top-up Transactions Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">Audit automated Garena Shell deductions and diamond fulfillment events.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Txn Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Package</th>
                <th className="p-4">Free Fire UID</th>
                <th className="p-4">Shells Used</th>
                <th className="p-4">Price Paid (Rs.)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-mono font-bold text-purple-400">{t.id}</td>
                  <td className="p-4 font-bold text-white">{t.user}</td>
                  <td className="p-4 text-slate-300">{t.package}</td>
                  <td className="p-4 font-mono text-cyan-400">{t.player_id}</td>
                  <td className="p-4 font-mono text-amber-400">{t.shells} Shells</td>
                  <td className="p-4 font-bold text-emerald-400">{t.price}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {t.status}
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
