'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { fetchDatabaseOrders, updateDatabaseOrderReceipt, DatabaseOrder } from '@/lib/ordersService';
import { Profile } from '@/types/database';
import Pagination from '@/components/Pagination';
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
  Sparkles,
  BadgePercent,
  Wallet,
  Trophy,
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
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize, setOrdersPageSize] = useState(10);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
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
  const [dialogPayStatus, setDialogPayStatus] = useState<{
    type: 'success' | 'pending' | 'cancel' | 'error';
    message: string;
  } | null>(null);

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
                created_at: o.created_at || o.date,
                player_uid: o.free_fire_player_id,
                receipt_url: o.paymentReceipt,
              }))
            );
          }

          // Check for Dialog Pay redirect outcome parameters
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const isSuccess = params.get('dialogpay_success') === 'true';
            const isPending = params.get('dialogpay_pending') === 'true';
            const isCancel = params.get('dialogpay_cancel') === 'true';
            const isError = params.get('dialogpay_error') || params.get('error');
            const returnedOrderId = params.get('order_id');

            if (isSuccess) {
              setDialogPayStatus({
                type: 'success',
                message: 'Dialog Pay payment confirmed! Your Free Fire diamonds have been delivered directly to your account.',
              });

              if (returnedOrderId && Array.isArray(json.data)) {
                const targetOrder = json.data.find(
                  (o: any) => o.raw_id === returnedOrderId || (o.id || '').includes(returnedOrderId.slice(0, 8))
                );
                if (targetOrder) {
                  setViewReceiptModal({
                    orderId: String(targetOrder.id || returnedOrderId).replace('#', '').toUpperCase(),
                    packageName: targetOrder.package_name || 'Free Fire Diamonds',
                    playerUid: targetOrder.free_fire_player_id || 'Player UID',
                    amount: targetOrder.totalAmount,
                    paymentMethod: 'Dialog Pay (Genie Business)',
                    status: 'COMPLETED & DELIVERED',
                    date: targetOrder.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    time: 'Just now',
                    customerName: userName || 'Customer',
                    customerEmail: userEmail,
                    storeName: json.user.store_name || null,
                    resellerRole: json.user.role || 'normal',
                  });
                }
              }
            } else if (isPending) {
              setDialogPayStatus({
                type: 'pending',
                message: 'Dialog Pay payment is awaiting gateway confirmation. Your order will be fulfilled automatically upon bank settlement.',
              });
            } else if (isCancel) {
              setDialogPayStatus({
                type: 'cancel',
                message: 'Dialog Pay checkout session was cancelled. No charges were made and no diamonds were deducted.',
              });
            } else if (isError) {
              setDialogPayStatus({
                type: 'error',
                message: 'An issue occurred during Dialog Pay verification. If payment was deducted, your order will sync automatically.',
              });
            }
          }

          // Fetch real-time packages for Package Pricing Tiers chart
          try {
            const pkgRes = await fetch('/api/packages');
            const pkgJson = await pkgRes.json();
            if (pkgJson.success && Array.isArray(pkgJson.packages)) {
              setPackagesList(pkgJson.packages);
            }
          } catch (pkgErr) {
            console.error('Error fetching packages for dashboard:', pkgErr);
          }

          // Fetch real-time wallet float balance for reseller card
          const targetUid = json.user.id || authUser?.id;
          if (targetUid && targetUid !== 'demo-user') {
            try {
              const wRes = await fetch(`/api/wallet/balance?user_id=${encodeURIComponent(targetUid)}`);
              const wJson = await wRes.json();
              if (wJson.success) {
                setWalletBalance(wJson.wallet_balance || 0);
              }
            } catch (wErr) {
              console.error('Error fetching wallet balance for dashboard:', wErr);
            }
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

  const lineData = useMemo(() => {
    const days = 30;
    const now = new Date();
    const dayBuckets: { [key: string]: { date: string; spent: number; ordersCount: number; timestamp: number } } = {};

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayBuckets[key] = {
        date: label,
        spent: 0,
        ordersCount: 0,
        timestamp: d.getTime(),
      };
    }

    transactions.forEach((tx) => {
      const st = (tx.status || '').toUpperCase();
      if (st === 'REJECTED' || st === 'CANCELLED') return;

      const raw = tx.created_at || tx.raw_date || tx.date;
      if (!raw) return;

      const tDate = new Date(raw);
      if (isNaN(tDate.getTime())) return;

      const yyyy = tDate.getFullYear();
      const mm = String(tDate.getMonth() + 1).padStart(2, '0');
      const dd = String(tDate.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      const amount = Number(tx.amount || 0);

      if (dayBuckets[key]) {
        dayBuckets[key].spent += amount;
        dayBuckets[key].ordersCount += 1;
      }
    });

    const result = Object.values(dayBuckets).sort((a, b) => a.timestamp - b.timestamp);

    // If all spent are 0 in the 30-day window but transactions exist, map actual transaction dates
    const hasAnySpend = result.some((r) => r.spent > 0);
    if (!hasAnySpend && transactions.length > 0) {
      const txMap = new Map<string, { date: string; spent: number; ordersCount: number }>();
      transactions.forEach((tx) => {
        const raw = tx.created_at || tx.date;
        const d = tx.date || (raw ? new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent');
        const amt = Number(tx.amount || 0);
        if (txMap.has(d)) {
          const entry = txMap.get(d)!;
          entry.spent += amt;
          entry.ordersCount += 1;
        } else {
          txMap.set(d, { date: d, spent: amt, ordersCount: 1 });
        }
      });
      if (txMap.size > 0) {
        return Array.from(txMap.values());
      }
    }

    return result;
  }, [transactions]);

  const barData = useMemo(() => {
    if (packagesList.length > 0) {
      const p100 = packagesList.find(
        (p) => p.diamond_amount === 100 && (p.package_type === 'diamond' || p.package_name?.includes('100'))
      );
      const pWeekly = packagesList.find(
        (p) => p.package_name?.toLowerCase().includes('weekly') && !p.package_name?.toLowerCase().includes('lite')
      );
      const p310 = packagesList.find((p) => p.diamond_amount === 310);

      const items = [p100, pWeekly, p310].filter(Boolean);
      if (items.length > 0) {
        return items.map((p: any) => ({
          name: p.package_name,
          Normal: Number(p.normal_price || 0),
          Standard: Number(p.silver_price || Math.round(Number(p.normal_price || 0) * 0.95)),
          Elite: Number(p.gold_price || Math.round(Number(p.normal_price || 0) * 0.9)),
        }));
      }
    }
    return [
      { name: '100 Diamond', Normal: 325, Standard: 310, Elite: 295 },
      { name: 'Weekly Subscription', Normal: 562, Standard: 535, Elite: 508 },
      { name: '310 Diamond', Normal: 990, Standard: 940, Elite: 890 },
    ];
  }, [packagesList]);

  const totalSpent = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const activeOrdersCount = transactions.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0814] pb-20 space-y-8 print:bg-transparent">
      <div className="print:hidden space-y-8">
        {/* Top Banner Header with Cinematic Esports Gaming Artwork */}
        <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] w-full border-b border-purple-900/50 overflow-hidden flex flex-col items-center justify-center text-center group">
          {/* Cinematic Gaming Background Image */}
          <Image
            src="/dashboard-banner.jpg"
            alt="Shadow Store Free Fire Gaming Dashboard Banner"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center md:object-[center_30%] scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Tactical Dark Scrims & Radial Vignette Gradients for Maximum Legibility & Glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/70 to-[#0a0814]/85 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0814]/90 via-[#0a0814]/40 to-[#0a0814]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.25)_0%,_rgba(6,182,212,0.18)_40%,_transparent_75%)] pointer-events-none" />
          <div className="absolute inset-0 cyber-grid opacity-15 pointer-events-none" />

          {/* Top & Bottom Neon Laser Accent Lines */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_rgba(6,182,212,0.8)] z-10" />
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_14px_rgba(168,85,247,0.8)] z-10" />

          {/* Foreground Content & Tactical Gaming HUD Elements */}
          <div className="relative z-10 space-y-3 px-4 max-w-4xl mx-auto py-10">

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-[0.2em] font-gaming text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
              MY <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-300">DASHBOARD</span>
            </h1>

            {/* Breadcrumb Navigation Pill */}
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 border border-purple-500/40 backdrop-blur-md text-slate-300 shadow-lg">
                <Link href="/" className="hover:text-cyan-400 transition-colors flex items-center gap-1">
                  HOME
                </Link>
                <ChevronRight className="w-3 h-3 text-purple-400" />
                <span className="text-cyan-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> DASHBOARD
                </span>
              </div>
            </div>

            {/* Player Welcome / Hub Subtext */}
            <p className="text-xs sm:text-sm text-slate-300/90 font-mono max-w-lg mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] pt-1">
              Welcome, <span className="text-cyan-300 font-bold">{profile?.name || 'Gamer'}</span> • Manage your Free Fire diamond orders, receipts & wallet perks
            </p>
          </div>
        </div>

      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* Dialog Pay Status Notification Banner */}
        {dialogPayStatus && (
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex items-start justify-between gap-3 shadow-xl transition-all animate-in fade-in duration-300 ${
              dialogPayStatus.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : dialogPayStatus.type === 'pending'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {dialogPayStatus.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : dialogPayStatus.type === 'pending' ? (
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <X className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  {dialogPayStatus.type === 'success'
                    ? 'Payment Confirmed & Top-Up Delivered'
                    : dialogPayStatus.type === 'pending'
                    ? 'Payment Pending Confirmation'
                    : 'Payment Cancelled'}
                </h4>
                <p className="text-xs text-slate-300/90 mt-1 leading-relaxed">
                  {dialogPayStatus.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDialogPayStatus(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Admin Quick Access Bar */}
        {profile?.role === 'admin' && (
          <div className="bg-purple-950/60 border border-purple-800 p-5 sm:p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase">SYSTEM ADMINISTRATOR CONTROL DETECTED</h4>
                <p className="text-xs text-purple-300 font-mono">Access store settings, packages, shell accounts & reseller applications.</p>
              </div>
            </div>
            <Link href="/admin/dashboard" className="w-full sm:w-auto text-center px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl transition-all shadow-lg shadow-purple-600/30 shrink-0">
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
                  {profile?.role === 'gold' ? 'ELITE RESELLER' : profile?.role === 'silver' ? 'STANDARD RESELLER' : profile?.role === 'admin' ? 'ADMIN' : 'NORMAL USER'}
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
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">TOTAL ORDERS</span>
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
        <div id="reseller-section" className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <Award className="w-4 h-4 text-purple-400" /> RESELLER ACCOUNT & MEMBERSHIP
            </div>
            {profile?.store_name && (
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30 truncate max-w-[200px]">
                Store: {profile.store_name}
              </span>
            )}
          </div>

          {/* 1. RESELLER CARD: PROMINENT VIP CARD SHOWING BALANCE & VALIDITY */}
          <div className={`p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl border transition-all ${
            profile?.role === 'gold'
              ? 'bg-gradient-to-br from-[#1a142e] via-[#150f26] to-[#261842] border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
              : profile?.role === 'silver'
              ? 'bg-gradient-to-br from-[#0e1828] via-[#0b1320] to-[#122238] border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
              : 'bg-gradient-to-br from-[#130f28] via-[#0d091e] to-[#181135] border-purple-900/60'
          }`}>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-gradient-to-bl from-purple-500/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Card Top Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                    profile?.role === 'gold'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : profile?.role === 'silver'
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                  }`}>
                    {profile?.role === 'gold' ? (
                      <Trophy className="w-6 h-6" />
                    ) : (
                      <ShieldCheck className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400">
                      SHADOW STORE RESELLER PARTNER
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                      {profile?.role === 'gold'
                        ? 'ELITE RESELLER VIP CARD'
                        : profile?.role === 'silver'
                        ? 'STANDARD RESELLER CARD'
                        : 'RESELLER ACCESS CARD'}
                    </h3>
                  </div>
                </div>

                {/* Validity Period Pill */}
                <div className="flex items-center gap-2">
                  <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 shadow-sm ${
                    profile?.role === 'gold'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : profile?.role === 'silver'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {profile?.role === 'gold'
                      ? 'VALID FOR 1 YEAR (365 DAYS ACTIVE)'
                      : profile?.role === 'silver'
                      ? 'PERMANENT VALIDITY'
                      : 'UPGRADE TO ACTIVATE'}
                  </span>
                </div>
              </div>

              {/* Card Body: Balance & Validity & Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Available Float Balance */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> RESELLER FLOAT BALANCE
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    LKR {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[10px] text-slate-500">Auto-deducted on diamond top-ups</p>
                </div>

                {/* Account Validity Period */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" /> ACCOUNT VALIDITY PERIOD
                  </span>
                  <div className="text-lg font-black text-white uppercase">
                    {profile?.role === 'gold'
                      ? 'VALID FOR 1 YEAR'
                      : profile?.role === 'silver'
                      ? 'PERMANENT'
                      : 'INACTIVE'}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {profile?.role === 'gold'
                      ? 'Valid 1 Year from activation date'
                      : profile?.role === 'silver'
                      ? 'Lifetime verified partner status'
                      : 'Apply below to unlock'}
                  </p>
                </div>

                {/* Wholesale Discount Margin */}
                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.08] space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BadgePercent className="w-3.5 h-3.5 text-amber-400" /> WHOLESALE DISCOUNT
                  </span>
                  <div className={`text-2xl font-black font-mono ${
                    profile?.role === 'gold' ? 'text-amber-400' : profile?.role === 'silver' ? 'text-cyan-400' : 'text-slate-400'
                  }`}>
                    {profile?.role === 'gold'
                      ? 'UP TO 10% OFF'
                      : profile?.role === 'silver'
                      ? 'UP TO 5% OFF'
                      : 'UP TO 10% OFF'}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {profile?.role === 'gold' ? 'Elite Special Rate Active' : profile?.role === 'silver' ? 'Standard Seller Rate Active' : 'Select tier below'}
                  </p>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>
                    Store Name: <strong className="text-white">{profile?.store_name || profile?.name || 'SHADOW STORE SL'}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('shadow-wallet-widget');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-purple-600/30"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Top Up Balance
                </button>
              </div>
            </div>
          </div>

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

          {/* RESELLER PERKS & TIER SHOWCASE CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#120f26] via-[#0c0a1a] to-[#181335] border border-purple-900/60 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold uppercase tracking-widest border border-amber-500/30">
                  RESELLER MEMBERSHIP & BENEFITS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider">
                  Unlock Exclusive Wholesale Profit Margins
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Become or upgrade your certified Reseller tier to instantly earn up to 10% wholesale profit on every Free Fire diamond recharge & membership.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-purple-950/60 border border-purple-800/80 px-4 py-2 rounded-2xl shrink-0">
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wide">Up to 10% Profit Margin</span>
              </div>
            </div>

            {/* Tier Comparison Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Standard Tier Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                profile?.role === 'silver'
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                  : resellerTier === 'silver'
                  ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                  : 'bg-[#0e0c1f] border-slate-800'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-cyan-400" /> STANDARD RESELLER TIER
                  </span>
                  <div className="flex items-center gap-1.5">
                    {profile?.role === 'silver' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[9px] font-mono font-black uppercase">
                        YOUR ACTIVE TIER
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                      UP TO 5% OFF
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Free for sellers:</strong> 0 LKR signup fee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Up to 5% discount:</strong> off standard retail prices</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span><strong>Permanent validity:</strong> Lifetime partner status</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Requires admin approval/verification</span>
                  </li>
                </ul>
              </div>

              {/* Elite Tier Card */}
              <div className={`p-5 rounded-2xl border transition-all ${
                profile?.role === 'gold'
                  ? 'bg-amber-500/15 border-amber-400 shadow-xl shadow-amber-500/20 ring-1 ring-amber-400/50'
                  : resellerTier === 'gold'
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
                  : 'bg-[#0e0c1f] border-slate-800'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" /> ELITE RESELLER TIER
                  </span>
                  <div className="flex items-center gap-1.5">
                    {profile?.role === 'gold' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-mono font-black uppercase">
                        YOUR ACTIVE TIER
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                      UP TO 10% OFF
                    </span>
                  </div>
                </div>
                <ul className="space-y-2 text-[11px] text-slate-300 font-mono">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Paid Tier:</strong> Starting price 2,000 LKR</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Up to 10% discount:</strong> Special discounted retail rates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span><strong>Valid for 1 year:</strong> 365 days after activation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Contact admin for details & activation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Reseller Application / Upgrade Form */}
            {profile?.role !== 'gold' ? (
              <form onSubmit={handleApplyReseller} className="space-y-4 pt-2 border-t border-slate-800 relative z-10">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {profile?.role === 'silver' ? 'Upgrade Membership Tier' : 'Select Desired Membership Tier'}
                    </label>
                    <select
                      value={resellerTier}
                      onChange={(e) => setResellerTier(e.target.value as 'silver' | 'gold')}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-400 uppercase"
                    >
                      {profile?.role !== 'silver' && (
                        <option value="silver">Standard Reseller (Free • Up to 5% Discount • Permanent)</option>
                      )}
                      <option value="gold">Elite Reseller (Starting 2,000 LKR • Up to 10% Discount • Valid 1 Year)</option>
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
                        <ShieldCheck className="w-4 h-4" /> {profile?.role === 'silver' ? 'UPGRADE TO ELITE RESELLER' : 'APPLY FOR RESELLER'}
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
            ) : (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 relative z-10">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <span>YOU HAVE UNLOCKED MAXIMUM ELITE RESELLER TIER (UP TO 10% SPECIAL DISCOUNT ACTIVE).</span>
              </div>
            )}
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 min-w-0 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> PURCHASE HISTORY (30 DAYS)
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-bold">
                LKR {totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2 })} Total
              </span>
            </div>
            <div className="h-56 w-full pt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    tick={{ fontSize: 9 }}
                    interval="preserveStartEnd"
                    minTickGap={20}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 9 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e0c1f',
                      borderColor: '#3b2d60',
                      borderRadius: '10px',
                      fontSize: '11px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`LKR ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Purchases']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="spent"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={(props: any) => {
                      if (props.payload?.spent > 0) {
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={4}
                            fill="#22d3ee"
                            stroke="#a855f7"
                            strokeWidth={2}
                            key={props.key}
                          />
                        );
                      }
                      return <circle cx={props.cx} cy={props.cy} r={1.5} fill="#6b21a8" key={props.key} />;
                    }}
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
              <BarChart3 className="w-4 h-4 text-amber-400" /> PACKAGE PRICING TIERS
            </div>
            <div className="h-56 w-full pt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1b3a" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fontSize: 9 }}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0e0c1f',
                      borderColor: '#3b2d60',
                      borderRadius: '10px',
                      fontSize: '10px',
                      color: '#fff',
                    }}
                    formatter={(val: any) => [`LKR ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 'Price']}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="Normal" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Standard" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Elite" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">RECENT DATABASE ORDERS</h3>
            {transactions.length > 0 && (
              <span className="text-[10px] font-mono text-purple-300 font-bold">
                {transactions.length} Total Orders
              </span>
            )}
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions
                .slice((ordersPage - 1) * ordersPageSize, ordersPage * ordersPageSize)
                .map((tx) => (
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
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-2">
                    <span className="w-12 h-8 rounded-xl bg-slate-900 text-purple-400 font-mono text-xs font-bold flex items-center justify-center border border-slate-800 shrink-0">
                      #{tx.id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-white text-xs uppercase truncate">{tx.package_name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono truncate">PLAYER UID: {tx.player_uid} • {tx.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <span className="font-mono font-bold text-emerald-400 text-xs hidden sm:inline">
                      LKR {Number(tx.amount).toFixed(2)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : (tx.status === 'REFUNDED' || tx.status === 'refunded')
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status === 'REFUNDED' || tx.status === 'refunded' ? 'REFUNDED TO WALLET' : tx.status}
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
                          status: tx.status === 'COMPLETED' ? 'COMPLETED' : (tx.status === 'REFUNDED' || tx.status === 'refunded') ? 'REFUNDED' : 'PENDING VERIFICATION',
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
              <Pagination
                currentPage={ordersPage}
                totalPages={Math.ceil(transactions.length / ordersPageSize)}
                totalItems={transactions.length}
                pageSize={ordersPageSize}
                onPageChange={setOrdersPage}
                onPageSizeChange={setOrdersPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
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
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-mono font-bold flex items-center gap-1 transition-all"
              >
                <X className="w-4 h-4 text-red-400" /> CLOSE
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
                    : (selectedOrder.status === 'REFUNDED' || selectedOrder.status === 'refunded')
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : selectedOrder.status === 'PENDING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedOrder.status === 'REFUNDED' || selectedOrder.status === 'refunded' ? 'REFUNDED TO WALLET' : selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewReceiptModal({
                    orderId: String(selectedOrder.id).slice(0, 8).toUpperCase(),
                    packageName: selectedOrder.package_name,
                    playerUid: selectedOrder.player_uid || 'N/A',
                    amount: Number(selectedOrder.amount),
                    paymentMethod: selectedOrder.receipt_url ? 'Bank Transfer' : 'Shadow Wallet',
                    status: selectedOrder.status === 'COMPLETED' ? 'COMPLETED' : (selectedOrder.status === 'REFUNDED' || selectedOrder.status === 'refunded') ? 'REFUNDED' : 'PENDING VERIFICATION',
                    date: selectedOrder.date || new Date().toLocaleDateString(),
                    customerName: profile?.name || profile?.email?.split('@')[0].toUpperCase(),
                    customerEmail: profile?.email,
                    storeName: profile?.store_name,
                    resellerRole: profile?.role,
                    receiptUrl: selectedOrder.receipt_url,
                  });
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Download className="w-4 h-4" /> Download Official Invoice / Receipt
              </button>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-300 font-bold text-xs uppercase transition-all"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      </div> {/* End print:hidden wrapper */}

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        receipt={viewReceiptModal}
        onClose={() => setViewReceiptModal(null)}
      />
    </div>
  );
}
