'use client';

import { useState, useEffect } from 'react';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { Package } from '@/types/database';
import { Gamepad2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';

const mockPackages: Package[] = OFFICIAL_GARENA_PACKAGES;

export default function GameRechargeClient({ slug }: { slug: string }) {
  const [verifiedPlayer, setVerifiedPlayer] = useState<{
    uid: string;
    nickname: string;
  } | null>(null);

  const [packagesList, setPackagesList] = useState<Package[]>(mockPackages);

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
      <div className="bg-[#110e24] border border-slate-800 rounded-xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-14 h-14 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300 shrink-0">
          <Gamepad2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Singapore & Malaysia Servers
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{gameTitle}</h1>
          <p className="text-slate-400 text-xs leading-relaxed">
            Direct player UID top-up portal. Enter your in-game player ID below to verify your nickname before selecting diamonds or membership passes.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Automated Garena Dispatch (&lt;30s)
            </span>
            <span className="flex items-center gap-1 text-slate-300">
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
        verifiedPlayerUid={verifiedPlayer?.uid}
        verifiedPlayerNickname={verifiedPlayer?.nickname}
      />

      {/* Customer Reviews & Ratings */}
      <CustomerReviewsSection />
    </div>
  );
}
