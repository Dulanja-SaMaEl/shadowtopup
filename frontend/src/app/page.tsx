import Link from 'next/link';
import { Zap, ShieldCheck, Award, ArrowRight, Gamepad2, Sparkles, CheckCircle } from 'lucide-react';

const featuredGames = [
  {
    title: 'Free Fire',
    slug: 'free-fire',
    category: 'Battle Royale',
    image: '/images/games/freefire.jpg',
    badge: 'Automated Shell Top-Up',
  },
  {
    title: 'Mobile Legends',
    slug: 'mobile-legends',
    category: 'MOBA',
    image: '/images/games/mlbb.jpg',
    badge: 'Instant Recharge',
  },
  {
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'Battle Royale',
    image: '/images/games/pubg.jpg',
    badge: 'Global Code',
  },
];

export default function Home() {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/30 via-slate-950 to-slate-950 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" /> Next-Gen Game Refill Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            INSTANT <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">GAME RECHARGE</span>
            <br />& RESELLER PORTAL
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg mb-8 leading-relaxed">
            Automated Garena Free Fire shell redemption, instant Player ID verification, and tiered bulk discounts for Silver & Gold resellers.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/games/free-fire"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all text-base"
            >
              <Zap className="w-5 h-5 fill-white" /> Top Up Free Fire Now
            </Link>
            <Link
              href="/games"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all text-base"
            >
              <Gamepad2 className="w-5 h-5 text-cyan-400" /> Explore All Games
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Popular Games</h2>
            <p className="text-slate-400 text-sm mt-1">Direct top-ups delivered to your game account in seconds</p>
          </div>
          <Link href="/games" className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm flex items-center gap-1">
            View All Games <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group relative rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 p-6 transition-all hover:-translate-y-1 shadow-xl overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {game.badge}
                </span>
                <span className="text-xs text-slate-500 font-mono">{game.category}</span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Gamepad2 className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                {game.title}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Instant Automatic Delivery
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Reseller Tiers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
          <div className="max-w-2xl">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider mb-4 inline-block">
              Reseller Program
            </span>
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Unlock Silver & Gold Reseller Rates
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Earn higher margins with tiered pricing discounts on Free Fire diamonds and game packages. Apply directly from your user dashboard.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                <Award className="w-4 h-4 text-amber-400" /> Gold Tier: Up to 15% Off
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
                <ShieldCheck className="w-4 h-4 text-slate-400" /> Silver Tier: Up to 8% Off
              </div>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all text-sm"
            >
              Apply for Reseller Account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
