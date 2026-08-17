'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

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

    const handleMouseDown = () => {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    };

    // Smooth fluid trailing animation
    const loop = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.3,
        y: prev.y + (position.y - prev.y) * 0.3,
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
      {/* Sleek Core Glow Dot */}
      <div
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f0ff] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isClicked ? 'scale-150 bg-red-500 shadow-[0_0_14px_#ff0055]' : isHovered ? 'scale-125 bg-fuchsia-400 shadow-[0_0_12px_#e056fd]' : 'scale-100'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        }}
      />

      {/* Subtle Fluid Outer Ring (No clutter bubbles) */}
      <div
        className={`fixed top-0 left-0 rounded-full border border-cyan-400/40 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-out ${
          isHovered
            ? 'w-10 h-10 border-fuchsia-400/80 bg-fuchsia-500/10 shadow-[0_0_15px_rgba(224,86,253,0.3)] scale-110'
            : isClicked
            ? 'w-6 h-6 border-red-500/80 bg-red-500/10 scale-90'
            : 'w-7 h-7 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`,
        }}
      />
    </div>
  );
}
