'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) {
    // مخفي — يبقى mounted حتى تكتمل حركة الخروج ثم يُعطّل بالكامل
    return (
      <button
        disabled
        aria-hidden
        tabIndex={-1}
        className="pointer-events-none fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-[var(--brand)] text-white opacity-0 shadow-[var(--shadow-e3)] transition-[opacity,transform] duration-[220ms] ease-[var(--ease-exit)]"
      >
        <ArrowUp className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة إلى الأعلى"
      className="btt-enter fixed bottom-6 left-6 z-40 grid h-11 w-11 place-items-center rounded-full bg-[var(--brand)] text-white shadow-[var(--shadow-e3)] transition hover:-translate-y-0.5 hover:bg-[var(--brand-dark)]"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
