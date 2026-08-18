'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Zap } from 'lucide-react';

export default function PagePreloader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Trigger preloader on route changes
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setInitialLoad(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept click on internal links to show preloader instantly
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin)) {
        const url = new URL(target.href);
        if (url.pathname !== window.location.pathname) {
          setLoading(true);
        }
      }
    };

    window.addEventListener('click', handleLinkClick);
    return () => window.removeEventListener('click', handleLinkClick);
  }, []);

  if (!loading && !initialLoad) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-[#0a0814] flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-auto ${
        loading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Glow Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-cyan-500/10 to-transparent animate-pulse" />

      {/* Shadow Logo & Preloader Spinner */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Ring */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 animate-spin p-[3px] shadow-[0_0_30px_rgba(0,240,255,0.4)]">
            <div className="w-full h-full bg-[#0a0814] rounded-[21px]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-9 h-9 text-cyan-400 fill-cyan-400/20 animate-bounce" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-widest text-white uppercase font-mono">
            SHADOW<span className="text-cyan-400">STORE</span>
          </h2>
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              LOADING SECURE PORTAL...
            </span>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-48 h-1 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-red-500 animate-pulse w-full origin-left transform scale-x-100 transition-transform duration-300" />
        </div>
      </div>
    </div>
  );
}
