'use client';

import { useState } from 'react';
import { Package, Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [products] = useState([
    { id: '1', name: '100 Diamonds', description: '100 Diamonds for Free Fire', game: 'FREE FIRE', price: 1.00, status: 'PUBLISHED' },
    { id: '2', name: '210 Diamonds', description: '210 Diamonds for Free Fire', game: 'FREE FIRE', price: 2.00, status: 'PUBLISHED' },
    { id: '3', name: '530 Diamonds', description: '530 Diamonds for Free Fire', game: 'FREE FIRE', price: 5.00, status: 'PUBLISHED' },
    { id: '4', name: '1080 Diamonds', description: '1080 Diamonds for Free Fire', game: 'FREE FIRE', price: 10.00, status: 'PUBLISHED' },
    { id: '5', name: 'Weekly Pass', description: 'Weekly Pass for Free Fire', game: 'FREE FIRE', price: 2.50, status: 'PUBLISHED' },
    { id: '6', name: 'Monthly Pass', description: 'Monthly Pass for Free Fire', game: 'FREE FIRE', price: 12.00, status: 'PUBLISHED' },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Product Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage game top-up items, prices, and catalog publication states.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="px-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white focus:outline-none">
            <option>All Games Catalog</option>
            <option>Free Fire</option>
            <option>PUBG Mobile</option>
            <option>Mobile Legends</option>
          </select>

          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30">
            Filter
          </button>

          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Game</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{p.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{p.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono text-[10px] font-bold">
                      {p.game}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">LKR {p.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 hover:text-white">
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
