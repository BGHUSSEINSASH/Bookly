'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * شريط أفقي بأزرار تمرير جانبية وحواف تتلاشى عند الطرفين.
 * يدعم RTL: التمرير "التالي" يتجه يسارًا (scrollLeft سالب في محركات الحديثة).
 */
export function Rail({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const pos = Math.abs(el.scrollLeft);
    setAtStart(pos <= 2);
    setAtEnd(max <= 2 || pos >= max - 2);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, [update]);

  const scrollStep = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: -dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={ref}
        onScroll={update}
        className={`rail-scroller no-scrollbar flex gap-5 overflow-x-auto pb-2 ${className}`}
      >
        {children}
      </div>

      {/* حواف متلاشية */}
      <div
        className="rail-edges pointer-events-none absolute inset-y-0 right-0 w-16 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to left, var(--bg-page), transparent)',
          opacity: atStart ? 0 : 1,
        }}
        aria-hidden
      />
      <div
        className="rail-edges pointer-events-none absolute inset-y-0 left-0 w-16 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(to right, var(--bg-page), transparent)',
          opacity: atEnd ? 0 : 1,
        }}
        aria-hidden
      />

      <button
        type="button"
        onClick={() => scrollStep(-1)}
        disabled={atEnd}
        aria-label="السابق"
        className="rail-nav-btn absolute top-1/2 right-[-14px] z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-body)] shadow-e2 hover:bg-[var(--bg-soft)] lg:grid"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => scrollStep(1)}
        disabled={atStart}
        aria-label="التالي"
        className="rail-nav-btn absolute top-1/2 left-[-14px] z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-body)] shadow-e2 hover:bg-[var(--bg-soft)] lg:grid"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
}
