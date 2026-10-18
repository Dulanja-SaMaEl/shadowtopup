'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PagePreloader() {
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Skip preloader on admin dashboard pages
    if (pathname && pathname.startsWith('/admin')) {
      setIsDismissed(true);
      return;
    }

    // Reset states so preloader always plays
    setIsLoaded(false);
    setIsDismissed(false);

    // Lock body scrolling while preloader is active so background doesn't shift
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Full animation sequence:
    // 0.0s - 1.5s: Letters S-H-A-D-O-W flip in with neon glow
    // 1.5s - 3.6s: Hold full pulsing glow & display portal slogan
    // 3.6s: Trigger curtain split (0.85s smooth split)
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }, 3600);

    // 4.6s: Dismiss and unmount completely from DOM
    const dismissTimer = setTimeout(() => {
      setIsDismissed(true);
    }, 4600);

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
      clearTimeout(loadTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  // Do not render on admin pages or once dismissed
  if ((pathname && pathname.startsWith('/admin')) || isDismissed) {
    return null;
  }

  const letters = ['S', 'H', 'A', 'D', 'O', 'W'];

  return (
    <div
      id="preloader"
      className={`preloader ${isLoaded ? 'loaded' : ''}`}
      role="status"
      aria-label="Loading Shadow Top Up"
    >
      <div className="animation-preloader">
        <div className="spinner" />
        <div className="txt-loading">
          {letters.map((char, index) => (
            <span
              key={`${char}-${index}`}
              data-text-preloader={char}
              className="letters-loading"
            >
              {char}
            </span>
          ))}
        </div>
        <p className="text-center">Loading Experience</p>

        {/* Official Gaming Slogan */}
        <div className="mt-5 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/50 shadow-[0_0_15px_rgba(168,85,247,0.25)] backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-purple-200 tracking-wider uppercase font-mono">
              Sri Lanka&apos;s #1 Instant Gaming Store
            </span>
          </div>
        </div>
      </div>

      <div className="loader">
        <div className="row">
          <div className="loader-section section-left">
            <div className="bg" />
          </div>
          <div className="loader-section section-left">
            <div className="bg" />
          </div>
          <div className="loader-section section-right">
            <div className="bg" />
          </div>
          <div className="loader-section section-right">
            <div className="bg" />
          </div>
        </div>
      </div>
    </div>
  );
}


