'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { usePresence } from '@/hooks/use-presence';

export function GalleryLightbox({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const { mounted, overlayClass, panelClass } = usePresence(open, 180);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIndex(0);
          setOpen(true);
        }}
        aria-label="فتح معرض الصور"
        className="group grid gap-2 sm:grid-cols-4 sm:grid-rows-2"
      >
        {images.slice(0, 5).map((img, i) => (
          <span
            key={i}
            className={`relative block overflow-hidden rounded-2xl bg-[var(--bg-soft)] ${
              i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
            }`}
          >
            <Image
              src={img}
              alt={`${title} — ${i + 1}`}
              fill
              sizes={i === 0 ? '(max-width: 1024px) 100vw, 50vw' : '25vw'}
              className="object-cover transition-transform duration-[600ms] ease-[var(--ease-standard)] group-hover:scale-[1.03]"
              priority={i === 0}
            />
            {i === 4 ? (
              <span className="pill pill-glass absolute bottom-3 left-3">
                <Images className="h-3 w-3" />
                {images.length} صور
              </span>
            ) : null}
          </span>
        ))}
      </button>

      {mounted ? (
        <div
          className={`fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4 ${overlayClass}`}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={close}
            aria-label="إغلاق"
            className="absolute top-4 left-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            onClick={prev}
            aria-label="الصورة السابقة"
            className="absolute right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            aria-label="الصورة التالية"
            className="absolute left-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div
            className={`relative h-[80vh] w-[min(92vw,1100px)] ${panelClass}`}
          >
            {/* مفتاح الصورة يُجبر إعادة تركيب next/image → crossfade عبر حركة الدخول */}
            <Image
              key={index}
              src={images[index]}
              alt={`${title} — ${index + 1}`}
              fill
              sizes="92vw"
              className="rounded-xl object-contain"
              style={{ animation: 'overlay-fade-in 260ms var(--ease-standard) both' }}
              priority
            />
          </div>

          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white ${panelClass}`}
          >
            {index + 1} / {images.length}
          </div>
        </div>
      ) : null}
    </>
  );
}
