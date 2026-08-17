'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, Search, Plus, Eye, Edit2, Ban, X } from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<UserItem[]>([
    { id: '1', name: 'Admin User', email: 'admin_test@example.com', role: 'USER', status: 'ACTIVE', joined: 'Aug 11, 2026' },
    { id: '2', name: 'Dulanja Abeysinghe', email: 'dulanja150abeysinghe@gmail.com', role: 'SILVER', status: 'ACTIVE', joined: 'May 16, 2026' },
    { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', joined: 'May 11, 2026' },
    { id: '4', name: 'Test User', email: 'test@example.com', role: 'USER', status: 'ACTIVE', joined: 'May 11, 2026' },
    { id: '5', name: 'User Two', email: 'user2@demo.com', role: 'USER', status: 'ACTIVE', joined: 'May 11, 2026' },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase.from('profiles').select('*');
      if (data && data.length > 0) {
        setUsers(
          data.map((u) => ({
            id: u.id,
            name: u.name || 'User Account',
            email: u.email || 'user@demo.com',
            role: (u.role || 'USER').toUpperCase(),
            status: u.is_banned ? 'BANNED' : 'ACTIVE',
            joined: new Date(u.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          }))
        );
      }
    }
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const newUser: UserItem = {
      id: Date.now().toString(),
      name,
      email,
      role: role.toUpperCase(),
      status: 'ACTIVE',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setSaving(false);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSaving(true);

    const updated = {
      role: role.toUpperCase(),
    };

    await supabase.from('profiles').update({ role: role.toLowerCase() }).eq('id', selectedUser.id);
    setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...updated } : u)));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    setSaving(false);
  };

  const handleToggleBan = async (userItem: UserItem) => {
    const newStatus = userItem.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
    const isBanned = newStatus === 'BANNED';

    await supabase.from('profiles').update({ is_banned: isBanned }).eq('id', userItem.id);
    setUsers(users.map((u) => (u.id === userItem.id ? { ...u, status: newStatus } : u)));
  };

  const openEditModal = (u: UserItem) => {
    setSelectedUser(u);
    setRole(u.role);
    setIsEditModalOpen(true);
  };

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
              className="w-full pl-9 pr-4 py-2 bg-[#121024] border border-purple-950/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={() => {
              setName('New Customer');
              setEmail('newuser@example.com');
              setRole('USER');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-600/30 whitespace-nowrap"
          >
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
              {filteredUsers.map((u) => (
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
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[10px]">{u.joined}</td>
                  <td className="p-4 flex items-center gap-2">
                    <button
                      onClick={() => alert(`User Details:\nName: ${u.name}\nEmail: ${u.email}\nRole: ${u.role}`)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-2 rounded-xl bg-[#121024] border border-purple-950/60 text-purple-300 hover:text-white"
                      title="Edit User Role"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleBan(u)}
                      className={`p-2 rounded-xl border ${
                        u.status === 'ACTIVE'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                      }`}
                      title={u.status === 'ACTIVE' ? 'Ban User' : 'Unban User'}
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Add Platform User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="SILVER">SILVER RESELLER</option>
                  <option value="GOLD">GOLD RESELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Saving...' : 'Add User'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141229] border border-purple-950/80 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Edit User Role</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">User Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0e0c1f] border border-slate-800 rounded-xl text-white font-mono focus:outline-none"
                >
                  <option value="USER">USER</option>
                  <option value="SILVER">SILVER RESELLER</option>
                  <option value="GOLD">GOLD RESELLER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-wider"
              >
                {saving ? 'Updating...' : 'Update Role'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
