'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PagePreloader() {
  const pathname = usePathname();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Clear any legacy sessionStorage flags from earlier versions
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('shadow_preloader_seen');
      }
    } catch {
      // Ignore
    }

    // Skip preloader on admin dashboard pages
    if (pathname && pathname.startsWith('/admin')) {
      setIsDismissed(true);
      return;
    }

    // Lock body scrolling while preloader is active so background doesn't shift
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    // Check for user's prefers-reduced-motion accessibility setting
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        if (typeof document !== 'undefined') document.body.style.overflow = '';
        setIsDismissed(true);
        return;
      }
    }

    // Full animation sequence: letters S-H-A-D-O-W cascade in, hold full glow until ~3.2s
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
      if (typeof document !== 'undefined') document.body.style.overflow = '';
    }, 3200);

    // At 4.15s: 4-panel curtain split animation (0.9s duration) completes and unmasks
    const dismissTimer = setTimeout(() => {
      setIsDismissed(true);
    }, 4150);

    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = '';
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
      onClick={() => {
        if (typeof document !== 'undefined') document.body.style.overflow = '';
        setIsDismissed(true);
      }}
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
        <p className="text-center">Loading</p>
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

