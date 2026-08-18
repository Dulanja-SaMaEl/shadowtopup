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
  },
  {
    title: 'PUBG MOBILE',
    slug: 'pubg-mobile',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000',
    badge: 'INSTANT UC CODE',
    discount: 'INSTANT DELIVERY',
  },
  {
    title: 'MOBILE LEGENDS',
    slug: 'mobile-legends',
    category: 'MOBA',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000',
    badge: 'WEEKLY PASS & DIAMONDS',
    discount: 'DIRECT IN-GAME TOPUP',
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
            FASTEST & SECURE
            <br />
            <span className="bg-gradient-to-r from-red-500 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              GAME TOPUP STORE
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-xs sm:text-sm font-mono tracking-wider leading-relaxed uppercase">
            GET YOUR GAME CREDITS INSTANTLY FOR FREE FIRE, PUBG, MOBILE LEGENDS AND MORE WITH THE MOST RELIABLE AUTOMATED & MANUAL BANK TRANSFER SYSTEM.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4 items-center">
            <Link
              href="/games"
              className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white tracking-widest uppercase shadow-2xl shadow-red-600/40 transition-all hover:scale-105 text-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" /> TOPUP NOW
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-slate-900/90 hover:bg-slate-800 text-slate-200 tracking-widest uppercase border border-slate-700/80 transition-all hover:scale-105 text-sm flex items-center justify-center gap-2"
            >
              <Award className="w-5 h-5 text-amber-400" /> BECOME A RESELLER
            </Link>
          </div>

          {/* Live Metrics Counter Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-white">50,000+</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">ORDERS COMPLETED</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-cyan-400">&lt; 30 SEC</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">AVG DELIVERY TIME</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#141229]/80 border border-purple-950/60 backdrop-blur-md">
              <span className="block text-2xl font-black text-emerald-400">99.9%</span>
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
          {featuredGames.map((game) => (
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
          ))}
        </div>
      </section>

      {/* 4. Why Choose ShadowTopUp Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-widest">--- WHY SHADOWTOPUP ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            THE MOST RELIABLE <span className="text-cyan-400">GAMING PLATFORM</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platformFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-[#141229] border border-purple-950/40 hover:border-purple-500/40 transition-all space-y-4"
            >
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feat.color}`}>
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">{feat.title}</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Trending Esports Tournaments (COMING SOON) */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-fuchsia-400 uppercase tracking-widest">--- ESPORTS TOURNAMENTS ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            TRENDING MATCHES & ARENA
          </h2>
        </div>

        <div className="relative p-8 rounded-3xl bg-[#141229] border border-purple-950/40 overflow-hidden text-center space-y-6">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-2">
            <span className="px-4 py-1.5 rounded-full bg-fuchsia-600/20 border border-fuchsia-500/40 text-fuchsia-400 font-black text-xs uppercase tracking-widest animate-pulse">
              COMING SOON
            </span>
            <p className="text-xs font-mono text-slate-300 font-bold uppercase">
              OUR TRENDING MATCHES FEATURE IS CURRENTLY UNDER DEVELOPMENT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-30">
            <div className="p-6 rounded-2xl bg-[#0e0c1f] border border-slate-800 text-left">
              <h4 className="font-bold text-white text-sm uppercase">SHADOW CUP SEASON 1</h4>
              <p className="text-xs text-slate-400 font-mono">PRIZE POOL: LKR 150,000</p>
            </div>
            <div className="p-6 rounded-2xl bg-[#0e0c1f] border border-slate-800 text-left">
              <h4 className="font-bold text-white text-sm uppercase">FREE FIRE PRO SHOWDOWN</h4>
              <p className="text-xs text-slate-400 font-mono">PRIZE POOL: LKR 200,000</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
