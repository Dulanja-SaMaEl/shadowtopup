'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  ShoppingBag,
  Gamepad2,
  Package,
  Award,
  Users,
  Database,
  Sliders,
  Receipt,
  ExternalLink,
  LogOut,
  Zap,
  Menu,
  X,
  Wallet,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('admin@shadowstore.com');
  const [status, setStatus] = useState({ server: 'online', db: 'online', api: 'online' });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'admin@shadowstore.com');
          const { data: prof } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', user.id)
            .single();
          if (prof?.name) setUserName(prof.name);
        }
      } catch (err) {
        console.error('Error loading admin profile:', err);
      }
    }
    loadUser();

    async function checkHealth() {
      try {
        const res = await fetch('/api/admin/health');
        if (res.ok) {
          const json = await res.json();
          if (json.services) {
            setStatus({
              server: json.services.database?.status === 'online' ? 'online' : 'offline',
              db: json.services.database?.status === 'online' ? 'online' : 'offline',
              api: json.services.renderScraper?.status === 'online' || json.services.renderScraper?.status === 'standby' ? 'online' : 'offline',
            });
          }
        }
      } catch {}
    }
    checkHealth();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const navGroups = [
    {
      title: 'CORE OVERVIEW',
      items: [
        { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
        { label: 'Games', href: '/admin/games', icon: Gamepad2 },
        { label: 'Products', href: '/admin/products', icon: Package },
        { label: 'Resellers', href: '/admin/resellers', icon: Award },
        { label: 'Users', href: '/admin/users', icon: Users },
      ],
    },
    {
      title: 'FREE FIRE TOP-UP',
      items: [
        { label: 'Shell Accounts', href: '/admin/shell-accounts', icon: Database },
        { label: 'Packages', href: '/admin/packages', icon: Package },
        { label: 'Pricing Rules', href: '/admin/pricing-rules', icon: Sliders },
        { label: 'Transactions', href: '/admin/transactions', icon: Receipt },
        { label: 'Shadow Wallet', href: '/admin/wallet', icon: Wallet },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Logo Brand */}
        <div className="p-6 flex items-center justify-between border-b border-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase">Shadow<span className="text-cyan-400">Store</span></h2>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Admin Control Hub</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {group.title}
              </span>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-950/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* User Card & Sign Out */}
      <div className="p-4 border-t border-purple-950/30 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{userName}</h4>
            <p className="text-[10px] font-mono text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-2.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-900/50 text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0a14] text-slate-100 flex font-sans">
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-64 bg-[#121024] border-r border-purple-950/40 flex-col justify-between shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-[#121024] border-r border-purple-950/40 z-10 flex flex-col h-full">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#121024]/80 backdrop-blur-md border-b border-purple-950/30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>Admin</span>
              <span>›</span>
              <span className="text-slate-200 uppercase font-mono font-bold truncate max-w-[120px] sm:max-w-none">
                {pathname.replace('/admin/', '').replaceAll('-', ' ')}
              </span>
            </div>
          </div>

          {/* Status Indicators & View Store */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Server: Online
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                DB: Online
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-3 sm:px-4 py-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/50 text-xs font-bold text-purple-300 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> <span className="hidden sm:inline">View Store</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
