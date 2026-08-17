'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages] = useState([
    {
      id: '1',
      name: '25 Diamond Pack',
      subtext: '25 Diamonds',
      type: 'DIAMOND',
      shellCost: 13,
      prices: {
        normal: 'LKR 75.26',
        silver: 'LKR 73.13',
        gold: 'LKR 72.42',
      },
      status: 'ACTIVE',
    },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Packages</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Garena Shell cost structures and tiered prices (Normal / Silver / Gold).</p>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      {/* Packages Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Package Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Shell Cost</th>
                <th className="p-4">Calculated Prices (N / S / G)</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{pkg.name}</h5>
                      <p className="text-[10px] text-purple-400 font-mono">{pkg.subtext}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                      {pkg.type}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-400 text-sm">{pkg.shellCost}</td>
                  <td className="p-4 font-mono text-[11px] space-y-0.5">
                    <div><span className="text-slate-400 font-bold">N:</span> <span className="text-white font-bold">{pkg.prices.normal}</span></div>
                    <div><span className="text-slate-400 font-bold">S:</span> <span className="text-cyan-400 font-bold">{pkg.prices.silver}</span></div>
                    <div><span className="text-slate-400 font-bold">G:</span> <span className="text-amber-400 font-bold">{pkg.prices.gold}</span></div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      {pkg.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
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
