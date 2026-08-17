'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'SELECT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.classList.contains('cursor-pointer'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
      setTimeout(() => {
        setIsClicked(false);
      }, 200);
    };

    // Smooth trailing ring lerp
    const loop = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.25,
        y: prev.y + (position.y - prev.y) * 0.25,
      }));
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [position.x, position.y]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden hidden md:block">
      {/* 1. Core Pointer Glow Dot */}
      <div
        className={`fixed top-0 left-0 w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_12px_#00f0ff] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isClicked ? 'scale-150 bg-red-500 shadow-[0_0_16px_#ff0055]' : isHovered ? 'scale-125 bg-fuchsia-400 shadow-[0_0_14px_#e056fd]' : 'scale-100'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />

      {/* 2. Smooth Cyber Outer Ring */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-cyan-400/60 shadow-[0_0_15px_rgba(0,240,255,0.4)] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out ${
          isHovered
            ? 'w-12 h-12 border-fuchsia-400 bg-fuchsia-500/10 shadow-[0_0_25px_rgba(224,86,253,0.6)] scale-110'
            : isClicked
            ? 'w-8 h-8 border-red-500 bg-red-500/20 scale-90'
            : 'w-8 h-8'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      />

      {/* 3. Click Ripple Shockwave Effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed top-0 left-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-400 animate-ping opacity-75 pointer-events-none"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
          }}
        />
      ))}
    </div>
  );
}
