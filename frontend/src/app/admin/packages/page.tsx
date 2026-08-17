'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package } from '@/types/database';
import { ShieldCheck, Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';

const mockAdminPackages: Package[] = [
  {
    id: 'pkg-100',
    package_name: '100 Diamonds',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 100,
    normal_price: 1.20,
    silver_price: 1.10,
    gold_price: 1.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-310',
    package_name: '310 Diamonds',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 300,
    normal_price: 3.50,
    silver_price: 3.25,
    gold_price: 3.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-520',
    package_name: '520 Diamonds',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 500,
    normal_price: 5.80,
    silver_price: 5.40,
    gold_price: 5.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-1060',
    package_name: '1060 Diamonds',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 1000,
    normal_price: 11.50,
    silver_price: 10.80,
    gold_price: 10.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>(mockAdminPackages);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Free Fire Package Matrix</h1>
            <p className="text-xs text-slate-400">Configure diamond amounts, shell costs, and reseller tier rates</p>
          </div>
        </div>

        <button className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add New Package
        </button>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Package Name</th>
                <th className="p-4">Diamonds</th>
                <th className="p-4">Shell Cost</th>
                <th className="p-4">Normal Price</th>
                <th className="p-4">Silver Price</th>
                <th className="p-4">Gold Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-950/50">
                  <td className="p-4 font-bold text-white">{pkg.package_name}</td>
                  <td className="p-4 font-mono text-cyan-400">{pkg.diamond_amount} 💎</td>
                  <td className="p-4 font-mono text-amber-400">{pkg.shell_cost} Shells</td>
                  <td className="p-4 font-mono text-white">${pkg.normal_price.toFixed(2)}</td>
                  <td className="p-4 font-mono text-slate-300">${pkg.silver_price.toFixed(2)}</td>
                  <td className="p-4 font-mono text-amber-300">${pkg.gold_price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                      <Trash2 className="w-4 h-4" />
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
