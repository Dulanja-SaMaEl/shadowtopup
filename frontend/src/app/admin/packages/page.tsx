'use client';

import { useState, useEffect } from 'react';
import { Package } from '@/types/database';
import { Plus, Edit2, Trash2, X, Sparkles, Check, Image as ImageIcon, Zap, DollarSign } from 'lucide-react';

const DIAMOND_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png';
const WEEKLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/000/002/logo.png';
const WEEKLY_LITE_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png';
const MONTHLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);

  // Form fields
  const [packageName, setPackageName] = useState('');
  const [packageType, setPackageType] = useState('diamond');
  const [diamondAmount, setDiamondAmount] = useState('100');
  const [shellCost, setShellCost] = useState('100');
  const [normalPrice, setNormalPrice] = useState('350.00');
  const [silverPrice, setSilverPrice] = useState('320.00');
  const [goldPrice, setGoldPrice] = useState('300.00');
  const [imageUrl, setImageUrl] = useState(DIAMOND_CDN);
  const [badge, setBadge] = useState('STARTER');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/packages');
      const data = await res.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (e) {
      console.error('Error fetching admin packages:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const autoCalculatePrices = () => {
    const shells = parseInt(shellCost) || 100;
    const baseCostLkr = shells * 2.60;
    const recNormal = Math.round(baseCostLkr * 1.35); // ~35% markup (25.7% net profit)
    const recSilver = Math.round(baseCostLkr * 1.23); // ~23% markup
    const recGold = Math.round(baseCostLkr * 1.15);   // ~15% markup

    setNormalPrice(recNormal.toFixed(2));
    setSilverPrice(recSilver.toFixed(2));
    setGoldPrice(recGold.toFixed(2));
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      package_name: packageName,
      package_type: packageType,
      diamond_amount: parseInt(diamondAmount) || 100,
      shell_cost: parseInt(shellCost) || 100,
      normal_price: parseFloat(normalPrice) || 350.00,
      silver_price: parseFloat(silverPrice) || 320.00,
      gold_price: parseFloat(goldPrice) || 300.00,
      image_url: imageUrl || DIAMOND_CDN,
      badge: badge || null,
      is_active: isActive,
    };

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.package) {
        setPackages([...packages, data.package]);
      } else {
        await loadPackages();
      }
    } catch (err) {
      console.error('Error adding package:', err);
    }

    setIsAddModalOpen(false);
    resetForm();
    setSaving(false);
  };

  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;
    setSaving(true);

    const payload = {
      id: selectedPkg.id,
      package_name: packageName,
      package_type: packageType,
      diamond_amount: parseInt(diamondAmount) || 100,
      shell_cost: parseInt(shellCost) || 100,
      normal_price: parseFloat(normalPrice) || 350.00,
      silver_price: parseFloat(silverPrice) || 320.00,
      gold_price: parseFloat(goldPrice) || 300.00,
      image_url: imageUrl || DIAMOND_CDN,
      badge: badge || null,
      is_active: isActive,
    };

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.package) {
        setPackages(packages.map((p) => (p.id === selectedPkg.id ? data.package : p)));
      } else {
        await loadPackages();
      }
    } catch (err) {
      console.error('Error updating package:', err);
    }

    setIsEditModalOpen(false);
    setSelectedPkg(null);
    resetForm();
    setSaving(false);
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package from the database?')) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setPackages(packages.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting package:', err);
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (pkg: Package) => {
    setSelectedPkg(pkg);
    setPackageName(pkg.package_name);
    setPackageType(pkg.package_type || 'diamond');
    setDiamondAmount(pkg.diamond_amount.toString());
    setShellCost(pkg.shell_cost.toString());
    setNormalPrice(pkg.normal_price.toString());
    setSilverPrice((pkg.silver_price || 0).toString());
    setGoldPrice((pkg.gold_price || 0).toString());
    setImageUrl(pkg.image_url || DIAMOND_CDN);
    setBadge(pkg.badge || '');
    setIsActive(pkg.is_active !== undefined ? pkg.is_active : true);
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setPackageName('100 Diamonds');
    setPackageType('diamond');
    setDiamondAmount('100');
    setShellCost('100');
    setNormalPrice('350.00');
    setSilverPrice('320.00');
    setGoldPrice('300.00');
    setImageUrl(DIAMOND_CDN);
    setBadge('STARTER');
    setIsActive(true);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Packages</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage DB package entries, Garena Shell cost structures, and profit margins.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Package
        </button>
      </div>

      {/* Packages Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Package</th>
                <th className="p-4">Type</th>
                <th className="p-4">Shell Cost</th>
                <th className="p-4">Calculated Prices (N / S / G)</th>
                <th className="p-4">Est. Profit</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Loading database packages...
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    No packages found in database. Click "Add New Package" above to create one.
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => {
                  const baseCost = pkg.shell_cost * 2.60;
                  const profit = pkg.normal_price - baseCost;
                  const margin = pkg.normal_price > 0 ? (profit / pkg.normal_price) * 100 : 0;

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {pkg.image_url ? (
                            <img src={pkg.image_url} alt="" className="w-9 h-9 object-contain bg-slate-950 rounded-lg p-1 border border-slate-800" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                              <Zap className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-xs">{pkg.package_name}</h5>
                              {pkg.badge && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-600/80 text-[8px] font-mono font-extrabold uppercase text-white">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-cyan-400 font-mono">{pkg.diamond_amount} Diamonds</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                          {pkg.package_type || 'DIAMOND'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-purple-300 text-xs">
                        {pkg.shell_cost} Shells
                        <span className="block text-[9px] text-slate-500 font-normal">~LKR {baseCost.toFixed(2)} cost</span>
                      </td>
                      <td className="p-4 font-mono text-[11px] space-y-0.5">
                        <div><span className="text-slate-400 font-bold">N:</span> <span className="text-emerald-400 font-bold">LKR {Number(pkg.normal_price).toFixed(2)}</span></div>
                        <div><span className="text-slate-400 font-bold">S:</span> <span className="text-cyan-300 font-bold">LKR {Number(pkg.silver_price || 0).toFixed(2)}</span></div>
                        <div><span className="text-slate-400 font-bold">G:</span> <span className="text-amber-300 font-bold">LKR {Number(pkg.gold_price || 0).toFixed(2)}</span></div>
                      </td>
                      <td className="p-4 font-mono">
                        <span className="text-emerald-300 font-bold block text-xs">+LKR {profit.toFixed(2)}</span>
                        <span className="text-[9px] text-emerald-400/80 font-bold">+{margin.toFixed(1)}% margin</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          pkg.is_active
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}>
                          {pkg.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
                          title="Edit Package"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete Package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Package Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/80 rounded-3xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                {isEditModalOpen ? 'Edit Free Fire Package' : 'Add New Free Fire Package'}
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

            <form onSubmit={isEditModalOpen ? handleEditPackage : handleAddPackage} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  placeholder="e.g. 100 Diamonds"
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select
                    value={packageType}
                    onChange={(e) => setPackageType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  >
                    <option value="diamond">diamond</option>
                    <option value="weekly_pass">weekly_pass</option>
                    <option value="monthly_pass">monthly_pass</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Diamond Amount</label>
                  <input
                    type="number"
                    required
                    value={diamondAmount}
                    onChange={(e) => setDiamondAmount(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Shell Cost</label>
                  <input
                    type="number"
                    required
                    value={shellCost}
                    onChange={(e) => setShellCost(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Auto Calculate Button */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-purple-950/30 border border-purple-900/40">
                <span className="text-[10px] text-purple-300 font-mono">
                  Base Shell Cost: <strong className="text-white">LKR {((parseInt(shellCost) || 0) * 2.60).toFixed(2)}</strong>
                </span>
                <button
                  type="button"
                  onClick={autoCalculatePrices}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Recommend Prices
                </button>
              </div>

              {/* Prices Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-emerald-400 uppercase mb-1">Normal Price (LKR)</label>
                  <input
                    type="text"
                    required
                    value={normalPrice}
                    onChange={(e) => setNormalPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-cyan-400 uppercase mb-1">Silver Price (LKR)</label>
                  <input
                    type="text"
                    required
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-amber-400 uppercase mb-1">Gold Price (LKR)</label>
                  <input
                    type="text"
                    required
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Image URL & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image URL (Garena CDN)</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-slate-300 font-mono focus:outline-none text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. STARTER, HOT DEAL"
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Image Selectors */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Official Garena Preset Images</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setImageUrl(DIAMOND_CDN)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      imageUrl === DIAMOND_CDN ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={DIAMOND_CDN} className="w-4 h-4 object-contain" alt="" /> Diamond Pack
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(WEEKLY_PASS_CDN)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      imageUrl === WEEKLY_PASS_CDN ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={WEEKLY_PASS_CDN} className="w-4 h-4 object-contain" alt="" /> Weekly Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(WEEKLY_LITE_CDN)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      imageUrl === WEEKLY_LITE_CDN ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={WEEKLY_LITE_CDN} className="w-4 h-4 object-contain" alt="" /> Weekly Lite
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(MONTHLY_PASS_CDN)}
                    className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 ${
                      imageUrl === MONTHLY_PASS_CDN ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={MONTHLY_PASS_CDN} className="w-4 h-4 object-contain" alt="" /> Monthly Pass
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <label htmlFor="isActive" className="text-xs text-slate-300 font-bold cursor-pointer">
                  Is Package Active on Storefront
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase shadow-lg shadow-purple-600/30"
                >
                  {saving ? 'Saving...' : isEditModalOpen ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
