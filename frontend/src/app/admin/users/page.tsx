'use client';

import { useState } from 'react';
import { Users, Search, Plus, Eye, Edit2, Ban } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [users] = useState([
    { id: '1', name: 'Admin User', email: 'admin_test@example.com', role: 'USER', status: 'ACTIVE', joined: 'Aug 11, 2026' },
    { id: '2', name: 'Dulanja Abeysinghe', email: 'dulanja150abeysinghe@gmail.com', role: 'SILVER', status: 'ACTIVE', joined: 'May 16, 2026' },
    { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', joined: 'May 11, 2026' },
    { id: '4', name: 'Test User', email: 'test@example.com', role: 'USER', status: 'ACTIVE', joined: 'May 11, 2026' },
    { id: '5', name: 'User Two', email: 'user2@demo.com', role: 'USER', status: 'ACTIVE', joined: 'May 11, 2026' },
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">User Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage platform accounts, security permissions, and customer ban status.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Name or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30">
            Search
          </button>

          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0c1f] text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-900/40">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">{u.name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : u.role === 'SILVER'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{u.joined}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20">
                      <Ban className="w-3.5 h-3.5" />
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
