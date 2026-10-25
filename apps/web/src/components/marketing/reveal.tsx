'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

/**
 * كشف العنصر عند دخوله الشاشة — بإضافة is-visible مرة واحدة.
 * مشاهد IntersectionObserver مشترك لكل مكوّنات Reveal في الصفحة (بدل مراقب لكل عنصر).
 */
const sharedObserver =
  typeof window !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              sharedObserver.unobserve(e.target);
            }
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -36px 0px' },
      )
    : null;

export function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  variant = 'up',
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** ميلي-ثانية → مستوى تتابع d1..d5 (70ms للمستوى) */
  delay?: number;
  /** up: من الأسفل (افتراضي) · side: أفقي واعٍ باتجاه RTL */
  variant?: 'up' | 'side';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !sharedObserver) return;

    // العناصر الظاهرة منذ البداية (أعلى الصفحة): اعرض ثم كشف في الإطار التالي
    // حتى يعمل التتابع (cascade) عند تحميل الصفحة بدل ظهور فوري مسطّح
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('is-visible'));
      });
      return () => cancelAnimationFrame(id);
    }
    sharedObserver.observe(el);
    return () => sharedObserver.unobserve(el);
  }, []);

  const level = delay > 0 ? Math.min(5, Math.max(1, Math.ceil(delay / 70))) : 0;
  const delayClass = level ? `reveal-d${level}` : '';
  const baseClass = variant === 'side' ? 'reveal-side' : 'reveal';

  return (
    <Tag ref={ref} className={`${baseClass} ${delayClass} ${className}`}>
      {children}
    </Tag>
  );
}
