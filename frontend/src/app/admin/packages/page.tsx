'use client';

import { useState, useEffect, useRef } from 'react';
import { Package } from '@/types/database';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Check,
  Image as ImageIcon,
  Zap,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  Camera,
  Crown,
  Target,
  Diamond,
} from 'lucide-react';

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

  // Quick Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalPkg, setImageModalPkg] = useState<Package | null>(null);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const [modalUploading, setModalUploading] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

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
  const [formUploading, setFormUploading] = useState(false);
  const formFileInputRef = useRef<HTMLInputElement | null>(null);

  // Filter tabs for admin view
  const [adminTab, setAdminTab] = useState<'all' | 'membership' | 'levelup' | 'diamond' | 'inactive'>('all');

  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 5000);
  };

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

  // Upload image from file to API
  const handleUploadImageFile = async (
    file: File,
    onSuccess: (url: string) => void,
    setUploadState: (val: boolean) => void
  ) => {
    setUploadState(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/admin/packages/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url);
        showToast('success', 'Image uploaded successfully!');
      } else {
        showToast('error', data.message || 'Image upload failed');
      }
    } catch (err: any) {
      console.error('Error uploading image file:', err);
      showToast('error', err.message || 'Network error uploading image');
    } finally {
      setUploadState(false);
    }
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
        showToast('success', `Created package "${packageName}" successfully!`);
        setIsAddModalOpen(false);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to add package');
        await loadPackages();
      }
    } catch (err: any) {
      console.error('Error adding package:', err);
      showToast('error', 'Network error adding package');
    } finally {
      setSaving(false);
    }
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
        showToast('success', `Package "${packageName}" updated successfully!`);
        setIsEditModalOpen(false);
        setSelectedPkg(null);
        resetForm();
      } else {
        showToast('error', data.message || 'Failed to update package');
        await loadPackages();
      }
    } catch (err: any) {
      console.error('Error updating package:', err);
      showToast('error', 'Network error updating package');
    } finally {
      setSaving(false);
    }
  };

  // 1-Click Save from Quick Image Modal
  const handleSaveModalImage = async () => {
    if (!imageModalPkg) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/packages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: imageModalPkg.id,
          image_url: modalImageUrl,
        }),
      });
      const data = await res.json();
      if (data.success && data.package) {
        setPackages(packages.map((p) => (p.id === imageModalPkg.id ? { ...p, image_url: modalImageUrl } : p)));
        showToast('success', `Image updated for "${imageModalPkg.package_name}"!`);
        setIsImageModalOpen(false);
        setImageModalPkg(null);
      } else {
        showToast('error', data.message || 'Failed to update image');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Network error updating image');
    } finally {
      setSaving(false);
    }
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
        showToast('success', 'Package deleted successfully.');
      } else {
        showToast('error', data.message || 'Failed to delete package');
      }
    } catch (err) {
      console.error('Error deleting package:', err);
      showToast('error', 'Network error deleting package');
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

  const openQuickImageModal = (pkg: Package) => {
    setImageModalPkg(pkg);
    setModalImageUrl(pkg.image_url || DIAMOND_CDN);
    setIsImageModalOpen(true);
  };

  const resetForm = () => {
    setPackageName('100 Diamond');
    setPackageType('diamond');
    setDiamondAmount('100');
    setShellCost('50');
    setNormalPrice('350.00');
    setSilverPrice('320.00');
    setGoldPrice('300.00');
    setImageUrl(DIAMOND_CDN);
    setBadge('STARTER');
    setIsActive(true);
  };

  const [syncingOfficial, setSyncingOfficial] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleSyncOfficial = async () => {
    setSyncingOfficial(true);
    setSyncMsg(null);
    try {
      const res = await fetch('/api/admin/packages/sync-official', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncMsg(data.message);
        await loadPackages();
      } else {
        setSyncMsg(data.message || 'Error syncing packages');
      }
    } catch (err) {
      console.error('Error syncing official packages:', err);
      setSyncMsg('Network error syncing packages');
    } finally {
      setSyncingOfficial(false);
    }
  };

  // Group and sort packages: 1st Memberships, 2nd Level Up, 3rd Diamonds
  const getCategoryWeight = (pkg: Package) => {
    if (pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass' || pkg.package_type === 'evo_access') {
      return 1; // 1st
    }
    if (pkg.package_type === 'levelup_pass') {
      return 2; // 2nd
    }
    return 3; // 3rd (Diamonds)
  };

  const activePackages = packages.filter((p) => p.is_active);
  const inactivePackages = packages.filter((p) => !p.is_active);

  const displayedPackages = packages
    .filter((pkg) => {
      if (adminTab === 'inactive') return !pkg.is_active;
      if (!pkg.is_active) return false;
      if (adminTab === 'all') return true;
      if (adminTab === 'membership') {
        return pkg.package_type === 'weekly_pass' || pkg.package_type === 'monthly_pass' || pkg.package_type === 'evo_access';
      }
      if (adminTab === 'levelup') {
        return pkg.package_type === 'levelup_pass';
      }
      if (adminTab === 'diamond') {
        return pkg.package_type === 'diamond';
      }
      return true;
    })
    .sort((a, b) => {
      const weightA = getCategoryWeight(a);
      const weightB = getCategoryWeight(b);
      if (weightA !== weightB) return weightA - weightB;
      return (a.diamond_amount || 0) - (b.diamond_amount || 0) || (a.shell_cost || 0) - (b.shell_cost || 0);
    });

  const countMemberships = activePackages.filter((p) => p.package_type === 'weekly_pass' || p.package_type === 'monthly_pass' || p.package_type === 'evo_access').length;
  const countLevelUp = activePackages.filter((p) => p.package_type === 'levelup_pass').length;
  const countDiamonds = activePackages.filter((p) => p.package_type === 'diamond').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Packages</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage packages, custom images, Garena Shell cost structures, and margins. Order: Memberships → Level Up → Diamonds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSyncOfficial}
            disabled={syncingOfficial}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {syncingOfficial ? 'Syncing Official Garena Shells...' : 'Sync Official Packages'}
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Package
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold flex items-center justify-between">
          <span>{syncMsg}</span>
          <button onClick={() => setSyncMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between font-mono text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Active (${activePackages.length})` },
          { id: 'membership', label: `👑 1. Memberships (${countMemberships})` },
          { id: 'levelup', label: `🎯 2. Level Up (${countLevelUp})` },
          { id: 'diamond', label: `💎 3. Diamonds (${countDiamonds})` },
          ...(inactivePackages.length > 0 ? [{ id: 'inactive', label: `Archived (${inactivePackages.length})` }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all ${
              adminTab === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
              ) : displayedPackages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    No packages found in this category.
                  </td>
                </tr>
              ) : (
                displayedPackages.map((pkg) => {
                  const baseCost = pkg.shell_cost * 2.60;
                  const profit = pkg.normal_price - baseCost;
                  const margin = pkg.normal_price > 0 ? (profit / pkg.normal_price) * 100 : 0;

                  return (
                    <tr key={pkg.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Image with quick Change Image button */}
                          <div
                            onClick={() => openQuickImageModal(pkg)}
                            className="relative group cursor-pointer w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden hover:border-cyan-500 transition-all"
                            title="Click to change package image"
                          >
                            {pkg.image_url ? (
                              <img src={pkg.image_url} alt="" className="w-full h-full object-contain" />
                            ) : (
                              <Zap className="w-4 h-4 text-purple-400" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-white text-xs">{pkg.package_name}</h5>
                              {pkg.badge && (
                                <span className="px-1.5 py-0.5 rounded bg-purple-600/80 text-[8px] font-mono font-extrabold uppercase text-white">
                                  {pkg.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-cyan-400 font-mono">
                                {pkg.diamond_amount > 0 ? `${pkg.diamond_amount} Diamonds` : 'Subscription Pass'}
                              </span>
                              <button
                                type="button"
                                onClick={() => openQuickImageModal(pkg)}
                                className="text-[9px] text-slate-500 hover:text-cyan-400 underline font-mono"
                              >
                                Edit Image
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 font-mono text-[9px] font-bold uppercase">
                          {pkg.package_type || 'DIAMOND'}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-purple-300 text-xs">
                        {pkg.shell_cost} Shells
                        <span className="block text-[9px] text-slate-500 font-normal">~LKR {baseCost.toFixed(2)} cost</span>
                      </td>
                      <td className="p-4 font-mono text-[11px] space-y-0.5">
                        <div><span className="text-slate-400 font-bold">Normal:</span> <span className="text-emerald-400 font-bold">LKR {Number(pkg.normal_price).toFixed(2)}</span></div>
                        <div><span className="text-slate-400 font-bold">Standard:</span> <span className="text-cyan-300 font-bold">LKR {Number(pkg.silver_price || 0).toFixed(2)}</span></div>
                        <div><span className="text-slate-400 font-bold">Elite:</span> <span className="text-amber-300 font-bold">LKR {Number(pkg.gold_price || 0).toFixed(2)}</span></div>
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
                          onClick={() => openQuickImageModal(pkg)}
                          className="p-2 rounded-xl bg-[#121024] border border-cyan-950/60 text-cyan-400 hover:text-white hover:bg-cyan-900/50 transition-colors"
                          title="Update Image"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(pkg)}
                          className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
                          title="Edit Package Details"
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

      {/* QUICK IMAGE UPDATE MODAL */}
      {isImageModalOpen && imageModalPkg && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 sm:p-7 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Update Package Image
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{imageModalPkg.package_name}</p>
              </div>
              <button
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImageModalPkg(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current & Preview */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800">
              <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                <img
                  src={modalImageUrl}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DIAMOND_CDN;
                  }}
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Image Preview</span>
                <p className="text-xs text-emerald-400 font-mono font-bold">Ready to apply</p>
                <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{modalImageUrl}</p>
              </div>
            </div>

            {/* Upload from Device */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                Option 1: Upload Image from Computer
              </label>
              <input
                ref={modalFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleUploadImageFile(file, (url) => setModalImageUrl(url), setModalUploading);
                  }
                }}
              />
              <button
                type="button"
                disabled={modalUploading}
                onClick={() => modalFileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {modalUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading Image...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" /> Browse & Upload Image File (.png, .webp, .jpg)
                  </>
                )}
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                Option 2: Official Garena Free Fire Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setModalImageUrl(DIAMOND_CDN)}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === DIAMOND_CDN ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src={DIAMOND_CDN} className="w-5 h-5 object-contain" alt="" />
                  <span>Diamond Pack</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalImageUrl(WEEKLY_PASS_CDN)}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === WEEKLY_PASS_CDN ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src={WEEKLY_PASS_CDN} className="w-5 h-5 object-contain" alt="" />
                  <span>Weekly VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalImageUrl(WEEKLY_LITE_CDN)}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === WEEKLY_LITE_CDN ? 'bg-purple-500/20 border-purple-400 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src={WEEKLY_LITE_CDN} className="w-5 h-5 object-contain" alt="" />
                  <span>Weekly Lite</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalImageUrl(MONTHLY_PASS_CDN)}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === MONTHLY_PASS_CDN ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src={MONTHLY_PASS_CDN} className="w-5 h-5 object-contain" alt="" />
                  <span>Monthly VIP</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalImageUrl('/uploads/packages/levelup-pass.svg')}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === '/uploads/packages/levelup-pass.svg' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src="/uploads/packages/levelup-pass.svg" className="w-5 h-5 object-contain" alt="" />
                  <span>Level Up Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalImageUrl('/uploads/packages/evo-pass.svg')}
                  className={`p-2 rounded-xl border text-[11px] font-mono flex items-center gap-2 ${
                    modalImageUrl === '/uploads/packages/evo-pass.svg' ? 'bg-orange-500/20 border-orange-400 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <img src="/uploads/packages/evo-pass.svg" className="w-5 h-5 object-contain" alt="" />
                  <span>EVO Access</span>
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Option 3: Or Enter Direct Image URL
              </label>
              <input
                type="text"
                value={modalImageUrl}
                onChange={(e) => setModalImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#0e0c1f] border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setImageModalPkg(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || modalUploading}
                onClick={handleSaveModalImage}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold font-mono shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save New Image
              </button>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="e.g. 100 Diamond"
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
                    <option value="weekly_pass">weekly_pass (Membership)</option>
                    <option value="monthly_pass">monthly_pass (Membership)</option>
                    <option value="evo_access">evo_access (Membership)</option>
                    <option value="levelup_pass">levelup_pass (Level Up)</option>
                    <option value="diamond">diamond (Diamonds)</option>
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
                  <label className="block text-[9px] font-bold text-cyan-400 uppercase mb-1">Standard Reseller (Silver)</label>
                  <input
                    type="text"
                    required
                    value={silverPrice}
                    onChange={(e) => setSilverPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-cyan-300 font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-amber-400 uppercase mb-1">Elite Reseller (Gold)</label>
                  <input
                    type="text"
                    required
                    value={goldPrice}
                    onChange={(e) => setGoldPrice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-amber-300 font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Upload & Management */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0e0c1f] border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase">
                    Package Image
                  </label>
                  <button
                    type="button"
                    disabled={formUploading}
                    onClick={() => formFileInputRef.current?.click()}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {formUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload File
                  </button>
                </div>

                <input
                  ref={formFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadImageFile(file, (url) => setImageUrl(url), setFormUploading);
                    }
                  }}
                />

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                    <img src={imageUrl} alt="" className="max-w-full max-h-full object-contain" />
                  </div>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Image URL or upload file"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setImageUrl(DIAMOND_CDN)}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === DIAMOND_CDN ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={DIAMOND_CDN} className="w-3.5 h-3.5 object-contain" alt="" /> Diamond
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(WEEKLY_PASS_CDN)}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === WEEKLY_PASS_CDN ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={WEEKLY_PASS_CDN} className="w-3.5 h-3.5 object-contain" alt="" /> Weekly Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(WEEKLY_LITE_CDN)}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === WEEKLY_LITE_CDN ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={WEEKLY_LITE_CDN} className="w-3.5 h-3.5 object-contain" alt="" /> Weekly Lite
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl(MONTHLY_PASS_CDN)}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === MONTHLY_PASS_CDN ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src={MONTHLY_PASS_CDN} className="w-3.5 h-3.5 object-contain" alt="" /> Monthly Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('/uploads/packages/levelup-pass.svg')}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === '/uploads/packages/levelup-pass.svg' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src="/uploads/packages/levelup-pass.svg" className="w-3.5 h-3.5 object-contain" alt="" /> Level Up Pass
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('/uploads/packages/evo-pass.svg')}
                    className={`px-2 py-1 rounded-lg border text-[9px] font-mono flex items-center gap-1 ${
                      imageUrl === '/uploads/packages/evo-pass.svg' ? 'bg-orange-500/20 border-orange-500 text-orange-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <img src="/uploads/packages/evo-pass.svg" className="w-3.5 h-3.5 object-contain" alt="" /> EVO Access
                  </button>
                </div>
              </div>

              {/* Badge & Active State */}
              <div className="grid grid-cols-2 gap-3">
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
                <div className="flex items-center gap-3 pt-4">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                  <span className="text-xs font-mono font-bold text-white">
                    {isActive ? 'Active Package' : 'Inactive / Hidden'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || formUploading}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> {isEditModalOpen ? 'Update Package' : 'Create Package'}
                    </>
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
