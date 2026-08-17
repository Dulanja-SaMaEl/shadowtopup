'use client';

import { useState } from 'react';
import { Search, Filter, Eye, FileText, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

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

  const [orders] = useState<OrderItem[]>([
    { id: '#41', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://i.ibb.co/receipt1.jpg', date: 'May 22, 2026 07:33' },
    { id: '#40', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://i.ibb.co/receipt2.jpg', date: 'May 16, 2026 15:56' },
    { id: '#39', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'PENDING', paymentReceipt: null, date: 'May 16, 2026 05:51' },
    { id: '#38', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 1.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://i.ibb.co/receipt3.jpg', date: 'May 16, 2026 05:14' },
    { id: '#37', customerName: 'Dulanja Abeysinghe', customerEmail: 'dulanja150abeysinghe@gmail.com', itemSummary: '100 Diamonds', totalAmount: 2.00, fulfillmentStatus: 'PENDING', paymentReceipt: null, date: 'May 16, 2026 05:00' },
    { id: '#36', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds', totalAmount: 2.00, fulfillmentStatus: 'REJECTED', paymentReceipt: 'https://i.ibb.co/receipt4.jpg', date: 'May 11, 2026 11:18' },
    { id: '#35', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '100 Diamonds +1 more', totalAmount: 6.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: 'https://i.ibb.co/receipt5.jpg', date: 'May 11, 2026 11:16' },
    { id: '#32', customerName: 'User Three', customerEmail: 'user3@demo.com', itemSummary: '325 UC', totalAmount: 5.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: null, date: 'May 10, 2026 10:16' },
    { id: '#27', customerName: 'User Three', customerEmail: 'user3@demo.com', itemSummary: '660 UC', totalAmount: 10.00, fulfillmentStatus: 'PENDING', paymentReceipt: null, date: 'May 04, 2026 10:16' },
    { id: '#22', customerName: 'User One', customerEmail: 'user1@demo.com', itemSummary: '660 UC', totalAmount: 10.00, fulfillmentStatus: 'COMPLETED', paymentReceipt: null, date: 'May 03, 2026 10:16' },
  ]);

  const filterTabs = ['ALL ORDERS', 'PENDING PAYMENT', 'PROOF SUBMITTED', 'VERIFIED', 'COMPLETED', 'REJECTED'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Order Management</h1>
          <p className="text-xs text-slate-400 mt-1">Review customer top-up transactions and payment proofs.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, User, or Ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30">
            Filter
          </button>
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
                <th className="p-4">Payment Receipt</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
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
                      <a
                        href={ord.paymentReceipt}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline font-mono text-[10px] font-bold inline-flex items-center gap-1 uppercase"
                      >
                        <FileText className="w-3 h-3" /> View Receipt
                      </a>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px] uppercase">No File</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{ord.date}</td>
                  <td className="p-4">
                    <button className="px-4 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                      Review ›
                    </button>
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
