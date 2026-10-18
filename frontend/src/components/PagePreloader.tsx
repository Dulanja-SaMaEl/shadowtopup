'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Phone, MessageCircle } from 'lucide-react';

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
    // 1.5s - 3.6s: Hold full pulsing glow & display developer hotline
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

        {/* Developer WhatsApp Contact Badge */}
        <div className="mt-7 flex flex-col items-center gap-2">
          <a
            href="https://wa.me/94765917189?text=Hello%20Developer,%20contacting%20from%20Shadow%20Top%20Up%20portal"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:border-emerald-400 hover:text-emerald-300 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] backdrop-blur-md cursor-pointer"
            title="Chat directly with Developer on WhatsApp"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Developer Hotline: <strong className="text-white group-hover:text-emerald-300 font-mono tracking-wide">076 591 7189</strong></span>
          </a>
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


