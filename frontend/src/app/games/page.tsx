import Link from 'next/link';
import { Gamepad2, Zap } from 'lucide-react';

const gamesList = [
  {
    title: 'Garena Free Fire',
    slug: 'free-fire',
    category: 'Battle Royale',
    status: 'Automated Shell Topup',
  },
  {
    title: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    category: 'MOBA',
    status: 'Direct UID Recharge',
  },
  {
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'Battle Royale',
    status: 'UC Voucher',
  },
  {
    title: 'Call of Duty: Mobile',
    slug: 'codm',
    category: 'FPS',
    status: 'CP Topup',
  },
];

export default function GamesCatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-white">Games Catalog</h1>
        <p className="text-slate-400 text-sm mt-1">Select a game to check available diamond packages and prices</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gamesList.map((game) => (
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
        ))}
      </div>
    </div>
  );
}
