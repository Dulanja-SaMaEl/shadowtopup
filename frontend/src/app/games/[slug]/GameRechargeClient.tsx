'use client';

import { useState, useEffect } from 'react';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { Package, UserRole } from '@/types/database';
import { Gamepad2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';

const mockPackages: Package[] = OFFICIAL_GARENA_PACKAGES;

export default function GameRechargeClient({ slug }: { slug: string }) {
  const [verifiedPlayer, setVerifiedPlayer] = useState<{
    uid: string;
    nickname: string;
  } | null>(null);

  const [packagesList, setPackagesList] = useState<Package[]>(mockPackages);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);

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
  }, []);

  const gameTitle =
    slug === 'free-fire'
      ? 'Garena Free Fire (SG / MY)'
      : slug.toUpperCase().replace(/-/g, ' ');

  return (
    <div className="space-y-8">
      {/* Game Banner Header */}
      <div className="relative overflow-hidden bg-[#110e24] border border-purple-950/60 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
        {/* Subtle Cyber Grid */}
        <div className="absolute inset-0 cyber-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <div className="laser-line w-full absolute top-0 left-0" />

        <div className="relative z-10 w-14 h-14 rounded-lg bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
          <Gamepad2 className="w-7 h-7 text-cyan-300" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Singapore & Malaysia Servers</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{gameTitle}</h1>
          <p className="text-slate-300 text-xs leading-relaxed max-w-2xl">
            Direct player UID top-up portal. Enter your in-game player ID below to verify your nickname before selecting diamonds or membership passes.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Garena Dispatch (&lt;30s)
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
      />

      {/* Customer Reviews & Ratings */}
      <CustomerReviewsSection />
    </div>
  );
}
