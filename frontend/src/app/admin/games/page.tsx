'use client';

import { useState } from 'react';
import { Gamepad2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminGamesPage() {
  const [games] = useState([
    { id: '1', title: 'Garena Free Fire', slug: 'free-fire', category: 'Mobile', developer: 'Garena', is_active: true },
    { id: '2', title: 'Mobile Legends: Bang Bang', slug: 'mobile-legends', category: 'Mobile', developer: 'Moonton', is_active: true },
    { id: '3', title: 'PUBG Mobile', slug: 'pubg-mobile', category: 'Mobile', developer: 'Tencent Games', is_active: true },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Games Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage game catalog titles and category configurations.</p>
        </div>
        <button className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Game
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((g) => (
          <div key={g.id} className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{g.title}</h4>
                <p className="text-[10px] text-slate-400 font-mono">{g.developer}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300">
                {g.category}
              </span>
              <span className="text-emerald-400 font-bold text-[10px] uppercase">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
