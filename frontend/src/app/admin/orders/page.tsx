'use client';

import { useState, useEffect } from 'react';
import { updateDatabaseOrderStatus, DatabaseOrder } from '@/lib/ordersService';
import { Search, Filter, FileText, CheckCircle2, AlertCircle, XCircle, X, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function AdminOrdersPage() {
  const [activeFilter, setActiveFilter] = useState('ALL ORDERS');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DatabaseOrder | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/admin/orders');
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error('Failed to load admin orders', err);
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
      ord.package_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.free_fire_player_id.includes(searchQuery);

    if (!matchesSearch) return false;

    if (activeFilter === 'ALL ORDERS') return true;
    if (activeFilter === 'COMPLETED' || activeFilter === 'VERIFIED') return ord.fulfillmentStatus === 'COMPLETED';
    if (activeFilter === 'PROOF SUBMITTED') return Boolean(ord.paymentReceipt);
    if (activeFilter === 'PENDING PAYMENT') return ord.fulfillmentStatus === 'PENDING' && !ord.paymentReceipt;
    if (activeFilter === 'REJECTED') return ord.fulfillmentStatus === 'REJECTED';

    return true;
  });

  const handleUpdateStatus = async (status: 'COMPLETED' | 'PENDING' | 'REJECTED') => {
    if (!selectedOrder) return;
    
    // Update Supabase Database Directly
    await updateDatabaseOrderStatus(selectedOrder.raw_id, status);

    // Update Local State
    setOrders(
      orders.map((o) => (o.raw_id === selectedOrder.raw_id ? { ...o, fulfillmentStatus: status } : o))
    );
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review live database customer top-up transactions and uploaded bank receipts.</p>
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
                <th className="p-4">Package Item</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4">Bank Transfer Receipt</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => (
                  <tr key={ord.raw_id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-mono font-bold text-purple-400">{ord.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white uppercase">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{ord.customerEmail}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-200">{ord.package_name}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      LKR {Number(ord.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                          ord.fulfillmentStatus === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.fulfillmentStatus === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {ord.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {ord.paymentReceipt ? (
                        <a
                          href={ord.paymentReceipt}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 rounded-xl text-[10px] font-bold hover:bg-cyan-900/60 transition-all"
                        >
                          <ImageIcon className="w-3 h-3" /> View Receipt
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">No Receipt</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] font-mono text-slate-400">{ord.date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-4 py-1.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-300 font-bold text-[10px] hover:bg-purple-900/60 uppercase"
                      >
                        Review &gt;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono text-xs">
                    No orders matching status tab &quot;{activeFilter}&quot;. Try selecting &quot;ALL ORDERS&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#141229] border border-purple-950/60 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Review Order {selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#0e0c1f] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">CUSTOMER</span>
                  <p className="font-bold text-white uppercase">{selectedOrder.customerName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedOrder.customerEmail}</p>
                </div>
                <div className="p-3 bg-[#0e0c1f] rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">PLAYER UID</span>
                  <p className="font-mono font-bold text-cyan-400">{selectedOrder.free_fire_player_id}</p>
                </div>
              </div>

              <div className="p-4 bg-[#0e0c1f] rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">PACKAGE</span>
                  <span className="font-bold text-white">{selectedOrder.package_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">PAYMENT METHOD</span>
                  <span className="font-mono text-purple-300">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-2">
                  <span className="text-slate-400 font-mono">TOTAL PAID</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">
                    LKR {Number(selectedOrder.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedOrder.paymentReceipt ? (
                <div className="p-4 bg-[#0e0c1f] rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">UPLOADED BANK RECEIPT</span>
                    <a
                      href={selectedOrder.paymentReceipt}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:underline text-[10px] font-bold flex items-center gap-1"
                    >
                      Full Size <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="h-44 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                    <img
                      src={selectedOrder.paymentReceipt}
                      alt="Bank Transfer Receipt"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#0e0c1f] rounded-xl border border-slate-800 text-slate-500 font-mono text-center">
                  NO RECEIPT UPLOADED YET
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                className="py-3 rounded-xl bg-red-950/80 border border-red-800 text-red-400 font-bold text-xs uppercase hover:bg-red-900/80 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Reject Order
              </button>
              <button
                onClick={() => handleUpdateStatus('COMPLETED')}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve &amp; Deliver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
