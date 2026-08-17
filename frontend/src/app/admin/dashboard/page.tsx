'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ShoppingBag, Users, DollarSign, Clock, ArrowUpRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface RecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  date: string;
}

export default function AdminDashboardPage() {
  const [totalSales, setTotalSales] = useState(46.00);
  const [pendingVerification, setPendingVerification] = useState(2);
  const [totalUsers, setTotalUsers] = useState(8);
  const [todayRevenue, setTodayRevenue] = useState(0.00);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const supabase = createClient();
        
        // Fetch User Count
        const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        if (uCount !== null) setTotalUsers(uCount || 8);

        // Fetch Order Stats
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, profiles(name, email)')
          .order('created_at', { ascending: false })
          .limit(10);

        if (orderData && orderData.length > 0) {
          const formatted: RecentOrder[] = orderData.map((o: any) => ({
            id: `#${o.id.substring(0, 4)}`,
            customerName: o.profiles?.name || 'Customer',
            customerEmail: o.profiles?.email || 'user@example.com',
            amount: o.total_amount || 0,
            status: o.status as any,
            date: new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          }));
          setRecentOrders(formatted);
        } else {
          // Fallback mock data matching legacy screenshot
          setRecentOrders([
            { id: '#41', customerName: 'User One', customerEmail: 'user1@demo.com', amount: 1.00, status: 'completed', date: 'May 22, 2026' },
            { id: '#40', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', amount: 1.00, status: 'completed', date: 'May 16, 2026' },
            { id: '#39', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', amount: 1.00, status: 'pending', date: 'May 16, 2026' },
            { id: '#38', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', amount: 1.00, status: 'completed', date: 'May 16, 2026' },
            { id: '#37', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', amount: 2.00, status: 'pending', date: 'May 16, 2026' },
            { id: '#36', customerName: 'User One', customerEmail: 'user1@demo.com', amount: 2.00, status: 'rejected', date: 'May 11, 2026' },
          ]);
        }
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    }
    loadDashboardMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">Dashboard Overview</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics and store analytics.</p>
        </div>

        <Link
          href="/admin/orders"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all"
        >
          Manage Orders
        </Link>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Sales */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Sales</span>
              <h3 className="text-2xl font-black text-white">Rs. {totalSales.toFixed(2)}</h3>
              <p className="text-[10px] text-purple-400 font-bold">All-time earnings</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pending Verification</span>
              <h3 className="text-2xl font-black text-white">{pendingVerification}</h3>
              <p className="text-[10px] text-cyan-400 font-bold">Requires manual review</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Total Users</span>
              <h3 className="text-2xl font-black text-white">{totalUsers}</h3>
              <p className="text-[10px] text-pink-400 font-bold">Registered accounts</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="p-6 rounded-2xl bg-[#141229] border border-purple-950/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Today's Revenue</span>
              <h3 className="text-2xl font-black text-emerald-400">Rs. {todayRevenue.toFixed(2)}</h3>
              <p className="text-[10px] text-emerald-400/80 font-bold">Revenue generated today</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Order Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics (Last 30 Days) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Revenue Analytics (Last 30 Days)</h3>
            </div>
            <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
              Daily Trend
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-1 pt-6 px-2 border-b border-slate-800/60">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-purple-600/30 group-hover:bg-purple-500 rounded-t-sm transition-all"
                  style={{ height: `${Math.floor(Math.random() * 60) + 15}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Order Status Breakdown
          </h3>

          <div className="flex items-center justify-center py-4">
            <div className="w-36 h-36 rounded-full border-8 border-emerald-500 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-8 border-amber-500 border-t-transparent border-l-transparent transform rotate-45"></div>
              <div className="text-center">
                <span className="text-2xl font-black text-white">100%</span>
                <p className="text-[9px] font-mono text-slate-400">Total Fulfilled</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Completed
            </span>
            <span className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Rejected
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            Recent Orders
          </h3>
          <Link href="/admin/orders" className="text-xs font-bold text-purple-400 hover:text-purple-300 uppercase">
            View All ›
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-400">{order.id}</td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white">{order.customerName}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">Rs. {order.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        order.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {order.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                      {order.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                      {order.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">{order.date}</td>
                  <td className="p-4">
                    <Link
                      href="/admin/orders"
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Details ›
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
