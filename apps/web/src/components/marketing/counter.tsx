'use client';

import { useEffect, useRef, useState } from 'react';

/** عدّاد أرقام — يبدأ عند الظهور، يحترم تقليل الحركة، بease-out ناعم */
export function Counter({
  to,
  decimals = 0,
  suffix = '',
  duration = 1300,
}: {
  to: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const step = (t: number) => {
          if (!start) start = t;
          const p = Math.min(1, (t - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(to * eased);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  const text =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('ar-IQ');

  return (
    <span ref={ref} className="tabular-nums">
      {text}
      {suffix}
    </span>
  );
}
