'use client';

import { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';

export default function AdminProductsPage() {
  const [products] = useState([
    { id: '1', name: 'Weekly Diamond Pass', game: 'Free Fire', price: 650.00, stock: 150, is_published: true },
    { id: '2', name: '50 Diamonds Voucher', game: 'Free Fire', price: 180.00, stock: 500, is_published: true },
    { id: '3', name: 'Mobile Legends 86 Diamonds', game: 'Mobile Legends', price: 420.00, stock: 200, is_published: true },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Products Management</h1>
          <p className="text-xs text-slate-400 mt-1">Configure digital gift cards, passes, and top-up items.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Game</th>
                <th className="p-4">Retail Price (Rs.)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{p.name}</td>
                  <td className="p-4 text-purple-300 font-mono">{p.game}</td>
                  <td className="p-4 font-bold text-emerald-400">Rs. {p.price.toFixed(2)}</td>
                  <td className="p-4 font-mono text-slate-300">{p.stock} units</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase">
                      Published
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
