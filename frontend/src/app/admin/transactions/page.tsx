'use client';

import { useState, useEffect } from 'react';
import { fetchDatabaseOrders, DatabaseOrder } from '@/lib/ordersService';
import { Receipt, Search, Filter, CheckCircle2, XCircle, AlertCircle, ExternalLink, Image as ImageIcon, Eye, X } from 'lucide-react';

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<DatabaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const orders = await fetchDatabaseOrders();
      setTransactions(orders);
    } catch (e) {
      console.error('Error fetching admin transactions:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: 'COMPLETED' | 'REJECTED' | 'PENDING') => {
    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setTransactions(transactions.map((tx) => (tx.raw_id === orderId ? { ...tx, fulfillmentStatus: newStatus } : tx)));
      } else {
        await loadTransactions();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const filtered = transactions.filter((tx) => {
    if (statusFilter !== 'All Statuses' && tx.fulfillmentStatus.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = tx.customerName.toLowerCase().includes(q);
      const matchEmail = tx.customerEmail.toLowerCase().includes(q);
      const matchPlayer = tx.free_fire_player_id.toLowerCase().includes(q);
      const matchPackage = tx.package_name.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q);
      if (!matchCustomer && !matchEmail && !matchPlayer && !matchPackage && !matchId) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Free Fire Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of customer top-up transactions, payment statuses, and Garena dispatch records.</p>
        </div>

        <button
          onClick={loadTransactions}
          className="px-4 py-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 font-bold text-xs uppercase tracking-wider transition-all"
        >
          Refresh Live Transactions
        </button>
      </div>

      {/* Filter Bar Card */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <div className="space-y-1">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-[#0e0c1f] border border-purple-950/60 rounded-xl text-xs text-white focus:outline-none w-44 font-mono"
            >
              <option>All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="space-y-1 flex-1">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
              Search Transactions
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Customer, Email, Free Fire Player ID, Package..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-[#0e0c1f] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStatusFilter('All Statuses'); setSearchQuery(''); }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Transaction ID / Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Free Fire ID</th>
                <th className="p-4">Package</th>
                <th className="p-4">Amount / Method</th>
                <th className="p-4">Bank Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Loading live database transactions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.raw_id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-4 font-mono">
                      <span className="font-bold text-purple-400 block text-xs">{tx.id}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tx.date}</span>
                    </td>
                    <td className="p-4">
                      <div>
                        <h5 className="font-bold text-white text-xs">{tx.customerName}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{tx.customerEmail}</p>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-cyan-400 text-xs">
                      {tx.free_fire_player_id}
                    </td>
                    <td className="p-4 font-bold text-slate-200">
                      {tx.package_name}
                    </td>
                    <td className="p-4 font-mono">
                      <span className="font-bold text-emerald-400 block text-xs">
                        LKR {tx.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block mt-0.5">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4">
                      {tx.paymentReceipt ? (
                        <button
                          onClick={() => setSelectedReceipt(tx.paymentReceipt)}
                          className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-300 text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 hover:bg-purple-900 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Receipt
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono italic">No receipt attached</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                          tx.fulfillmentStatus === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.fulfillmentStatus === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {tx.fulfillmentStatus === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.fulfillmentStatus === 'PENDING' && <AlertCircle className="w-3 h-3" />}
                        {tx.fulfillmentStatus === 'REJECTED' && <XCircle className="w-3 h-3" />}
                        {tx.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {tx.fulfillmentStatus !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.raw_id, 'COMPLETED')}
                            className="px-2 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-[9px] font-mono font-bold uppercase"
                            title="Approve & Complete"
                          >
                            Approve
                          </button>
                        )}
                        {tx.fulfillmentStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleUpdateStatus(tx.raw_id, 'REJECTED')}
                            className="px-2 py-1 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-[9px] font-mono font-bold uppercase"
                            title="Reject Order"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Image Lightbox Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-purple-400" /> Bank Payment Receipt Preview
              </h3>
              <button onClick={() => setSelectedReceipt(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] overflow-auto rounded-2xl bg-black border border-slate-800 flex items-center justify-center p-2">
              <img src={selectedReceipt} alt="Bank Transfer Receipt" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>

            <div className="flex justify-between items-center pt-2">
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 font-mono font-bold hover:underline flex items-center gap-1"
              >
                Open Full Original Image <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
