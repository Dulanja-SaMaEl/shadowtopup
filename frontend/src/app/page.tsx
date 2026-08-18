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
} from 'lucide-react';

const featuredGames = [
  {
    title: 'GARENA FREE FIRE ( SG / MY )',
    slug: 'free-fire',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
    badge: 'AUTOMATED SHELL TOPUP',
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
    title: 'AUTOMATED SHELL ENGINE',
    description: 'Direct integration with Garena Shell API ensures your Free Fire top-ups arrive in under 30 seconds.',
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

export default function Home() {
  return (
    <div className="space-y-24 pb-20 bg-[#0a0814]">
      {/* 1. Epic Hero Section */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden border-b border-purple-950/40">
        {/* Animated Neon Ambient Backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-purple-900/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 text-center space-y-8 pt-12 z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-black uppercase tracking-widest backdrop-blur-md animate-pulse">
            <Flame className="w-4 h-4 fill-red-400" /> YOUR ULTIMATE LIVE GAMING MODULE
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-none drop-shadow-2xl">
            INSTANT <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-purple-400 to-cyan-400">FREE FIRE</span> DIAMOND REFILL
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed drop-shadow">
            ShadowTopUp delivers instant Free Fire diamond reloads via Garena Shell API automation. Real-time player UID verification, transparent reseller wholesale margins, and 24/7 service.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/games/free-fire"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-purple-600 to-cyan-600 hover:from-red-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-600/40 hover:scale-105 transition-all flex items-center justify-center gap-2 group"
            >
              TOPUP FREE FIRE NOW <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/games"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-purple-950 text-slate-200 font-bold text-xs uppercase tracking-widest backdrop-blur-md transition-all flex items-center justify-center gap-2"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400" /> BROWSE CATALOG
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-emerald-400">&lt; 30s</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">AVG REFILL SPEED</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-cyan-400">100%</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">UID VERIFIED</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-purple-400">99.9%</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">AUTOMATION RATE</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-amber-400">1,200+</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">ACTIVE RESELLERS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cyber Esports Rank Badges Row */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {rankBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-b ${badge.color} border backdrop-blur-md flex flex-col items-center justify-center text-center space-y-1.5 group hover:scale-105 transition-all cursor-pointer`}
            >
              <Award className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">{badge.name} TIER</span>
              <span className="text-[9px] font-mono text-slate-300 bg-slate-950/60 px-2 py-0.5 rounded-full border border-slate-800">
                {badge.tier}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SELECT YOUR GAME Section */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest">--- POPULAR CATALOG ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            SELECT YOUR <span className="text-purple-400">GAME</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGames.map((game) => {
            if (game.available) {
              return (
                <Link
                  key={game.slug}
                  href={`/games/${game.slug}`}
                  className="group relative rounded-3xl bg-[#141229] border border-purple-950/40 hover:border-purple-500/60 overflow-hidden transition-all hover:-translate-y-2 shadow-2xl"
                >
                  <div className="h-60 bg-slate-900 relative overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {game.badge}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-red-600/80 text-white font-mono text-[9px] font-bold uppercase tracking-wider w-fit shadow-md">
                        {game.discount}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase group-hover:text-purple-300 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono font-bold uppercase">{game.category}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={game.slug}
                className="relative rounded-3xl bg-[#141229]/60 border border-slate-800/80 overflow-hidden opacity-75 select-none"
              >
                <div className="h-60 bg-slate-900 relative overflow-hidden grayscale">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> COMING SOON
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 font-mono text-[9px] font-bold uppercase tracking-wider w-fit">
                      UNDER DEVELOPMENT
                    </span>
                  </div>
                </div>

                <div className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-slate-300 uppercase">
                      {game.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">{game.category}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Why Choose ShadowTopUp Feature Grid */}
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

      {/* 5. Trust Badges Footer Banner */}
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
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instant Automatic Topups
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
