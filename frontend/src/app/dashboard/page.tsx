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
  ExternalLink,
  Check,
  ShoppingBag,
} from 'lucide-react';
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
    id: 'demo-user',
    name: 'STANDARD CUSTOMER ACCOUNT',
    email: 'USER@SHADOWTOPUP.COM',
    role: 'normal',
    reseller_status: 'none',
    created_at: '2026-05-11T00:00:00Z',
    updated_at: '2026-05-11T00:00:00Z',
  });

  const [transactions, setTransactions] = useState<any[]>([]);
  const [resellerTier, setResellerTier] = useState<'silver' | 'gold'>('silver');
  const [applying, setApplying] = useState(false);
  const [resellerMsg, setResellerMsg] = useState<string | null>(null);

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

  const supabase = createClient();

  useEffect(() => {
    async function loadUserDatabaseOrders() {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData?.user;
      
      let currentEmail = 'USER@SHADOWTOPUP.COM';
      let currentName = 'STANDARD CUSTOMER ACCOUNT';

      if (authUser) {
        currentEmail = authUser.email || 'USER@SHADOWTOPUP.COM';
        currentName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0].toUpperCase() || 'CUSTOMER ACCOUNT';
        
        // Fetch extended profile data if exists
        const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
        if (profileRow) {
          if (profileRow.name) currentName = profileRow.name.toUpperCase();
          if (profileRow.email) currentEmail = profileRow.email.toUpperCase();
        }

        setProfile((prev) => ({
          ...prev!,
          id: authUser.id,
          email: currentEmail.toUpperCase(),
          name: currentName,
          role: profileRow?.role || 'normal',
          reseller_status: profileRow?.reseller_status || 'none',
        }));
        
        setEditName(currentName);
        setEditEmail(currentEmail.toUpperCase());
      } else {
        // Fallback for unauthenticated view (should ideally redirect to login, but kept for UI structure)
        if (typeof window !== 'undefined') {
          const storedEmail = localStorage.getItem('active_session_email');
          const storedName = localStorage.getItem('active_session_name');
          if (storedEmail) {
            currentEmail = storedEmail.toUpperCase();
            currentName = storedName ? storedName.toUpperCase() : storedEmail.split('@')[0].toUpperCase();
          }
        }
        setProfile((prev) => ({
          ...prev!,
          email: currentEmail,
          name: currentName,
        }));
      }

      // Fetch orders for this user directly from Supabase
      let userDbOrders = await fetchDatabaseOrders();

      // Filter by auth user or email
      let filtered = userDbOrders.filter((o) => {
        if (authUser && o.user_id && o.user_id === authUser.id) return true;
        if (o.customerEmail && o.customerEmail.trim().toLowerCase() === currentEmail.trim().toLowerCase()) return true;
        return false;
      });

      // Direct fallback query if fetchDatabaseOrders yielded nothing for this user
      if (filtered.length === 0 && authUser) {
        const { data: directOrders } = await supabase
          .from('orders')
          .select('*')
          .or(`user_id.eq.${authUser.id},user_id.eq.${authUser.email}`);
        
        const { data: directTx } = await supabase
          .from('purchase_transactions')
          .select('*')
          .or(`user_id.eq.${authUser.id},user_id.eq.${authUser.email}`);

        const combined = [...(directOrders || []), ...(directTx || [])];
        if (combined.length > 0) {
          filtered = combined.map((row: any) => {
            const rawStatus = (row.status || 'pending').toLowerCase();
            const isCompleted = ['completed', 'success', 'verified'].includes(rawStatus);
            const isRejected = ['rejected', 'failed'].includes(rawStatus);
            return {
              id: `#${(row.id || '').substring(0, 4).toUpperCase()}`,
              raw_id: row.id,
              user_id: row.user_id || authUser.id,
              customerName: currentName,
              customerEmail: currentEmail,
              free_fire_player_id: row.free_fire_player_id || '8777843685',
              package_name: row.package_name || 'Free Fire Diamonds',
              totalAmount: Number(row.total_amount || row.price_paid || 750.00),
              fulfillmentStatus: isCompleted ? 'COMPLETED' : isRejected ? 'REJECTED' : 'PENDING',
              paymentMethod: (row.payment_method || 'BANK TRANSFER').toUpperCase(),
              paymentReceipt: row.receipt_path || row.receipt_url || null,
              date: new Date(row.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              timestamp: new Date(row.created_at || Date.now()).toLocaleString(),
            } as any;
          });
        }
      }

      setTransactions(
        filtered.map((o) => ({
          id: o.id.replace('#', ''),
          raw_id: o.raw_id,
          package_name: o.package_name,
          items: '1X ITEMS',
          amount: o.totalAmount,
          status: o.fulfillmentStatus,
          time: '11:30 AM',
          date: o.date.toUpperCase(),
          player_uid: o.free_fire_player_id,
          receipt_url: o.paymentReceipt,
        }))
      );
    }
    loadUserDatabaseOrders();
  }, []);

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

        if (selectedOrder.raw_id) {
          await updateDatabaseOrderReceipt(selectedOrder.raw_id, receiptUrl);
        }

        setSelectedOrder({
          ...selectedOrder,
          receipt_url: receiptUrl,
        });

        setTransactions((prev) =>
          prev.map((t) =>
            t.id === selectedOrder.id ? { ...t, receipt_url: receiptUrl } : t
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white text-2xl font-black">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">{profile?.name}</h2>
              <p className="text-xs text-slate-400 font-mono">{profile?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-3 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                  profile?.role === 'gold'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : profile?.role === 'silver'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : profile?.role === 'admin'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
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

        {/* Details Info Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">FULL NAME</span>
            <p className="text-xs font-bold text-white uppercase mt-1">{profile?.name}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">EMAIL ADDRESS</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">{profile?.email}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">ACCOUNT ROLE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">{profile?.role.toUpperCase()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0e0c1f] border border-slate-800/60">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">MEMBER SINCE</span>
            <p className="text-xs font-bold text-white uppercase mt-1 font-mono">MAY 11, 2026</p>
          </div>
        </div>

        {/* RESELLER STATUS CARD */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-white uppercase tracking-wider">
            <Award className="w-4 h-4 text-red-500" /> RESELLER STATUS
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
          ) : (
            <div className="p-6 rounded-2xl bg-[#0e0c1f] border border-slate-800 space-y-4">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">BECOME A RESELLER</h4>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                GET EXCLUSIVE DISCOUNTS ON ALL TOP-UP PACKAGES BY BECOMING A RESELLER. APPLY BELOW.
              </p>

              <form onSubmit={handleApplyReseller} className="space-y-3 max-w-md">
                <label className="block text-[9px] font-mono text-slate-400 uppercase">SELECT TIER</label>
                <select
                  value={resellerTier}
                  onChange={(e) => setResellerTier(e.target.value as 'silver' | 'gold')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-red-500"
                >
                  <option value="silver">Silver Reseller Tier</option>
                  <option value="gold">Gold Reseller Tier</option>
                </select>

                <button
                  type="submit"
                  disabled={applying || profile?.reseller_status === 'pending'}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
                >
                  {profile?.reseller_status === 'pending' ? 'APPLICATION PENDING' : 'SUBMIT APPLICATION'}
                </button>
              </form>

              {resellerMsg && (
                <p className="text-xs text-amber-400 font-mono font-bold mt-2">{resellerMsg}</p>
              )}
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
                  <Bar dataKey="Normal" fill="#64748b" />
                  <Bar dataKey="Silver" fill="#cbd5e1" />
                  <Bar dataKey="Gold" fill="#eab308" />
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

                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-emerald-400 text-xs">
                      LKR {Number(tx.amount).toFixed(2)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                      tx.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : tx.status === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {tx.status}
                    </span>
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
    </div>
  );
}
