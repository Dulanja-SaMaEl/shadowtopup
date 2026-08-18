'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import PlayerVerificationForm from '@/components/PlayerVerificationForm';
import PackageSelector from '@/components/PackageSelector';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';
import { Package } from '@/types/database';
import { Gamepad2, Zap } from 'lucide-react';

const DIAMOND_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/point.png';
const WEEKLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/000/002/logo.png';
const WEEKLY_LITE_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/004/010/logo.png';
const MONTHLY_PASS_CDN = 'https://cdn-gop.garenanow.com/gop/app/0000/100/067/rebate/0000/081/041/logo.png';

const mockPackages: Package[] = [
  {
    id: 'pkg-weekly-pass',
    package_name: 'Weekly Membership Pass',
    package_type: 'weekly_pass',
    diamond_amount: 450,
    shell_cost: 210,
    normal_price: 650.00,
    silver_price: 600.00,
    gold_price: 550.00,
    badge: 'SPECIAL PASS',
    image_url: WEEKLY_PASS_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-weekly-lite-pass',
    package_name: 'Weekly Lite Pass',
    package_type: 'weekly_pass',
    diamond_amount: 120,
    shell_cost: 70,
    normal_price: 280.00,
    silver_price: 250.00,
    gold_price: 230.00,
    badge: 'NEW LITE PASS',
    image_url: WEEKLY_LITE_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-monthly-pass',
    package_name: 'Monthly Membership Pass',
    package_type: 'monthly_pass',
    diamond_amount: 2600,
    shell_cost: 1050,
    normal_price: 3200.00,
    silver_price: 3000.00,
    gold_price: 2800.00,
    badge: 'VIP BEST VALUE',
    image_url: MONTHLY_PASS_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-100-diamonds',
    package_name: '100 Diamonds',
    package_type: 'diamond',
    diamond_amount: 100,
    shell_cost: 100,
    normal_price: 350.00,
    silver_price: 320.00,
    gold_price: 300.00,
    badge: 'STARTER',
    image_url: DIAMOND_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-310-diamonds',
    package_name: '310 Diamonds',
    package_type: 'diamond',
    diamond_amount: 310,
    shell_cost: 300,
    normal_price: 1050.00,
    silver_price: 980.00,
    gold_price: 920.00,
    badge: 'POPULAR',
    image_url: DIAMOND_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-520-diamonds',
    package_name: '520 Diamonds',
    package_type: 'diamond',
    diamond_amount: 520,
    shell_cost: 500,
    normal_price: 1750.00,
    silver_price: 1620.00,
    gold_price: 1500.00,
    badge: undefined,
    image_url: DIAMOND_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-1060-diamonds',
    package_name: '1060 Diamonds',
    package_type: 'diamond',
    diamond_amount: 1060,
    shell_cost: 1000,
    normal_price: 3450.00,
    silver_price: 3200.00,
    gold_price: 3000.00,
    badge: 'HOT DEAL',
    image_url: DIAMOND_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-2180-diamonds',
    package_name: '2180 Diamonds',
    package_type: 'diamond',
    diamond_amount: 2180,
    shell_cost: 2000,
    normal_price: 6900.00,
    silver_price: 6400.00,
    gold_price: 6000.00,
    badge: undefined,
    image_url: DIAMOND_CDN,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pkg-5600-diamonds',
    package_name: '5600 Diamonds',
    package_type: 'diamond',
    diamond_amount: 5600,
    shell_cost: 5000,
    normal_price: 17500.00,
    silver_price: 16200.00,
    gold_price: 15000.00,
    badge: 'PRO VAULT',
    image_url: DIAMOND_CDN,
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
            Official Garena SG / MY Topup Storefront • Instant Shell Processing & Reseller Pricing (LKR)
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
