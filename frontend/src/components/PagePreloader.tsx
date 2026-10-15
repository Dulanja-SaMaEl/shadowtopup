'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PagePreloader() {
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only display on arrival at the home route ('/') if not already seen in this session
    if (pathname === '/') {
      if (typeof window !== 'undefined') {
        const hasSeen = sessionStorage.getItem('shadow_preloader_seen');
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (hasSeen || prefersReducedMotion) {
          setIsDismissed(true);
          setShouldRender(false);
          return;
        }

        try {
          sessionStorage.setItem('shadow_preloader_seen', 'true');
        } catch {
          // sessionStorage may fail in private browsing; ignore
        }
      }

      setIsDismissed(false);
      setIsLoaded(false);
      setShouldRender(true);

      // Fast, snappy sequence: letters load in ~450ms, curtain splits and unmasks at ~900ms
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 450);

      const dismissTimer = setTimeout(() => {
        setIsDismissed(true);
        setShouldRender(false);
      }, 950);

      return () => {
        clearTimeout(loadTimer);
        clearTimeout(dismissTimer);
      };
    } else {
      setIsDismissed(true);
      setShouldRender(false);
    }
  }, [pathname]);

  if (!shouldRender || isDismissed) {
    return null;
  }

  const letters = ['S', 'H', 'A', 'D', 'O', 'W'];

  return (
    <div
      id="preloader"
      className={`preloader ${isLoaded ? 'loaded' : ''}`}
      onClick={() => setIsDismissed(true)}
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

