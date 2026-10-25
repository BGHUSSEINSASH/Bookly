'use client';

import { useState, type ReactNode } from 'react';

/** أكورديون بسلاسة grid-template-rows — بدون قفزات ارتفاع */
export function Accordion({
  title,
  children,
  className = '',
  icon,
  headerExtra,
}: {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  headerExtra?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`card p-5 ${className}`} data-open={open}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-3 text-start font-display text-[15px] font-bold text-[var(--text-strong)]"
      >
        <span className="min-w-0">{title}</span>
        <span className="flex shrink-0 items-center gap-2">
          {headerExtra}
          {icon ?? null}
        </span>
      </button>
      <div className="accordion" data-open={open}>
        <div>
          <div className="pt-3 text-sm leading-7 text-[var(--text-muted)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
