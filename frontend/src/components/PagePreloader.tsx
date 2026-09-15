'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PagePreloader() {
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Only display on arrival at the home route ('/')
    if (pathname === '/') {
      setIsDismissed(false);
      setIsLoaded(false);
      setShouldRender(true);

      // 1.5s letter sequence: letters S-H-A-D-O-W flip in with 0.2s stagger up to 1.0s
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 1500);

      // At 2.4s: curtain split animation (0.9s duration) has finished completely
      const dismissTimer = setTimeout(() => {
        setIsDismissed(true);
        setShouldRender(false);
      }, 2400);

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

