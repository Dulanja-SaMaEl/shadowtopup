'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Gamepad2, Plus, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';

export default function AdminGamesPage() {
  const [games] = useState([
    { id: '1', title: 'FREE FIRE', category: 'GAMING', productsListed: 6, is_active: true },
    { id: '2', title: 'PUBG MOBILE', category: 'GAMING', productsListed: 4, is_active: true },
    { id: '3', title: 'MOBILE LEGENDS', category: 'GAMING', productsListed: 4, is_active: true },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Game Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Manage supported games, categories, and top-up offerings.</p>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30">
          <Plus className="w-4 h-4" /> Add New Game
        </button>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((g) => (
          <div key={g.id} className="rounded-3xl bg-[#141229] border border-purple-950/40 overflow-hidden flex flex-col justify-between">
            {/* Top Placeholder Image Area */}
            <div className="h-44 bg-[#0e0c1f] flex items-center justify-center border-b border-purple-950/30 relative">
              <ImageIcon className="w-12 h-12 text-purple-600/40" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400">
                  <Gamepad2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">{g.title}</h4>
                  <span className="text-[9px] font-mono text-purple-400 font-bold uppercase">{g.category}</span>
                </div>
              </div>
            </div>

            {/* Content & Details */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 text-[10px] font-mono uppercase font-bold">
                  {g.productsListed} Products Listed
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                  Active Catalog
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                <button className="col-span-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase">
                  Edit
                </button>
                <Link
                  href="/admin/products"
                  className="col-span-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider text-center shadow-md shadow-purple-600/30 flex items-center justify-center"
                >
                  Products
                </Link>
                <button className="col-span-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
