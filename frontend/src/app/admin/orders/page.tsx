'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, X, Clock } from 'lucide-react';

const mockOrders = [
  {
    id: 'ord-001',
    user_name: 'Alex Reseller',
    package_name: '520 Diamonds',
    player_uid: '984512034',
    amount: 1620.00,
    payment_method: 'bank_transfer',
    receipt_url: 'https://i.ibb.co/sample-receipt.jpg',
    status: 'pending',
    date: new Date().toLocaleDateString(),
  },
  {
    id: 'ord-002',
    user_name: 'Gamer 123',
    package_name: '100 Diamonds',
    player_uid: '124958102',
    amount: 360.00,
    payment_method: 'paypal',
    receipt_url: null,
    status: 'success',
    date: new Date().toLocaleDateString(),
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Bank Receipt & Order Verification</h1>
        <p className="text-xs text-slate-400 mt-1">Verify bank transfer receipts uploaded via ImgBB and fulfill orders.</p>
      </div>

      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Package</th>
                <th className="p-4">Player UID</th>
                <th className="p-4">Amount (Rs.)</th>
                <th className="p-4">Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-900/40">
                  <td className="p-4 font-bold text-white">{ord.user_name}</td>
                  <td className="p-4 text-purple-300 font-semibold">{ord.package_name}</td>
                  <td className="p-4 font-mono text-cyan-400">{ord.player_uid}</td>
                  <td className="p-4 font-bold text-emerald-400">Rs. {ord.amount.toFixed(2)}</td>
                  <td className="p-4">
                    {ord.receipt_url ? (
                      <a
                        href={ord.receipt_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:underline font-mono inline-flex items-center gap-1 font-bold"
                      >
                        View Receipt <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500 italic">PayPal Auto</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold ${
                      ord.status === 'success'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : ord.status === 'failed'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    {ord.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'success')}
                          className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'failed')}
                          className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold"
                        >
                          Reject
                        </button>
                      </>
                    )}
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
