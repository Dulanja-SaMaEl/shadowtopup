'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { Package } from '@/types/database';
import { Gamepad2, Zap } from 'lucide-react';

import { OFFICIAL_GARENA_PACKAGES } from '@/lib/garenaPackages';

const mockPackages: Package[] = OFFICIAL_GARENA_PACKAGES;

export default function GameDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'free-fire';

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
        console.log('Using fallback package list');
      }
    }
    fetchDbPackages();
  }, []);

  const gameTitle = slug === 'free-fire' ? 'Garena Free Fire ( SG / MY )' : slug.toUpperCase().replace('-', ' ');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Game Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 backdrop-blur-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-cyan-500/20">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 fill-cyan-400" /> Instant Shell Processing
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{gameTitle}</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Independent Free Fire ( SG / MY ) Topup Service • Instant Processing & Reseller Pricing (LKR)
          </p>
        </div>
      </div>

      {/* Step 1: Verification */}
      <PlayerVerificationForm
        gameSlug={slug}
        onVerified={(player) => setVerifiedPlayer(player)}
      />

      {/* Step 2: Package Selection */}
      <PackageSelector
        packages={packagesList}
        verifiedPlayerUid={verifiedPlayer?.uid}
      />

      {/* Customer Reviews & Rating Widget */}
      <CustomerReviewsSection />
    </div>
  );
}
