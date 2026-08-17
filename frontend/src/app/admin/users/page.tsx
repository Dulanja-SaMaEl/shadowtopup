'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Award } from 'lucide-react';

const mockUsers = [
  { id: 'usr-1', name: 'Dulanja Abeysinghe', email: 'dulanja@example.com', role: 'admin' },
  { id: 'usr-2', name: 'Silver Merchant', email: 'silver@reseller.com', role: 'silver' },
  { id: 'usr-3', name: 'Gold Wholesaler', email: 'gold@reseller.com', role: 'gold' },
  { id: 'usr-4', name: 'Casual Gamer', email: 'gamer@gmail.com', role: 'normal' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers);

  const handleRoleChange = (userId: string, newRole: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/dashboard" className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Directory & Role Control</h1>
          <p className="text-xs text-slate-400">Manage user accounts and assign reseller pricing tiers</p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-mono uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Current Role</th>
                <th className="p-4">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-950/50">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    {usr.name}
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-xs">{usr.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      usr.role === 'admin'
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        : usr.role === 'gold'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : usr.role === 'silver'
                        ? 'bg-slate-400/10 text-slate-300 border border-slate-400/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {usr.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={usr.role}
                      onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="silver">Silver Reseller</option>
                      <option value="gold">Gold Reseller</option>
                      <option value="admin">Admin</option>
                    </select>
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
