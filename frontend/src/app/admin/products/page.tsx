'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gamepad2,
  Sparkles,
  DollarSign,
  Tag,
  Layers,
  ArrowUpDown,
} from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  slug: string;
  category?: string;
  image_path?: string | null;
}

interface ProductItem {
  id: string;
  name: string;
  game_id: string | null;
  price: number;
  silver_price: number | null;
  gold_price: number | null;
  stock: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  games?: GameItem | null;
}

function AdminProductsContent() {
  const searchParams = useSearchParams();
  const initialGameParam = searchParams.get('game') || '';

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Form fields
  const [formGameId, setFormGameId] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formSilverPrice, setFormSilverPrice] = useState('');
  const [formGoldPrice, setFormGoldPrice] = useState('');
  const [formStock, setFormStock] = useState('9999');
  const [formIsPublished, setFormIsPublished] = useState(true);

  // Toasts
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

  // 1. Load games catalog
  const loadGames = async () => {
    try {
      const res = await fetch('/api/admin/games');
      const data = await res.json();
      if (data.success && Array.isArray(data.games)) {
        setGames(data.games);
        if (initialGameParam) {
          const matched = data.games.find(
            (g: GameItem) => g.slug === initialGameParam || g.id === initialGameParam
          );
          if (matched) {
            setSelectedGameFilter(matched.id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    }
  };

  // 2. Load products catalog
  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        showToast('error', data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      showToast('error', 'Network error connecting to products database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
    loadProducts();
  }, []);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const gameTitle = p.games?.title || '';
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gameTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGame =
        selectedGameFilter === 'ALL' ||
        p.game_id === selectedGameFilter ||
        p.games?.slug === selectedGameFilter;

      return matchesSearch && matchesGame;
    });
  }, [products, searchQuery, selectedGameFilter]);

  // Form Reset
  const resetForm = () => {
    setFormGameId(games.length > 0 ? games[0].id : '');
    setFormName('');
    setFormPrice('');
    setFormSilverPrice('');
    setFormGoldPrice('');
    setFormStock('9999');
    setFormIsPublished(true);
    setSelectedProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    if (selectedGameFilter !== 'ALL') {
      setFormGameId(selectedGameFilter);
    }
    setIsAddModalOpen(true);
  };

  const openEditModal = (p: ProductItem) => {
    setSelectedProduct(p);
    setFormGameId(p.game_id || (games.length > 0 ? games[0].id : ''));
    setFormName(p.name);
    setFormPrice(p.price.toString());
    setFormSilverPrice(p.silver_price !== null && p.silver_price !== undefined ? p.silver_price.toString() : '');
    setFormGoldPrice(p.gold_price !== null && p.gold_price !== undefined ? p.gold_price.toString() : '');
    setFormStock(p.stock !== undefined ? p.stock.toString() : '9999');
    setFormIsPublished(p.is_published ?? true);
    setIsEditModalOpen(true);
  };

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formName.trim(),
      game_id: formGameId || null,
      price: parseFloat(formPrice) || 0,
      silver_price: formSilverPrice ? parseFloat(formSilverPrice) : null,
      gold_price: formGoldPrice ? parseFloat(formGoldPrice) : null,
      stock: parseInt(formStock) || 0,
      is_published: formIsPublished,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showToast('success', `Created product "${payload.name}" successfully!`);
        setIsAddModalOpen(false);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showToast('error', 'Network error adding product');
    } finally {
      setSaving(false);
    }
  };

  // Edit Product Handler
  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);

    const payload = {
      id: selectedProduct.id,
      name: formName.trim(),
      game_id: formGameId || null,
      price: parseFloat(formPrice) || 0,
      silver_price: formSilverPrice ? parseFloat(formSilverPrice) : null,
      gold_price: formGoldPrice ? parseFloat(formGoldPrice) : null,
      stock: parseInt(formStock) || 0,
      is_published: formIsPublished,
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((item) => (item.id === selectedProduct.id ? data.product : item))
        );
        showToast('success', `Updated product "${payload.name}" successfully!`);
        setIsEditModalOpen(false);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      showToast('error', 'Network error updating product');
    } finally {
      setSaving(false);
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (p: ProductItem) => {
    if (!confirm(`Are you sure you want to delete "${p.name}" from the database?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(p.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setProducts((prev) => prev.filter((item) => item.id !== p.id));
        showToast('success', `Product "${p.name}" removed successfully.`);
      } else {
        showToast('error', data.message || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('error', 'Network error deleting product');
    }
  };

  // Quick Markup Helper
  const applyRecommendedPrices = () => {
    const base = parseFloat(formPrice);
    if (!isNaN(base) && base > 0) {
      const silver = Math.round(base * 0.93);
      const gold = Math.round(base * 0.88);
      setFormSilverPrice(silver.toString());
      setFormGoldPrice(gold.toString());
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert Banner */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between font-mono text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header & Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" /> INVENTORY MANAGEMENT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
            Product Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage top-up catalog items, normal & reseller pricing tiers, stock availability, and publication status.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Game Filter Dropdown */}
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="ALL">All Games Catalog</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>

          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Metrics Header Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#141229] border border-purple-950/40">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Total Products</span>
          <p className="text-xl font-black text-white mt-1 font-mono">{products.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#141229] border border-purple-950/40">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Active / Published</span>
          <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
            {products.filter((p) => p.is_published).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-[#141229] border border-purple-950/40">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Supported Games</span>
          <p className="text-xl font-black text-cyan-400 mt-1 font-mono">{games.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-[#141229] border border-purple-950/40">
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Filtered Results</span>
          <p className="text-xl font-black text-purple-300 mt-1 font-mono">{filteredProducts.length}</p>
        </div>
      </div>

      {/* Product Inventory Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Game</th>
                <th className="p-4">Normal Price</th>
                <th className="p-4">Reseller Tiers (Silver / Gold)</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading products from database...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 font-mono">
                    No products found matching the criteria. Click &quot;Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const gameTitle = p.games?.title || 'General / Unlinked';
                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Product Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-xs">{p.name}</h5>
                            <span className="text-[9px] text-slate-500 font-mono">ID: {p.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Game */}
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 font-mono text-[10px] font-bold">
                          {gameTitle}
                        </span>
                      </td>

                      {/* Normal Price */}
                      <td className="p-4 font-mono font-bold text-emerald-400 text-xs">
                        LKR {Number(p.price || 0).toFixed(2)}
                      </td>

                      {/* Reseller Tiers */}
                      <td className="p-4 font-mono text-[11px] space-y-0.5">
                        <div>
                          <span className="text-slate-400 font-bold">Silver:</span>{' '}
                          <span className="text-cyan-300 font-bold">
                            {p.silver_price !== null ? `LKR ${Number(p.silver_price).toFixed(2)}` : '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-bold">Gold:</span>{' '}
                          <span className="text-amber-300 font-bold">
                            {p.gold_price !== null ? `LKR ${Number(p.gold_price).toFixed(2)}` : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="p-4 font-mono text-slate-300 text-xs">
                        {p.stock > 0 ? (
                          <span>{p.stock.toLocaleString()}</span>
                        ) : (
                          <span className="text-red-400 font-bold">Out of Stock</span>
                        )}
                      </td>

                      {/* Publication Status */}
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            p.is_published
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border border-slate-700 text-slate-400'
                          }`}
                        >
                          {p.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/80 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                {isEditModalOpen ? 'Edit Product Item' : 'Add New Product Item'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={isEditModalOpen ? handleEditProduct : handleAddProduct} className="space-y-4 text-xs">
              {/* Game Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Game</label>
                <select
                  value={formGameId}
                  onChange={(e) => setFormGameId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                >
                  <option value="">-- Unlinked / General --</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 100 Diamonds, Weekly Pass, 60 UC"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Normal Price */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-emerald-400 uppercase">
                    Normal Customer Price (LKR)
                  </label>
                  <button
                    type="button"
                    onClick={applyRecommendedPrices}
                    className="text-[9px] text-cyan-400 hover:underline font-mono font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto Reseller Tiers
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="e.g. 350.00"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Reseller Tier Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">
                    Silver Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formSilverPrice}
                    onChange={(e) => setFormSilverPrice(e.target.value)}
                    placeholder="e.g. 320.00"
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-amber-400 uppercase mb-1">
                    Gold Price (LKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formGoldPrice}
                    onChange={(e) => setFormGoldPrice(e.target.value)}
                    placeholder="e.g. 300.00"
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={formStock}
                  onChange={(e) => setFormStock(e.target.value)}
                  placeholder="9999"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-900/40">
                <input
                  type="checkbox"
                  id="product-is-published"
                  checked={formIsPublished}
                  onChange={(e) => setFormIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="product-is-published" className="text-xs text-white font-semibold cursor-pointer">
                  Product is Published (Visible to users)
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to Database...
                    </>
                  ) : isEditModalOpen ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          Loading product inventory...
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}
