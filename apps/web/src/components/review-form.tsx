'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Star } from 'lucide-react';
import { api, tokenStore } from '@/lib/api';

export function ReviewForm({ propertyTitle }: { propertyTitle: string }) {
  const [bookingCode, setBookingCode] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const loggedIn = typeof window !== 'undefined' && !!tokenStore.get();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) {
      setError('أدخل رقم الحجز أولًا');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post('/reviews', {
        bookingCode: bookingCode.trim(),
        rating,
        comment: comment.trim() || undefined,
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر إرسال التقييم');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card grid place-items-center p-8 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-soft)]">
          <Star className="h-6 w-6 fill-[var(--brass)] text-[var(--brass)]" />
        </span>
        <p className="mt-3 font-display text-base font-bold text-[var(--text-strong)]">
          شكرًا لتقييمك
        </p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          سيظهر تقييمك بعد المراجعة
        </p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <p className="text-sm text-[var(--text-body)]">
          حجزت هذا العقار؟ شاركنا تقييمك لمساعدة الآخرين
        </p>
        <Link href="/login" className="btn btn-soft">
          سجّل الدخول للتقييم
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <h3 className="font-display text-base font-bold text-[var(--text-strong)]">
        أضف تقييمك لـ «{propertyTitle}»
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">رقم الحجز</label>
          <input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value)}
            placeholder="BK-XXXXXX"
            className="input"
          />
        </div>
        <div>
          <label className="label">تقييمك</label>
          <div className="mt-1 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} نجوم`}
                onClick={() => setRating(n)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border-subtle)] transition hover:border-[var(--brand)]"
              >
                <Star
                  className={`h-4 w-4 ${
                    n <= rating ? 'fill-[var(--brass)] text-[var(--brass)]' : 'text-[var(--ink-200)]'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className="label">تعليقك (اختياري)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="كيف كانت التجربة؟ النظافة، الخدمة، الموقع…"
          className="input resize-none"
        />
      </div>

      {error ? (
        <p className="alert-danger alert-enter mt-3">{error}</p>
      ) : null}

      <button type="submit" disabled={loading} className="btn btn-primary mt-4">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
      </button>
    </form>
  );
}
