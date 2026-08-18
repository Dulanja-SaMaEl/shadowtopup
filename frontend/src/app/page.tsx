import Link from 'next/link';
import {
  Zap,
  ShieldCheck,
  Award,
  ArrowRight,
  Gamepad2,
  Sparkles,
  Trophy,
  Flame,
  ChevronRight,
  CheckCircle2,
  Lock,
  Clock,
  Headphones,
  Star,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import CustomerReviewsSection from '@/components/CustomerReviewsSection';

const featuredGames = [
  {
    title: 'GARENA FREE FIRE ( SG / MY )',
    slug: 'free-fire',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
    badge: 'THIRD-PARTY TOPUP',
    discount: 'UP TO 15% OFF FOR RESELLERS',
    available: true,
  },
  {
    title: 'PUBG MOBILE',
    slug: 'pubg-mobile',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000',
    badge: 'COMING SOON',
    discount: 'UNDER DEVELOPMENT',
    available: false,
  },
  {
    title: 'MOBILE LEGENDS',
    slug: 'mobile-legends',
    category: 'MOBA',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000',
    badge: 'COMING SOON',
    discount: 'UNDER DEVELOPMENT',
    available: false,
  },
];

const rankBadges = [
  { name: 'SILVER', tier: '8% OFF', color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-400' },
  { name: 'GOLD', tier: '15% OFF', color: 'from-amber-500/20 to-yellow-600/30 border-amber-500/40 text-amber-400' },
  { name: 'DIAMOND', tier: '20% OFF', color: 'from-indigo-500/20 to-purple-600/30 border-purple-500/40 text-purple-300' },
  { name: 'HEROIC', tier: 'VIP ACCESS', color: 'from-red-500/20 to-rose-600/30 border-red-500/40 text-red-400' },
  { name: 'GRANDMASTER', tier: 'PARTNER TIER', color: 'from-emerald-500/20 to-teal-600/30 border-emerald-500/40 text-emerald-400' },
];

const platformFeatures = [
  {
    icon: Zap,
    title: 'FAST DISPATCH ENGINE',
    description: 'Automated digital redemption processing ensures your Free Fire top-ups arrive in under 30 seconds.',
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  },
  {
    icon: ShieldCheck,
    title: 'INSTANT UID VERIFICATION',
    description: 'Real-time player name verification prevents accidental top-ups to incorrect game accounts.',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    icon: Award,
    title: 'MULTI-TIER RESELLER DISCOUNTS',
    description: 'Earn higher margins as you grow. Silver and Gold resellers enjoy automated wholesale pricing.',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  {
    icon: Headphones,
    title: '24/7 GAMER SUPPORT',
    description: 'Dedicated support team ready to assist you via WhatsApp and live tickets anytime.',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
];

export default function HomePage() {
  return (
    <div className="space-y-20 pb-16">
      {/* Disclaimer Banner Top Header */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-2 px-4 text-center text-[11px] font-mono text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>ShadowTopUp is an independent third-party service and is not affiliated with or endorsed by Garena.</span>
      </div>

      {/* 1. Ultra Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 rounded-3xl bg-gradient-to-br from-[#141229] via-[#0c0a1a] to-[#120f26] border border-purple-950/40 p-6 sm:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider shadow-lg">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            INDEPENDENT GAMING TOPUP SERVICE
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
            INSTANT <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">FREE FIRE</span> DIAMONDS & PASSES
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-2xl">
            ShadowTopUp is an independent third-party top-up portal delivering Free Fire SG/MY diamonds and passes. Enjoy automated Player ID verification, low LKR prices, and reseller discounts.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/games/free-fire"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2 hover:scale-105"
            >
              <Zap className="w-4 h-4" /> RECHARGE DIAMONDS NOW
            </Link>

            <Link
              href="/admin/pricing-rules"
              className="px-8 py-4 rounded-2xl bg-[#141229] border border-purple-900/60 hover:bg-purple-950/40 text-purple-300 font-extrabold text-xs uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" /> RESELLER TIERS
            </Link>
          </div>

          {/* Quick Trust Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 font-mono border-t border-slate-800/80">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Fast Automated Delivery
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <ShieldCheck className="w-4 h-4" /> Real-Time Player UID Verification
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" /> Verified Customer Reviews
            </span>
          </div>
        </div>
      </section>

      {/* 2. Featured Games Storefront */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Gamepad2 className="w-4 h-4" /> TOPUP CATALOG
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wide mt-1">SUPPORTED GAMES</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredGames.map((game, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-[#141229] border transition-all flex flex-col justify-between space-y-6 ${
                game.available ? 'border-purple-500/50 hover:border-cyan-400 shadow-2xl hover:shadow-cyan-500/10' : 'border-slate-800 opacity-70'
              }`}
            >
              <div className="space-y-4">
                <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={game.image} alt={game.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                  <span
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider border ${
                      game.available
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {game.badge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold">
                    {game.category}
                  </span>
                  <h3 className="text-base font-black text-white uppercase tracking-wide mt-0.5">{game.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{game.discount}</p>
                </div>
              </div>

              <div>
                {game.available ? (
                  <Link
                    href={`/games/${game.slug}`}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30"
                  >
                    BUY DIAMONDS <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-500 font-bold rounded-xl text-xs uppercase tracking-wider cursor-not-allowed"
                  >
                    COMING SOON
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Why Choose ShadowTopUp Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">--- WHY SHADOWTOPUP ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            BUILT FOR <span className="text-cyan-400">GAMERS & RESELLERS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#141229] border border-purple-950/40 hover:border-purple-500/40 transition-all space-y-4 shadow-xl"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Wholesale Reseller Tiers Showcase */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest">--- PARTNER PROGRAM ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            WHOLESALE <span className="text-amber-400">RESELLER TIERS</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            Upgrade your reseller account to unlock automatic wholesale discounts across all Free Fire diamond packs.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {rankBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-b border text-center space-y-2 ${badge.color}`}
            >
              <Trophy className="w-6 h-6 mx-auto opacity-80" />
              <h4 className="font-black text-xs uppercase tracking-wider">{badge.name}</h4>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/40 text-[10px] font-mono font-bold uppercase">
                {badge.tier}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Customer Reviews Section Widget (Placed Bottom of Page, above Footer) */}
      <section className="max-w-6xl mx-auto px-4">
        <CustomerReviewsSection />
      </section>

      {/* 6. Trust Badges Footer Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#141229] to-cyan-950/60 border border-purple-900/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl" />

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            READY TO BOOST YOUR GAMING EXPERIENCE?
          </h2>
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300">
            Join thousands of active resellers and Free Fire players reloading diamonds at wholesale rates with instant UID verification.
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-300 font-mono pt-2">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Digital Topups
            </span>
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" /> 100% Verified Player Accounts
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Best Wholesale Reseller Rates
            </span>
          </div>

          <div className="pt-4">
            <Link
              href="/games/free-fire"
              className="inline-block px-10 py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-600/40 transition-all hover:scale-105"
            >
              GET STARTED NOW
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
