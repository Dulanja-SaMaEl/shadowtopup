'use client';

import { useState, useEffect } from 'react';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { Package, UserRole } from '@/types/database';
import { Gamepad2, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';

const mockPackages: Package[] = OFFICIAL_GARENA_PACKAGES;

export default function GameRechargeClient({ slug }: { slug: string }) {
  const [verifiedPlayer, setVerifiedPlayer] = useState<{
    uid: string;
    nickname: string;
  } | null>(null);

  const [packagesList, setPackagesList] = useState<Package[]>(mockPackages);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [restockAlert, setRestockAlert] = useState<{
    enabled: boolean;
    message: string;
    gameSlug?: string;
  } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        if (typeof window !== 'undefined') {
          const savedRole = localStorage.getItem('active_session_role') as UserRole | null;
          if (savedRole) setUserRole(savedRole);
        }
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();
          if (profile?.role) {
            setUserRole(profile.role as UserRole);
            if (typeof window !== 'undefined') {
              localStorage.setItem('active_session_role', profile.role);
            }
          }
        }
      } catch (err) {
        // Fallback to saved
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function fetchDbPackages() {
      try {
        const res = await fetch('/api/packages');
        const data = await res.json();
        if (data.success && data.packages && data.packages.length > 0) {
          setPackagesList(data.packages as Package[]);
        }
      } catch (e) {
        // Use fallback package list
      }
    }
    fetchDbPackages();

    async function fetchRestockAlert() {
      try {
        const res = await fetch('/api/restock-alert');
        const data = await res.json();
        if (data.success && data.restockAlert) {
          setRestockAlert(data.restockAlert);
        }
      } catch {
        // Restock alert fetch fallback
      }
    }
    fetchRestockAlert();
  }, []);

  const gameTitle =
    slug === 'free-fire'
      ? 'Garena Free Fire (SG / MY)'
      : slug.toUpperCase().replace(/-/g, ' ');

  const isRestocking = Boolean(restockAlert?.enabled && (restockAlert?.gameSlug === 'free-fire' || slug === 'free-fire'));

  return (
    <div className="space-y-8">
      {/* Restock Warning Banner (if enabled by admin) */}
      {isRestocking && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#181328] to-amber-950/40 border border-amber-500/50 text-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.25)] flex items-center gap-3.5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                Notice
              </span>
              <span className="text-xs font-mono text-amber-300 font-bold">Inventory Restock In Progress</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
              {restockAlert?.message || 'Free Fire SG/MY Is Currently Restocking! Please Check again Later!'}
            </p>
          </div>
        </div>
      )}

      {/* Game Banner Header */}
      <div className="relative overflow-hidden bg-[#110e24] border border-purple-950/60 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <div className="laser-line w-full absolute top-0 left-0" />

        {/* Game Icon Box: Displays official Free Fire logo/icon */}
        <div className="relative z-10 w-16 h-16 rounded-xl bg-[#161230] border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_18px_rgba(168,85,247,0.35)] shrink-0 overflow-hidden group">
          {slug === 'free-fire' ? (
            <img
              src="/images/free-fire-icon.png"
              alt="Free Fire"
              className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Gamepad2 className="w-8 h-8 text-cyan-300" />
          )}
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
              Singapore & Malaysia Servers
            </span>

            {/* Restock Warning Badge next to server badge */}
            {isRestocking && (
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span>Restocking</span>
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{gameTitle}</h1>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Direct player UID top-up portal. Enter your in-game player ID below to verify your nickname before selecting diamonds or memberships.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fast Delivery (&lt;30s)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Live Nickname Verification
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Verification Form */}
      <PlayerVerificationForm
        gameSlug={slug}
        onVerified={(player) => setVerifiedPlayer(player)}
      />

      {/* Step 2: Package Selection & Checkout */}
      <PackageSelector
        packages={packagesList}
        userRole={userRole}
        verifiedPlayerUid={verifiedPlayer?.uid}
        verifiedPlayerNickname={verifiedPlayer?.nickname}
        isRestocking={isRestocking}
      />

      {/* Customer Reviews & Ratings */}
      <CustomerReviewsSection />
    </div>
  );
}
