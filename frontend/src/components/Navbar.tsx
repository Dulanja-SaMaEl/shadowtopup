'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ShoppingCart, ShieldCheck, User, LogOut, Zap, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 1. Sync with localStorage first
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('active_session_email');
      const storedRole = localStorage.getItem('active_session_role') as any;
      const storedName = localStorage.getItem('active_session_name');

      if (storedEmail) {
        setProfile({
          id: 'active-session',
          email: storedEmail,
          name: storedName || storedEmail.split('@')[0].toUpperCase(),
          role: storedRole || 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile);
      }
    }

    // 2. Sync with Supabase Auth
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data) setProfile(data as Profile);
        }
      } catch (err) {
        console.error('Navbar user load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('active_session_email');
      localStorage.removeItem('active_session_role');
      localStorage.removeItem('active_session_name');
    }
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Signout error:', err);
    }
    window.location.href = '/login';
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Games Catalog', href: '/games' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0814]/90 backdrop-blur-md border-b border-purple-950/40 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                SHADOW<span className="text-cyan-400">TOPUP</span>
              </span>
              <span className="block text-[10px] text-cyan-400/80 font-mono tracking-widest uppercase -mt-1">
                Instant Game Refill
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {profile?.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="text-xs font-bold text-purple-400 bg-purple-950/60 border border-purple-800/80 px-3 py-1.5 rounded-xl hover:bg-purple-900 flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </Link>

            {profile ? (
              <div className="flex items-center gap-3">
                {/* Reseller Badge */}
                {profile.role !== 'normal' && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    profile.role === 'admin'
                      ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400'
                      : profile.role === 'gold'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                  }`}>
                    {profile.role}
                  </span>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 hover:from-red-500 hover:to-rose-500 transition-all"
                >
                  <User className="w-4 h-4" />
                  <span>DASHBOARD</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-slate-950 border-b border-slate-800">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-slate-900"
            >
              {link.name}
            </Link>
          ))}
          {profile?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-bold text-purple-400 bg-purple-950/60"
            >
              Admin Control Panel
            </Link>
          )}
          {profile ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-cyan-400 hover:bg-slate-900"
              >
                Dashboard ({profile.name})
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
