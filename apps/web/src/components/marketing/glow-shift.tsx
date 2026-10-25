'use client';

import { useEffect } from 'react';

/** يحرّك --glow-shift مع التمرير — بارالاكس خفيف جدًا على توهج الهيرو */
export function GlowShift() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const root = document.documentElement;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 800);
        root.style.setProperty('--glow-shift', `${(y * 0.1).toFixed(1)}px`);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
      root.style.removeProperty('--glow-shift');
    };
  }, []);
  return null;
}
