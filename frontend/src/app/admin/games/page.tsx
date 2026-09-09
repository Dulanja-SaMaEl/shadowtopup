'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Plus, Edit2, Trash2, Image as ImageIcon, X, UploadCloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  image_path?: string | null;
  description?: string | null;
  productsListed?: number;
  is_active: boolean;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('MOBILE');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

  const loadGames = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/games');
      const data = await res.json();
      if (data.success && Array.isArray(data.games)) {
        setGames(
          data.games.map((g: any) => ({
            id: g.id,
            title: g.title || 'GAME',
            slug: g.slug || 'game',
            category: g.category || 'MOBILE',
            image_path: g.image_path || null,
            description: g.description || null,
            productsListed: g.slug === 'free-fire' ? 6 : 4,
            is_active: g.is_active ?? true,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading games from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/games/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        setImagePath(data.url);
        setImagePreview(data.url);
        showToast('success', 'Game image uploaded successfully!');
      } else {
        showToast('error', data.message || 'Image upload failed');
      }
    } catch (err: any) {
      showToast('error', 'Network error uploading game image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!selectedGame) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim(),
          description: description.trim(),
          image_path: imagePath.trim() || null,
          is_active: isActive,
        }),
      });
      const data = await res.json();

      if (data.success && data.game) {
        setGames((prev) => [...prev, {
          id: data.game.id,
          title: data.game.title,
          slug: data.game.slug,
          category: data.game.category,
          image_path: data.game.image_path,
          description: data.game.description,
          productsListed: 0,
          is_active: data.game.is_active,
        }]);
        showToast('success', `Added game "${data.game.title}" with image successfully!`);
        setIsAddModalOpen(false);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to add game');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error connecting to API');
    } finally {
      setSaving(false);
    }
  };

  const handleEditGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGame.id,
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim(),
          description: description.trim(),
          image_path: imagePath.trim() || null,
          is_active: isActive,
        }),
      });
      const data = await res.json();

      if (data.success && data.game) {
        setGames((prev) =>
          prev.map((g) =>
            g.id === selectedGame.id
              ? {
                  ...g,
                  title: data.game.title,
                  slug: data.game.slug,
                  category: data.game.category,
                  image_path: data.game.image_path,
                  description: data.game.description,
                  is_active: data.game.is_active,
                }
              : g
          )
        );
        showToast('success', `Updated game "${data.game.title}" successfully!`);
        setIsEditModalOpen(false);
        setSelectedGame(null);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to update game');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error connecting to API');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGame = async (id: string, gameTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${gameTitle}" from the catalog?`)) return;
    try {
      const res = await fetch(`/api/admin/games?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setGames((prev) => prev.filter((g) => g.id !== id));
        showToast('success', `Removed "${gameTitle}" from catalog.`);
      } else {
        showToast('error', data.message || 'Failed to delete game');
      }
    } catch (err: any) {
      showToast('error', 'Error deleting game');
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (game: GameItem) => {
    setSelectedGame(game);
    setTitle(game.title);
    setSlug(game.slug);
    setCategory(game.category);
    setDescription(game.description || '');
    setImagePath(game.image_path || '');
    setImagePreview(game.image_path || null);
    setIsActive(game.is_active);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setCategory('MOBILE');
    setDescription('');
    setImagePath('');
    setImagePreview(null);
    setIsActive(true);
    setSelectedGame(null);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-xl transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-7 h-7 text-purple-400" /> Game Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage supported games, upload customer-facing game banner images, and configure top-up routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadGames}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-900/60 text-purple-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Game
          </button>
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-slate-500 font-mono text-xs">
            Loading catalog from Supabase database...
          </div>
        ) : games.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-slate-500 font-mono text-xs">
            No games in catalog. Click "Add New Game" above to add your first game.
          </div>
        ) : (
          games.map((g) => (
            <div key={g.id} className="rounded-3xl bg-[#141229] border border-purple-950/40 overflow-hidden flex flex-col justify-between shadow-2xl hover:border-purple-500/50 transition-all">
              {/* Game Card Image Banner */}
              <div className="h-48 bg-[#0e0c1f] relative border-b border-purple-950/30 overflow-hidden group">
                {g.image_path ? (
                  <img
                    src={g.image_path}
                    alt={g.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950">
                    <ImageIcon className="w-12 h-12 text-purple-600/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-black/40" />

                {/* Status Badges */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-center">
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-purple-500/30 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    {g.category}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-sm border ${
                      g.is_active
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    {g.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-900/90 border border-purple-500/40 flex items-center justify-center text-cyan-400 shadow-lg shrink-0">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider truncate drop-shadow-md">
                      {g.title}
                    </h4>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                      /games/{g.slug}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content & Details */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {g.description || 'Automated diamond and gaming top-up delivery.'}
                </p>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/60">
                  <span className="text-slate-400 text-[10px] font-mono uppercase font-bold">
                    {g.productsListed} Products Listed
                  </span>
                  <Link
                    href={`/games/${g.slug}`}
                    target="_blank"
                    className="text-[10px] text-cyan-400 font-mono font-bold hover:underline"
                  >
                    View Customer Page &rarr;
                  </Link>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => openEditModal(g)}
                    className="col-span-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <Link
                    href={`/admin/products?game=${g.id}`}
                    className="col-span-2 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider text-center shadow-md shadow-purple-600/30 flex items-center justify-center transition-all"
                  >
                    Products
                  </Link>
                  <button
                    onClick={() => handleDeleteGame(g.id, g.title)}
                    className="col-span-1 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 flex items-center justify-center transition-all"
                    title="Delete Game"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Game Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/80 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Add New Game</h3>
                <p className="text-[10px] text-slate-400 font-mono">Create catalog item and upload customer-facing game image</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGame} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call of Duty: Mobile"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. codm"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                  >
                    <option value="BATTLE ROYALE">BATTLE ROYALE</option>
                    <option value="MOBA">MOBA</option>
                    <option value="FPS">FPS</option>
                    <option value="MOBILE">MOBILE</option>
                    <option value="RPG">RPG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the game and top-up offering..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-sans"
                />
              </div>

              {/* Image Upload Area */}
              <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-purple-300 uppercase">Game Banner Image</label>
                  {uploadingImage && <span className="text-[10px] text-cyan-400 animate-pulse">Uploading image...</span>}
                </div>

                {imagePreview ? (
                  <div className="relative h-36 rounded-xl overflow-hidden bg-black border border-purple-950/60 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePath(''); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2 hover:border-purple-500/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-purple-400/60 mx-auto" />
                    <div className="text-[11px] text-slate-400 font-sans">
                      Select an image file to upload (PNG, JPG, WEBP)
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer disabled:opacity-50"
                />

                <div className="text-[10px] text-slate-500">
                  <span>Or enter direct Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imagePath}
                    onChange={(e) => {
                      setImagePath(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-sans">
                <input
                  type="checkbox"
                  id="isActiveAdd"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label htmlFor="isActiveAdd" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Publish as Active on Storefront
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold uppercase shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/80 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider">Edit Game: {selectedGame?.title}</h3>
                <p className="text-[10px] text-slate-400 font-mono">Update game info, change banner image, or toggle visibility</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditGame} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Game Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                  >
                    <option value="BATTLE ROYALE">BATTLE ROYALE</option>
                    <option value="MOBA">MOBA</option>
                    <option value="FPS">FPS</option>
                    <option value="MOBILE">MOBILE</option>
                    <option value="RPG">RPG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-sans"
                />
              </div>

              {/* Edit Image Upload Area */}
              <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-purple-300 uppercase">Game Banner Image</label>
                  {uploadingImage && <span className="text-[10px] text-cyan-400 animate-pulse">Uploading...</span>}
                </div>

                {imagePreview ? (
                  <div className="relative h-36 rounded-xl overflow-hidden bg-black border border-purple-950/60 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePath(''); setImagePreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 text-white hover:bg-red-500"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center space-y-2 hover:border-purple-500/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-purple-400/60 mx-auto" />
                    <div className="text-[11px] text-slate-400 font-sans">
                      Select an image file to upload (PNG, JPG, WEBP)
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer disabled:opacity-50"
                />

                <div className="text-[10px] text-slate-500">
                  <span>Or enter direct Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imagePath}
                    onChange={(e) => {
                      setImagePath(e.target.value);
                      setImagePreview(e.target.value || null);
                    }}
                    className="w-full mt-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-[10px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 font-sans">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label htmlFor="isActiveEdit" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Publish as Active on Storefront
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800 font-sans">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold uppercase shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Game'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
