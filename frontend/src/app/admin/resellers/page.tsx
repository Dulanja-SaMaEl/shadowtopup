'use client';

import { useState } from 'react';
import { Award, Clock, Star } from 'lucide-react';

export default function AdminResellersPage() {
  const [silverResellers] = useState([
    { id: '1', name: 'Dulanja Abeysinghe', email: 'dulanja150abeysinghe@gmail.com', expires: 'Jul 23, 2026' }
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Reseller Management</h1>
        <p className="text-xs text-slate-400 mt-1">Review reseller tier applications and manage active Silver/Gold subscriptions.</p>
      </div>

      {/* 1. Pending Tier Applications */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Pending Tier Applications
          </h3>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-amber-400">
            0 Requests
          </span>
        </div>

        <div className="py-8 text-center bg-[#0e0c1f] rounded-2xl border border-slate-800/40">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            No pending reseller applications at this time.
          </p>
        </div>
      </div>

      {/* 2. Gold Tier Resellers */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Gold Tier Resellers
        </h3>

        <div className="py-8 text-center bg-[#0e0c1f] rounded-2xl border border-slate-800/40">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            No active Gold tier resellers found.
          </p>
        </div>
      </div>

      {/* 3. Silver Tier Resellers */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-4">
        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Silver Tier Resellers
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Subscription Expires</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {silverResellers.map((r) => (
                <tr key={r.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div>
                      <h5 className="font-bold text-white text-xs">{r.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{r.email}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-cyan-400 text-xs">{r.expires}</td>
                  <td className="p-4">
                    <button className="px-4 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800/50 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                      Demote
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
