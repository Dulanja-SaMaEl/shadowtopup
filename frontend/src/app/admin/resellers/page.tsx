'use client';

import { useState } from 'react';
import { Award, Check, X } from 'lucide-react';

export default function AdminResellersPage() {
  const [resellers] = useState([
    { id: '1', name: 'Kasun Perera', email: 'kasun@reseller.lk', tier: 'Gold', status: 'approved', sales: 'Rs. 12,400.00' },
    { id: '2', name: 'Sahan Fernando', email: 'sahan@topup.lk', tier: 'Silver', status: 'approved', sales: 'Rs. 4,850.00' },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Resellers Directory</h1>
        <p className="text-xs text-slate-400 mt-1">Manage Gold and Silver reseller tier permissions and applications.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Merchant Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Assigned Tier</th>
                <th className="p-4">Volume (Rs.)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {resellers.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{r.name}</td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{r.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase text-[10px]">
                      {r.tier} Tier
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-400">{r.sales}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      Active
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
