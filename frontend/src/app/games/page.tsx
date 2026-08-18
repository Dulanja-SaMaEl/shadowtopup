import Link from 'next/link';
import { Gamepad2, Zap, Clock, Lock } from 'lucide-react';

const gamesList = [
  {
    title: 'Garena Free Fire ( SG / MY )',
    slug: 'free-fire',
    category: 'Battle Royale',
    status: 'Automated Shell Topup',
    available: true,
  },
  {
    title: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    category: 'MOBA',
    status: 'COMING SOON',
    available: false,
  },
  {
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'Battle Royale',
    status: 'COMING SOON',
    available: false,
  },
  {
    title: 'Call of Duty: Mobile',
    slug: 'codm',
    category: 'FPS',
    status: 'COMING SOON',
    available: false,
  },
];

export default function GamesCatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white">Games Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">Select an active game to check available diamond packages and prices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gamesList.map((game) => {
          if (game.available) {
            return (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    {game.category}
                  </span>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {game.title}
                  </h3>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-cyan-400 font-mono flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-cyan-400" /> {game.status}
                  </span>
                </div>
              </Link>
            );
          }

          return (
            <div
              key={game.slug}
              className="relative p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 opacity-75 flex flex-col justify-between select-none"
            >
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" /> COMING SOON
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center text-slate-500 mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono uppercase text-slate-600 block mb-1">
                  {game.category}
                </span>
                <h3 className="text-lg font-bold text-slate-300">
                  {game.title}
                </h3>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/40 flex items-center justify-between">
                <span className="text-xs text-amber-400/80 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Under Development
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
