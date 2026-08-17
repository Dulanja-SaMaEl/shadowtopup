'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Gamepad2, Plus, Edit2, Trash2, Image as ImageIcon, X } from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  category: string;
  productsListed: number;
  is_active: boolean;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameItem[]>([
    { id: '1', title: 'FREE FIRE', category: 'GAMING', productsListed: 6, is_active: true },
    { id: '2', title: 'PUBG MOBILE', category: 'GAMING', productsListed: 4, is_active: true },
    { id: '3', title: 'MOBILE LEGENDS', category: 'GAMING', productsListed: 4, is_active: true },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('GAMING');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase.from('games').select('*');
      if (data && data.length > 0) {
        setGames(
          data.map((g) => ({
            id: g.id,
            title: g.title || g.name || 'GAME',
            category: g.category || 'GAMING',
            productsListed: g.products_count || 4,
            is_active: g.is_active ?? true,
          }))
        );
      }
    }
    loadGames();
  }, []);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newGame: GameItem = {
      id: Date.now().toString(),
      title: title.toUpperCase(),
      category: category.toUpperCase(),
      productsListed: 0,
      is_active: true,
    };

    await supabase.from('games').insert([
      { title: newGame.title, category: newGame.category, is_active: true },
    ]);

    setGames([...games, newGame]);
    setIsAddModalOpen(false);
    setTitle('');
    setSaving(false);
  };

  const handleEditGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    setSaving(true);

    const updated = {
      title: title.toUpperCase(),
      category: category.toUpperCase(),
    };

    await supabase.from('games').update(updated).eq('id', selectedGame.id);
    setGames(games.map((g) => (g.id === selectedGame.id ? { ...g, ...updated } : g)));
    setIsEditModalOpen(false);
    setSelectedGame(null);
    setSaving(false);
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game from the catalog?')) return;
    await supabase.from('games').delete().eq('id', id);
    setGames(games.filter((g) => g.id !== id));
  };

  const openEditModal = (game: GameItem) => {
    setSelectedGame(game);
    setTitle(game.title);
    setCategory(game.category);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Game Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">Manage supported games, categories, and top-up offerings.</p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setCategory('GAMING');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" /> Add New Game
        </button>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {games.map((g) => (
          <div key={g.id} className="rounded-3xl bg-[#141229] border border-purple-950/40 overflow-hidden flex flex-col justify-between">
            {/* Image Placeholder */}
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
                <button
                  onClick={() => openEditModal(g)}
                  className="col-span-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase"
                >
                  Edit
                </button>
                <Link
                  href="/admin/products"
                  className="col-span-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider text-center shadow-md shadow-purple-600/30 flex items-center justify-center"
                >
                  Products
                </Link>
                <button
                  onClick={() => handleDeleteGame(g.id)}
                  className="col-span-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add New Game</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CALL OF DUTY"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Add Game'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit Game</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditGame} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Game'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
