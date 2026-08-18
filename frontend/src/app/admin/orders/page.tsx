'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Filter, Eye, FileText, CheckCircle2, AlertCircle, XCircle, X, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface OrderItem {
  id: string;
  customerName: string;
  customerEmail: string;
  itemSummary: string;
  totalAmount: number;
  fulfillmentStatus: 'COMPLETED' | 'PENDING' | 'REJECTED';
  paymentReceipt: string | null;
  date: string;
}

export default function AdminOrdersPage() {
  const [activeFilter, setActiveFilter] = useState('ALL ORDERS');
  const [searchQuery, setSearchQuery] = useState('');

  const [orders, setOrders] = useState<OrderItem[]>([
    { id: '#41', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', date: 'May 22, 2026 07:33' },
    { id: '#40', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', date: 'May 16, 2026 15:56' },
    { id: '#39', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'PENDING', paymentReceipt: null, date: 'May 16, 2026 05:51' },
    { id: '#38', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', date: 'May 16, 2026 05:14' },
    { id: '#37', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 2.00, fulfillmentStatus: 'PENDING', paymentReceipt: null, date: 'May 16, 2026 05:00' },
    { id: '#36', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds', totalAmount: 2.00, fulfillmentStatus: 'REJECTED', paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', date: 'May 11, 2026 11:18' },
    { id: '#35', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds +1 more', totalAmount: 6.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', date: 'May 11, 2026 11:16' },
  ]);

  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [viewingReceiptModal, setViewingReceiptModal] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadOrders() {
      const { data } = await supabase.from('purchase_transactions').select('*, package:packages(*)');
      if (data && data.length > 0) {
        setOrders(
          data.map((tx) => ({
            id: `#${tx.id.substring(0, 4)}`,
            customerName: tx.free_fire_player_id ? `Player: ${tx.free_fire_player_id}` : 'Customer',
            customerEmail: 'customer@shadowstore.com',
            itemSummary: tx.package?.package_name || 'Free Fire Package',
            totalAmount: Number(tx.price_paid || 1.00),
            fulfillmentStatus: (tx.status || 'pending').toUpperCase() as any,
            paymentReceipt: tx.receipt_url || null,
            date: new Date(tx.created_at || Date.now()).toLocaleString(),
          }))
        );
      }
    }
    loadOrders();
  }, []);

  const filterTabs = ['ALL ORDERS', 'PENDING PAYMENT', 'PROOF SUBMITTED', 'VERIFIED', 'COMPLETED', 'REJECTED'];

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.itemSummary.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL ORDERS') return true;
    if (activeFilter === 'COMPLETED') return ord.fulfillmentStatus === 'COMPLETED';
    if (activeFilter === 'PENDING PAYMENT' || activeFilter === 'PROOF SUBMITTED') return ord.fulfillmentStatus === 'PENDING';
    if (activeFilter === 'REJECTED') return ord.fulfillmentStatus === 'REJECTED';

    return true;
  });

  const handleUpdateStatus = (status: 'COMPLETED' | 'PENDING' | 'REJECTED') => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) => (o.id === selectedOrder.id ? { ...o, fulfillmentStatus: status } : o))
    );
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review customer top-up transactions and uploaded bank receipts.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, User, or Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeFilter === tab
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-[#141229] border border-purple-950/40 text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Bank Transfer Receipt</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono font-bold text-purple-400">{ord.id}</td>
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white">{ord.customerName}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{ord.customerEmail}</p>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-slate-200">{ord.itemSummary}</td>
                  <td className="p-4 font-bold text-emerald-400 font-mono">LKR {ord.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        ord.fulfillmentStatus === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ord.fulfillmentStatus === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {ord.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    {ord.paymentReceipt ? (
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-mono text-[10px] font-bold inline-flex items-center gap-1 uppercase transition-all"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> View Receipt
                      </button>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px] uppercase">No Receipt</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{ord.date}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(ord)}
                      className="px-4 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider"
                    >
                      Review ›
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Receipt Inspector Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Review Order {selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-[#0e0c1f] p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white font-bold">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300 font-mono">{selectedOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="text-purple-300 font-bold">{selectedOrder.itemSummary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Paid:</span>
                <span className="text-emerald-400 font-bold font-mono">LKR {selectedOrder.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="text-amber-400 font-bold">{selectedOrder.fulfillmentStatus}</span>
              </div>
            </div>

            {/* Bank Transfer Receipt Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Uploaded Bank Payment Receipt</span>
                {selectedOrder.paymentReceipt && (
                  <a
                    href={selectedOrder.paymentReceipt}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline text-[10px] font-bold flex items-center gap-1"
                  >
                    Open Full Image <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {selectedOrder.paymentReceipt ? (
                <div className="rounded-2xl bg-slate-950 border border-slate-800 p-2 overflow-hidden h-52 flex items-center justify-center">
                  <img
                    src={selectedOrder.paymentReceipt}
                    alt="Bank Transfer Receipt"
                    className="max-h-full max-w-full object-contain rounded-xl"
                  />
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-950 border border-slate-800/80 p-8 text-center text-slate-500 text-xs font-mono">
                  No bank receipt uploaded yet for this order.
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Fulfillment Decision</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase shadow-lg shadow-emerald-500/10 transition-all"
                >
                  Approve Order
                </button>
                <button
                  onClick={() => handleUpdateStatus('PENDING')}
                  className="py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 font-bold text-xs uppercase transition-all"
                >
                  Hold
                </button>
                <button
                  onClick={() => handleUpdateStatus('REJECTED')}
                  className="py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-xs uppercase shadow-lg shadow-red-500/10 transition-all"
                >
                  Reject Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
