import Link from 'next/link';
import { Zap, ShieldCheck, Award, ArrowRight, Gamepad2, Sparkles, Trophy, Flame, ChevronRight } from 'lucide-react';

const featuredGames = [
  {
    title: 'FREE FIRE',
    slug: 'free-fire',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
    badge: 'AUTOMATED SHELL TOPUP',
  },
  {
    title: 'PUBG MOBILE',
    slug: 'pubg-mobile',
    category: 'BATTLE ROYALE',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000',
    badge: 'INSTANT UC CODE',
  },
  {
    title: 'MOBILE LEGENDS',
    slug: 'mobile-legends',
    category: 'MOBA',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000',
    badge: 'WEEKLY PASS & DIAMONDS',
  },
];

const rankBadges = [
  { name: 'SILVER', color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-400' },
  { name: 'GOLD', color: 'from-amber-500/20 to-yellow-600/30 border-amber-500/40 text-amber-400' },
  { name: 'DIAMOND', color: 'from-indigo-500/20 to-purple-600/30 border-purple-500/40 text-purple-300' },
  { name: 'HEROIC', color: 'from-red-500/20 to-rose-600/30 border-red-500/40 text-red-400' },
  { name: 'GRANDMASTER', color: 'from-emerald-500/20 to-teal-600/30 border-emerald-500/40 text-emerald-400' },
];

export default function Home() {
  return (
    <div className="space-y-24 pb-20 bg-[#0a0814]">
      {/* 1. Hero Section matching screenshot 2 */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-purple-950/40">
        {/* Background Image / Ambient Neon Glow */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0814] via-[#0a0814]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-purple-900/10 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 text-center space-y-6 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono font-black uppercase tracking-widest">
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

          <div className="pt-4 flex justify-center">
            <Link
              href="/games"
              className="px-10 py-4 rounded-xl font-black bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white tracking-widest uppercase shadow-2xl shadow-red-600/40 transition-all hover:scale-105 text-sm flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" /> TOPUP NOW
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Cyber Esports Rank Badges Row */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {rankBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-gradient-to-b ${badge.color} border backdrop-blur-md flex flex-col items-center justify-center text-center space-y-2 group hover:scale-105 transition-all`}
            >
              <Award className="w-8 h-8 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest">{badge.name} TIER</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SELECT YOUR GAME Section matching screenshot 2 */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest">--- 01 ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            S<span className="text-purple-400">ELECT YOUR GAME</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group relative rounded-3xl bg-[#141229] border border-purple-950/40 hover:border-purple-500/60 overflow-hidden transition-all hover:-translate-y-2 shadow-2xl"
            >
              <div className="h-56 bg-slate-900 relative overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                    {game.badge}
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

      {/* 4. Trending Matches / Esports Cards (COMING SOON overlay) */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest">--- UPCOMING MATCHES ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            AGGRESSIVE & WAR-THEMED
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

      {/* 5. CHAMPIONS OF SHADOW Section matching screenshot 2 */}
      <section className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-widest">--- ESPORTS TEAMS ---</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            CHAMPIONS OF SHADOW
          </h2>
        </div>

        <div className="relative p-12 rounded-3xl bg-[#141229] border border-purple-950/40 overflow-hidden text-center">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 space-y-2">
            <span className="px-4 py-1.5 rounded-full bg-purple-600/20 border border-purple-500/40 text-purple-300 font-black text-xs uppercase tracking-widest animate-pulse">
              COMING SOON
            </span>
            <p className="text-xs font-mono text-slate-300 font-bold uppercase">
              OUR ESPORTS TEAMS FEATURE IS CURRENTLY UNDER DEVELOPMENT.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 opacity-20">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-purple-950/40 border border-purple-800/40" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
