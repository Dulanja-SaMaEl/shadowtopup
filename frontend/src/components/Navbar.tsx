'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/types/database';
import { ShoppingCart, ShieldCheck, User, LogOut, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount } = useCart();

  useEffect(() => {
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
        } else {
          setProfile(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('active_session_email');
            localStorage.removeItem('active_session_role');
            localStorage.removeItem('active_session_name');
          }
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
    { name: 'Games', href: '/games' },
    { name: 'Reseller Program', href: '/reseller' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0918]/95 backdrop-blur-md border-b border-purple-950/40 text-white">
      {/* Top Neon Laser Edge Line */}
      <div className="laser-line w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tactical Live Status */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 py-1">
              <Image
                src="/logo.png"
                alt="Shadow Store - Gaming Top-Up Platform"
                width={170}
                height={48}
                className="h-9 w-auto object-contain"
                priority
              />
            </Link>

            {/* Tactical Live Ping Beacon */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 text-[10px] font-mono text-purple-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="tracking-wide">DISPATCH: LIVE</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-bold">&lt;30s</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 font-gaming">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs uppercase tracking-wider font-semibold transition-all relative py-1 ${
                    isActive
                      ? 'text-white font-bold after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[2px] after:bg-purple-500 after:shadow-[0_0_10px_rgba(168,85,247,0.8)]'
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
                className="text-xs font-semibold text-purple-300 bg-purple-950/50 border border-purple-700/60 px-3 py-1.5 rounded-lg hover:bg-purple-900/60 flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admin
              </Link>
            )}
          </nav>

          {/* Right Action Icons & Profile */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 rounded-lg bg-[#141029] border border-purple-950/60 text-slate-300 hover:text-white hover:border-purple-500/50 hover:shadow-[0_0_12px_rgba(168,85,247,0.25)] transition-all flex items-center justify-center"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-mono font-bold text-[9px] flex items-center justify-center shadow-[0_0_8px_rgba(225,29,72,0.8)]">
                  {totalCount}
                </span>
              )}
            </Link>

            {profile ? (
              <div className="flex items-center gap-2.5">
                {profile.role !== 'normal' && (
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                    profile.role === 'admin'
                      ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.2)]'
                      : profile.role === 'gold'
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                      : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                  }`}>
                    {profile.role === 'gold'
                      ? 'Elite Reseller'
                      : profile.role === 'silver'
                      ? 'Standard Reseller'
                      : profile.role === 'admin'
                      ? 'Admin'
                      : profile.role}
                  </span>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161230] hover:bg-[#1d183f] border border-purple-900/60 text-white text-xs font-semibold hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] transition-all font-gaming uppercase tracking-wider"
                >
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>Dashboard</span>
                </Link>

                <button
                  onClick={handleSignOut}
                  className="p-1.5 rounded-lg bg-[#141029] border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-900/50 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-gaming">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors uppercase tracking-wider"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all neon-glow-btn uppercase tracking-wider"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Cart, Dashboard & Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/cart"
              className="relative p-2 rounded-lg bg-[#141029] border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white font-mono font-bold text-[9px] flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Mobile Profile / Dashboard Shortcut */}
            <Link
              href={profile ? "/dashboard" : "/login"}
              className={`relative p-2 rounded-lg border flex items-center justify-center transition-all ${
                pathname === '/dashboard'
                  ? 'bg-purple-600/20 border-purple-500/60 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-[#141029] border-slate-800 text-slate-300 hover:text-white hover:border-purple-500/40'
              }`}
              title={profile ? `My Dashboard (${profile.name || 'Account'})` : "Sign In / Profile"}
              aria-label={profile ? "My Dashboard" : "Sign In"}
            >
              <User className="w-4 h-4" />
              {profile && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#141029] border border-slate-800 text-slate-300"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 space-y-1.5 bg-[#0e0c1f] border-b border-slate-800 font-gaming">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 uppercase tracking-wider"
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-purple-300 hover:bg-slate-900 uppercase tracking-wider"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Cart
            </span>
            {totalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono font-bold text-xs">
                {totalCount}
              </span>
            )}
          </Link>
          {profile?.role === 'admin' && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-300 bg-purple-950/40 border border-purple-900/50 uppercase tracking-wider"
            >
              Admin Control Panel
            </Link>
          )}
          {profile ? (
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-slate-900 uppercase tracking-wider"
              >
                Dashboard ({profile.name || 'Account'})
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 uppercase tracking-wider"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg bg-[#141029] border border-slate-800 text-slate-200 text-xs font-semibold uppercase tracking-wider"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold uppercase tracking-wider"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
