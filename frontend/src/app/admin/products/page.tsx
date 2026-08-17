'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, Plus, Search, Edit2, Trash2, X } from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  description: string;
  game: string;
  price: number;
  status: string;
}

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState('All Games Catalog');

  const [products, setProducts] = useState<ProductItem[]>([
    { id: '1', name: '100 Diamonds', description: '100 Diamonds for Free Fire', game: 'FREE FIRE', price: 1.00, status: 'PUBLISHED' },
    { id: '2', name: '210 Diamonds', description: '210 Diamonds for Free Fire', game: 'FREE FIRE', price: 2.00, status: 'PUBLISHED' },
    { id: '3', name: '530 Diamonds', description: '530 Diamonds for Free Fire', game: 'FREE FIRE', price: 5.00, status: 'PUBLISHED' },
    { id: '4', name: '1080 Diamonds', description: '1080 Diamonds for Free Fire', game: 'FREE FIRE', price: 10.00, status: 'PUBLISHED' },
    { id: '5', name: 'Weekly Pass', description: 'Weekly Pass for Free Fire', game: 'FREE FIRE', price: 2.50, status: 'PUBLISHED' },
    { id: '6', name: 'Monthly Pass', description: 'Monthly Pass for Free Fire', game: 'FREE FIRE', price: 12.00, status: 'PUBLISHED' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState('FREE FIRE');
  const [price, setPrice] = useState('1.00');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from('products').select('*');
      if (data && data.length > 0) {
        setProducts(
          data.map((p) => ({
            id: p.id,
            name: p.name || p.title,
            description: p.description || `${p.name} item`,
            game: p.game_type || 'FREE FIRE',
            price: Number(p.price || 1.00),
            status: 'PUBLISHED',
          }))
        );
      }
    }
    loadProducts();
  }, []);

  // Filtered List Logic
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGame =
      selectedGameFilter === 'All Games Catalog' ||
      p.game.toLowerCase() === selectedGameFilter.toLowerCase();

    return matchesSearch && matchesGame;
  });

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newProd: ProductItem = {
      id: Date.now().toString(),
      name,
      description: description || `${name} for ${game}`,
      game: game.toUpperCase(),
      price: parseFloat(price) || 1.00,
      status: 'PUBLISHED',
    };

    await supabase.from('products').insert([
      { name: newProd.name, description: newProd.description, game_type: newProd.game, price: newProd.price },
    ]);

    setProducts([...products, newProd]);
    setIsAddModalOpen(false);
    setName('');
    setDescription('');
    setSaving(false);
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSaving(true);

    const updated = {
      name,
      description,
      game: game.toUpperCase(),
      price: parseFloat(price) || 1.00,
    };

    await supabase.from('products').update(updated).eq('id', selectedProduct.id);
    setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...p, ...updated } : p)));
    setIsEditModalOpen(false);
    setSelectedProduct(null);
    setSaving(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(products.filter((p) => p.id !== id));
  };

  const openEditModal = (p: ProductItem) => {
    setSelectedProduct(p);
    setName(p.name);
    setDescription(p.description);
    setGame(p.game);
    setPrice(p.price.toString());
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Product Inventory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage game top-up items, prices, and catalog publication states.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
            className="px-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white focus:outline-none"
          >
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
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={() => {
              setName('Weekly Diamond Pass');
              setDescription('Weekly Pass item');
              setGame('FREE FIRE');
              setPrice('2.50');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 whitespace-nowrap"
          >
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
              {filteredProducts.map((p) => (
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
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-purple-300 hover:text-white"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Product Item</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Game</label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                >
                  <option value="FREE FIRE">FREE FIRE</option>
                  <option value="PUBG MOBILE">PUBG MOBILE</option>
                  <option value="MOBILE LEGENDS">MOBILE LEGENDS</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Add Product'}
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
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit Product</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
