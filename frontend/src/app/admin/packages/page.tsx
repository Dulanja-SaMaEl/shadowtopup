'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package } from '@/types/database';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Form fields
  const [packageName, setPackageName] = useState('');
  const [diamondAmount, setDiamondAmount] = useState('25');
  const [shellCost, setShellCost] = useState('13');
  const [normalPrice, setNormalPrice] = useState('75.26');
  const [silverPrice, setSilverPrice] = useState('73.13');
  const [goldPrice, setGoldPrice] = useState('72.42');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const loadPackages = async () => {
    setLoading(true);
    const { data } = await supabase.from('packages').select('*').order('shell_cost', { ascending: true });
    if (data && data.length > 0) {
      setPackages(data as Package[]);
    } else {
      setPackages([
        {
          id: '1',
          package_name: '25 Diamond Pack',
          package_type: 'diamond',
          diamond_amount: 25,
          shell_cost: 13,
          normal_price: 75.26,
          silver_price: 73.13,
          gold_price: 72.42,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newPkg = {
      package_name: packageName,
      package_type: 'diamond',
      diamond_amount: parseInt(diamondAmount) || 25,
      shell_cost: parseInt(shellCost) || 13,
      normal_price: parseFloat(normalPrice) || 75.26,
      silver_price: parseFloat(silverPrice) || 73.13,
      gold_price: parseFloat(goldPrice) || 72.42,
      is_active: true,
    };

    const { data, error } = await supabase.from('packages').insert([newPkg]).select().single();
    if (!error && data) {
      setPackages([...packages, data as Package]);
    } else {
      setPackages([...packages, { id: Date.now().toString(), ...newPkg, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Package]);
    }

    setIsAddModalOpen(false);
    setPackageName('');
    setSaving(false);
  };

  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setSaving(true);

    const updated = {
      package_name: packageName,
      diamond_amount: parseInt(diamondAmount) || 25,
      shell_cost: parseInt(shellCost) || 13,
      normal_price: parseFloat(normalPrice) || 75.26,
      silver_price: parseFloat(silverPrice) || 73.13,
      gold_price: parseFloat(goldPrice) || 72.42,
    };

    await supabase.from('packages').update(updated).eq('id', selectedPkg.id);
    setPackages(packages.map((p) => (p.id === selectedPkg.id ? { ...p, ...updated } : p)));
    setIsEditModalOpen(false);
    setSelectedPkg(null);
    setSaving(false);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Delete this Free Fire package?')) return;
    await supabase.from('packages').delete().eq('id', id);
    setPackages(packages.filter((p) => p.id !== id));
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPkg(pkg);
    setPackageName(pkg.package_name);
    setDiamondAmount(pkg.diamond_amount.toString());
    setShellCost(pkg.shell_cost.toString());
    setNormalPrice(pkg.normal_price.toString());
    setSilverPrice((pkg.silver_price || 0).toString());
    setGoldPrice((pkg.gold_price || 0).toString());
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Packages</h1>
          <p className="text-xs text-slate-400 mt-1">Manage Garena Shell cost structures and tiered prices (Normal / Silver / Gold).</p>
        </div>

        <button
          onClick={() => {
            setPackageName('100 Diamond Pack');
            setDiamondAmount('100');
            setShellCost('50');
            setNormalPrice('300.00');
            setSilverPrice('280.00');
            setGoldPrice('260.00');
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30"
        >
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
                      <h5 className="font-bold text-white text-xs">{pkg.package_name}</h5>
                      <p className="text-[10px] text-purple-400 font-mono">{pkg.diamond_amount} Diamonds</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                      {pkg.package_type || 'DIAMOND'}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-purple-400 text-sm">{pkg.shell_cost}</td>
                  <td className="p-4 font-mono text-[11px] space-y-0.5">
                    <div><span className="text-slate-400 font-bold">N:</span> <span className="text-white font-bold">LKR {Number(pkg.normal_price).toFixed(2)}</span></div>
                    <div><span className="text-slate-400 font-bold">S:</span> <span className="text-cyan-400 font-bold">LKR {Number(pkg.silver_price || 0).toFixed(2)}</span></div>
                    <div><span className="text-slate-400 font-bold">G:</span> <span className="text-amber-400 font-bold">LKR {Number(pkg.gold_price || 0).toFixed(2)}</span></div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      {pkg.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="Edit Package"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                      title="Delete Package"
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
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Free Fire Package</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Diamond Amount</label>
                  <input
                    type="number"
                    required
                    value={diamondAmount}
                    onChange={(e) => setDiamondAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shell Cost</label>
                  <input
                    type="number"
                    required
                    value={shellCost}
                    onChange={(e) => setShellCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Normal Price</label>
                  <input
                    type="text"
                    required
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-cyan-400 uppercase mb-1">Silver Price</label>
                  <input
                    type="text"
                    required
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-amber-400 uppercase mb-1">Gold Price</label>
                  <input
                    type="text"
                    required
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Save Package'}
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
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit Free Fire Package</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Normal Price (LKR)</label>
                  <input
                    type="text"
                    required
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-cyan-400 uppercase mb-1">Silver Price (LKR)</label>
                  <input
                    type="text"
                    required
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Package'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
