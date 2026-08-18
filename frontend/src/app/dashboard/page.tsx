'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { fetchDatabaseOrders, updateDatabaseOrderReceipt, DatabaseOrder } from '@/lib/ordersService';
import { Profile } from '@/types/database';
import {
  Award,
  ShieldCheck,
  LogOut,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Star,
  CheckCircle2,
  X,
  Edit2,
  User as UserIcon,
  Mail,
  Receipt,
  Clock,
  UploadCloud,
  ImageIcon,
  Loader2,
  Zap,
  ExternalLink,
  Check,
  ShoppingBag,
  PlusCircle,
  FileCheck,
  FileText,
  Printer,
  Download,
} from 'lucide-react';
import ShadowWalletWidget from '@/components/ShadowWalletWidget';
import TransactionReceiptModal, { ReceiptData } from '@/components/TransactionReceiptModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function UserDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>({
    id: '',
    name: 'CUSTOMER ACCOUNT',
    email: '',
    role: 'normal',
    reseller_status: 'none',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [resellerTier, setResellerTier] = useState<'silver' | 'gold'>('silver');
  const [applying, setApplying] = useState(false);
  const [resellerMsg, setResellerMsg] = useState<string | null>(null);

  // Reseller Store Name state
  const [storeName, setStoreName] = useState('');
  const [savingStoreName, setSavingStoreName] = useState(false);
  const [storeNameMsg, setStoreNameMsg] = useState<string | null>(null);

  // Modals & Upload state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  // File Receipt Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewReceiptModal, setViewReceiptModal] = useState<ReceiptData | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUserDatabaseOrders() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;

        if (authUser) {
          setProfile((prev) => ({
            ...prev!,
            id: authUser.id,
            email: (authUser.email || '').toUpperCase(),
          }));
        }

        const res = await fetch('/api/user/orders');
        const json = await res.json();

        if (json.success && json.user) {
          const userEmail = (json.user.email || authUser?.email || '').toUpperCase();
          const userName = (json.user.name || '').toUpperCase();

          setProfile((prev) => ({
            ...prev!,
            id: json.user.id || authUser?.id || 'demo-user',
            email: userEmail,
            name: userName,
            role: json.user.role || 'normal',
            reseller_status: json.user.reseller_status || 'none',
            store_name: json.user.store_name || null,
          }));

          setEditName(userName);
          setEditEmail(userEmail);
          setStoreName(json.user.store_name || '');

          if (Array.isArray(json.data)) {
            setTransactions(
              json.data.map((o: any) => ({
                id: (o.id || '').replace('#', ''),
                raw_id: o.raw_id,
                package_name: o.package_name,
                items: '1X ITEMS',
                amount: o.totalAmount,
                status: o.fulfillmentStatus,
                time: '11:30 AM',
                date: (o.date || '').toUpperCase(),
                player_uid: o.free_fire_player_id,
                receipt_url: o.paymentReceipt,
              }))
            );
          }
        }

        if (!authUser) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('active_session_email');
            localStorage.removeItem('active_session_role');
            localStorage.removeItem('active_session_name');
            window.location.href = '/login';
          }
          return;
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      }
    }
    loadUserDatabaseOrders();
  }, []);

  const handleSaveStoreName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    setSavingStoreName(true);
    setStoreNameMsg(null);

    try {
      if (profile?.id && profile.id !== 'demo-user') {
        await supabase
          .from('profiles')
          .update({ store_name: storeName.trim() })
          .eq('id', profile.id);
      }

      setProfile((prev) => (prev ? { ...prev, store_name: storeName.trim() } : null));
      setStoreNameMsg('Reseller store name saved successfully!');
    } catch (err) {
      setStoreNameMsg('Failed to update store name.');
    }
    setSavingStoreName(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName) return;

    if (profile?.id && profile.id !== 'demo-user') {
      await supabase
        .from('profiles')
        .update({ name: editName, email: editEmail })
        .eq('id', profile.id);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('active_session_name', editName);
      localStorage.setItem('active_session_email', editEmail);
    }

    setProfile({
      ...profile!,
      name: editName.toUpperCase(),
      email: editEmail.toUpperCase(),
    });

    setEditModalOpen(false);
  };

  const handleApplyReseller = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setResellerMsg(null);

    if (profile?.id && profile.id !== 'demo-user') {
      await supabase
        .from('profiles')
        .update({
          reseller_status: 'pending',
          requested_tier: resellerTier,
        })
        .eq('id', profile.id);
    }

    setProfile({
      ...profile!,
      reseller_status: 'pending',
      requested_tier: resellerTier,
    });
    setResellerMsg('Application submitted! Admin will review your reseller tier.');
    setApplying(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
      setUploadSuccess(false);
    }
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile || !selectedOrder) return;

    setUploadingReceipt(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const res = await fetch('/api/upload-receipt', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.url) {
        const receiptUrl = json.url;

        if (selectedOrder) {
          await updateDatabaseOrderReceipt(selectedOrder.raw_id || selectedOrder.id, receiptUrl, selectedOrder.id);
        }

        setSelectedOrder({
          ...selectedOrder,
          receipt_url: receiptUrl,
          status: 'PROOF SUBMITTED',
        });

        setTransactions((prev) =>
          prev.map((t) =>
            t.id === selectedOrder.id ? { ...t, receipt_url: receiptUrl, status: 'PROOF SUBMITTED' } : t
          )
        );

        setReceiptFile(null);
        setReceiptPreview(null);
        setUploadSuccess(true);
      }
    } catch (err) {
      console.error('Failed to submit receipt:', err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('active_session_email');
      localStorage.removeItem('active_session_role');
      localStorage.removeItem('active_session_name');
    }
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const lineData = [
    { date: 'Aug 12', spent: 0 },
    { date: 'Aug 15', spent: 0 },
    { date: 'Aug 16', spent: 0 },
    { date: 'Aug 17', spent: 0 },
    { date: 'Aug 18', spent: 0 },
  ];

  const barData = [
    { name: '100 Diamonds', Normal: 750, Silver: 690, Gold: 637 },
    { name: '310 Diamonds', Normal: 2100, Silver: 1932, Gold: 1785 },
  ];

  const totalSpent = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const activeOrdersCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0814] pb-20 space-y-8">
      {/* Top Banner Header */}
      <div className="relative h-48 bg-[#120f26] border-b border-purple-950/40 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-purple-950/30 to-transparent" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-lg">
            MY DASHBOARD
          </h1>
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono font-bold uppercase text-slate-400">
            <Link href="/" className="hover:text-cyan-400">HOME</Link>
            <span>:</span>
            <span className="text-red-500 font-black">DASHBOARD</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Admin Quick Access Bar */}
        {profile?.role === 'admin' && (
          <div className="bg-purple-950/60 border border-purple-800 p-6 rounded-3xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase">SYSTEM ADMINISTRATOR CONTROL DETECTED</h4>
                <p className="text-xs text-purple-300 font-mono">Access store settings, packages, shell accounts & reseller applications.</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl">
              GO TO ADMIN PANEL
            </Link>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            {/* Animated Profile Avatar Icon */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-70 blur-md group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border border-cyan-500/40 flex items-center justify-center text-2xl font-black shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                <span className="bg-clip-text text-transparent bg-gradient-to-tr from-cyan-300 via-white to-purple-200 drop-shadow-[0_2px_8px_rgba(6,182,212,0.6)] group-hover:scale-110 transition-transform duration-300">
                  {(profile?.name?.charAt(0) || profile?.email?.charAt(0) || 'U').toUpperCase()}
                </span>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#141229]" />
              </span>
            </div>

            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{profile?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{profile?.email}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                  profile?.role === 'gold'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : profile?.role === 'silver'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : profile?.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20'
                }`}>
                  {profile?.role === 'gold' ? 'GOLD RESELLER' : profile?.role === 'silver' ? 'SILVER RESELLER' : profile?.role === 'admin' ? 'ADMIN' : 'NORMAL USER'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => {
                setEditName(profile?.name || '');
                setEditEmail(profile?.email || '');
                setEditModalOpen(true);
              }}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-slate-700 flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" /> EDIT PROFILE
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          </div>
        </div>

        {/* Metrics Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL DB ORDERS</span>
            <h3 className="text-3xl font-black text-white">{transactions.length}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL SPENT</span>
            <h3 className="text-3xl font-black text-white">LKR {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
          </div>
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-1">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">ACTIVE PENDING ORDERS</span>
            <h3 className="text-3xl font-black text-cyan-400">{activeOrdersCount}</h3>
          </div>
        </div>

        {/* SHADOW WALLET WIDGET */}
        <ShadowWalletWidget userId={profile?.id || 'demo-user'} />

        {/* Details Info Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">FULL NAME</span>
            <p className="text-xs font-bold text-white uppercase mt-1">{profile?.name}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60 overflow-hidden">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">EMAIL ADDRESS</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono truncate">{profile?.email}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">ACCOUNT ROLE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">{profile?.role?.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MEMBER SINCE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">MAY 11, 2026</p>
          </div>
        </div>

        {/* RESELLER STATUS & STORE NAME BRANDING CARD */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <Award className="w-4 h-4 text-red-500" /> RESELLER STATUS & STORE BRANDING
            </div>
            {profile?.store_name && (
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30 truncate max-w-[200px]">
                Store: {profile.store_name}
              </span>
            )}
          </div>

          {profile?.role === 'gold' ? (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">GOLD TIER RESELLER ACTIVE</h4>
              </div>
              <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">
                YOUR ACCOUNT HAS AN ACTIVE GOLD RESELLER SUBSCRIPTION. A 15% WHOLESALE DISCOUNT MATRIX IS AUTOMATICALLY APPLIED TO ALL TOP-UP ORDERS.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold uppercase border border-amber-500/30">
                SUBSCRIPTION VALID UNTIL AUG 30, 2027
              </span>
            </div>
          ) : profile?.role === 'silver' ? (
            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-wider">SILVER TIER RESELLER ACTIVE</h4>
              </div>
              <p className="text-[10px] text-slate-300 font-mono uppercase tracking-wider">
                YOUR ACCOUNT HAS AN ACTIVE SILVER RESELLER SUBSCRIPTION. AN 8% DISCOUNT MATRIX IS AUTOMATICALLY APPLIED TO ALL TOP-UP ORDERS.
              </p>
              <span className="inline-block px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[9px] font-mono font-bold uppercase border border-cyan-500/30">
                SUBSCRIPTION VALID UNTIL JUL 23, 2026
              </span>
            </div>
          ) : null}

          {/* STORE NAME EDIT FORM EXCLUSIVELY FOR ACTIVE RESELLERS & ADMINS */}
          {(profile?.role === 'silver' || profile?.role === 'gold' || profile?.role === 'admin') && (
            <form onSubmit={handleSaveStoreName} className="p-5 rounded-2xl bg-[#0e0c1f] border border-purple-950/60 space-y-4">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Reseller Store Name Customization</h4>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Customize your personal storefront name displayed on customer receipts & top-up vouchers.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="Enter Reseller Store Name (e.g. Shadow Store SL)"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400 uppercase"
                />
                <button
                  type="submit"
                  disabled={savingStoreName}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                >
                  {savingStoreName ? 'Saving...' : 'Save Store Name'}
                </button>
              </div>

              {storeNameMsg && (
                <p className="text-xs text-emerald-400 font-mono font-bold">{storeNameMsg}</p>
              )}
            </form>
          )}

          {profile?.role === 'normal' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#120f26] via-[#0c0a1a] to-[#181335] border border-purple-900/60 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                    BECOME AN OFFICIAL PARTNER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                    Unlock Exclusive Wholesale Margins
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Upgrade your account to a certified Reseller tier to instantly earn up to 15% profit on every Free Fire diamond recharge & gaming top-up.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-800/80 px-4 py-2 rounded-2xl shrink-0">
                  <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wide">Up to 15% Profit Margin</span>
                </div>
              </div>

              {/* Tier Comparison Feature Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {/* Silver Tier Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  resellerTier === 'silver'
                    ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                    : 'bg-[#0e0c1f] border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-cyan-400" /> SILVER RESELLER TIER
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                      8% OFF MATRIX
                    </span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300 font-mono">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Automatic 8% discount on all package purchases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Customized store name branding on order receipts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Instant automated order processing & fulfillment</span>
                    </li>
                  </ul>
                </div>

                {/* Gold Tier Card */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  resellerTier === 'gold'
                    ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-[#0e0c1f] border-slate-800'
                }`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" /> GOLD RESELLER TIER
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      15% OFF MATRIX
                    </span>
                  </div>
                  <ul className="space-y-2 text-[11px] text-slate-300 font-mono">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Maximum 15% wholesale discount for maximum profit</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>VIP priority order queuing & instant processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Bulk voucher generation & dedicated support line</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Reseller Application Form */}
              <form onSubmit={handleApplyReseller} className="space-y-4 pt-2 border-t border-slate-800 relative z-10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Select Desired Membership Tier
                    </label>
                    <select
                      value={resellerTier}
                      onChange={(e) => setResellerTier(e.target.value as 'silver' | 'gold')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400 uppercase"
                    >
                      <option value="silver">Silver Tier (8% Wholesale Discount)</option>
                      <option value="gold">Gold Tier (15% Maximum Wholesale Discount)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={applying || profile?.reseller_status === 'pending'}
                    className="self-end px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {profile?.reseller_status === 'pending' ? (
                      'APPLICATION PENDING REVIEW'
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" /> APPLY NOW & GROW YOUR STORE
                      </>
                    )}
                  </button>
                </div>

                {resellerMsg && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{resellerMsg}</span>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> PURCHASE HISTORY (30 DAYS)
            </div>
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e0c1f', borderColor: '#334155', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="spent" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-amber-400" /> PACKAGE PRICING TIERS
            </div>
            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 9 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e0c1f', borderColor: '#334155', fontSize: '10px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Normal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Silver" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Gold" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider">RECENT DATABASE ORDERS</h3>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => {
                    setSelectedOrder(tx);
                    setReceiptFile(null);
                    setReceiptPreview(null);
                    setUploadSuccess(false);
                  }}
                  className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/80 flex items-center justify-between hover:border-purple-500/60 cursor-pointer transition-all hover:bg-slate-900/40"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-8 rounded-xl bg-slate-900 text-purple-400 font-mono text-xs font-bold flex items-center justify-center border border-slate-800">
                      #{tx.id}
                    </span>
                    <div>
                      <h5 className="font-bold text-white text-xs uppercase">{tx.package_name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">PLAYER UID: {tx.player_uid} • {tx.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="font-mono font-bold text-emerald-400 text-xs hidden sm:inline">
                      LKR {Number(tx.amount).toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewReceiptModal({
                          orderId: String(tx.id).slice(0, 8).toUpperCase(),
                          packageName: tx.package_name,
                          playerUid: tx.player_uid || 'N/A',
                          amount: Number(tx.amount),
                          paymentMethod: tx.receipt_url ? 'Bank Transfer' : 'Shadow Wallet',
                          status: tx.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING VERIFICATION',
                          date: tx.date || new Date().toLocaleDateString(),
                          customerName: profile?.name || profile?.email?.split('@')[0].toUpperCase(),
                          customerEmail: profile?.email,
                          storeName: profile?.store_name,
                          resellerRole: profile?.role,
                          receiptUrl: tx.receipt_url,
                        });
                      }}
                      className="p-2 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> <span className="hidden sm:inline">Receipt</span>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#0e0c1f] border border-slate-800/80 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400 mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">NO ORDERS FOUND FOR THIS ACCOUNT</h4>
                <p className="text-xs text-slate-400 font-mono">You have not placed any top-up orders yet. Browse our store catalog to top up your account!</p>
              </div>
              <Link
                href="/games"
                className="inline-block px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
              >
                BROWSE STORE CATALOG
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/60 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" /> EDIT USER PROFILE
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase shadow-lg shadow-cyan-600/30"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER DETAILS RECEIPT MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/60 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" /> ORDER RECEIPT #{selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">PACKAGE</span>
                  <span className="font-bold text-white uppercase">{selectedOrder.package_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">PLAYER UID</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedOrder.player_uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">DATE</span>
                  <span className="font-mono text-slate-300">{selectedOrder.date}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400 font-mono">TOTAL PAID</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">LKR {Number(selectedOrder.amount).toFixed(2)}</span>
                </div>
              </div>

              {/* Uploaded Bank Receipt Display */}
              {selectedOrder.receipt_url && (
                <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-mono text-[10px]">BANK TRANSFER RECEIPT</span>
                    <a
                      href={selectedOrder.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline text-[10px] font-bold flex items-center gap-1"
                    >
                      Full Size <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="h-36 rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img
                      src={selectedOrder.receipt_url}
                      alt="Uploaded Bank Receipt"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Upload Receipt Action Card with EXPLICIT SUBMIT BUTTON */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 space-y-3">
                <label className="block text-xs font-bold text-purple-300 uppercase">
                  {selectedOrder.receipt_url ? 'Replace Bank Receipt' : 'Upload Bank Transfer Receipt'}
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingReceipt}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer disabled:opacity-50"
                  />
                </div>

                {receiptPreview && (
                  <div className="space-y-2 pt-2 border-t border-purple-900/40">
                    <span className="text-[10px] font-mono text-slate-400">SELECTED IMAGE PREVIEW:</span>
                    <div className="h-28 rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                      <img src={receiptPreview} alt="Selected file" className="h-full object-contain" />
                    </div>
                  </div>
                )}

                {/* Explicit Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitReceipt}
                  disabled={!receiptFile || uploadingReceipt}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingReceipt ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> SUBMITTING TO DATABASE...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> SUBMIT BANK RECEIPT
                    </>
                  )}
                </button>

                {uploadSuccess && (
                  <p className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" /> Receipt uploaded successfully & saved to Supabase!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 font-mono text-[10px]">VERIFICATION STATUS</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                  selectedOrder.status === 'COMPLETED'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedOrder.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 font-bold text-xs uppercase"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={viewReceiptModal}
        onClose={() => setViewReceiptModal(null)}
      />
    </div>
  );
}
