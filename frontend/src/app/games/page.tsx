'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gamepad2, Zap, Clock, Lock, Sparkles } from 'lucide-react';

interface GameItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  image_path?: string | null;
  description?: string | null;
  is_active: boolean;
}

const fallbackGames: GameItem[] = [
  {
    id: '1',
    title: 'Garena Free Fire ( SG / MY )',
    slug: 'free-fire',
    category: 'Battle Royale',
    image_path: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000',
    description: 'Instant Garena Shell top-up for Free Fire diamonds with automated player UID verification.',
    is_active: true,
  },
  {
    id: '2',
    title: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    category: 'MOBA',
    image_path: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1000',
    description: 'Direct top-up for Mobile Legends Diamonds and Weekly Diamond Pass.',
    is_active: false,
  },
  {
    id: '3',
    title: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'Battle Royale',
    image_path: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1000',
    description: 'Instant Unknown Cash (UC) top-up via Character ID.',
    is_active: false,
  },
  {
    id: '4',
    title: 'Call of Duty: Mobile',
    slug: 'codm',
    category: 'FPS',
    image_path: null,
    description: 'Fast CP top-ups with instant UID delivery.',
    is_active: false,
  },
];

export default function GamesCatalogPage() {
  const [games, setGames] = useState<GameItem[]>(fallbackGames);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGamesCatalog() {
      try {
        const res = await fetch('/api/games');
        const data = await res.json();
        if (data.success && Array.isArray(data.games) && data.games.length > 0) {
          setGames(data.games);
        }
      } catch (err) {
        console.warn('Using fallback catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGamesCatalog();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" /> RECHARGE CATALOG
          </div>
          <h1 className="text-3xl font-extrabold text-white">Supported Games Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">
            Select an active game to check available diamond packages, pass bundles, and live reseller prices.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Automated Garena Shell Sync
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => {
          const isPlayable = game.is_active || game.slug === 'free-fire';

          if (isPlayable) {
            return (
              <Link
                key={game.slug}
                href={`/games/${game.slug}`}
                className="group rounded-3xl bg-[#141229] border border-purple-950/40 hover:border-cyan-500/50 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Game Image Banner */}
                  <div className="relative h-44 bg-[#0e0c1f] overflow-hidden border-b border-purple-950/30">
                    {game.image_path ? (
                      <img
                        src={game.image_path}
                        alt={game.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-cyan-400">
                        <Gamepad2 className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider">
                      ACTIVE TOPUP
                    </span>
                  </div>

                  <div className="p-6">
                    <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block mb-1">
                      {game.category}
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {game.title}
                    </h3>
                    {game.description && (
                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {game.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-cyan-400 font-mono flex items-center gap-1.5 font-bold">
                      <Zap className="w-3.5 h-3.5 fill-cyan-400" /> Instant Shell Processing
                    </span>
                  </div>
                </div>
              </Link>
            );
          }

          return (
            <div
              key={game.slug}
              className="relative rounded-3xl bg-[#141229]/50 border border-slate-800/60 opacity-75 flex flex-col justify-between select-none overflow-hidden"
            >
              {/* Image Banner */}
              <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800/60 grayscale opacity-60">
                {game.image_path ? (
                  <img
                    src={game.image_path}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-600">
                    <Lock className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141229] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/10 backdrop-blur-sm border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> COMING SOON
                </div>
              </div>

              <div className="p-6">
                <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                  {game.category}
                </span>
                <h3 className="text-lg font-bold text-slate-400">
                  {game.title}
                </h3>
                {game.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {game.description}
                  </p>
                )}
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-slate-800/40 flex items-center justify-between">
                  <span className="text-xs text-amber-400/80 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Under Development
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
