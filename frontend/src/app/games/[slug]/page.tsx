'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import { Package } from '@/types/database';
import { Gamepad2, ShieldCheck, Zap } from 'lucide-react';

const mockPackages: Package[] = [
  {
    id: 'pkg-100',
    package_name: '100 Diamonds',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 100,
    normal_price: 1.20,
    silver_price: 1.10,
    gold_price: 1.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-310',
    package_name: '310 Diamonds',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 300,
    normal_price: 3.50,
    silver_price: 3.25,
    gold_price: 3.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-520',
    package_name: '520 Diamonds',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 500,
    normal_price: 5.80,
    silver_price: 5.40,
    gold_price: 5.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-1060',
    package_name: '1060 Diamonds',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 1000,
    normal_price: 11.50,
    silver_price: 10.80,
    gold_price: 10.00,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function GameDetailPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'free-fire';

  const [verifiedPlayer, setVerifiedPlayer] = useState<{
    uid: string;
    nickname: string;
  } | null>(null);

  const gameTitle = slug === 'free-fire' ? 'Garena Free Fire ( SG / MY )' : slug.toUpperCase().replace('-', ' ');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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
            Verified UID top-ups processed instantly with tier reseller rates
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
        packages={mockPackages}
        verifiedPlayerUid={verifiedPlayer?.uid}
      />
    </div>
  );
}
