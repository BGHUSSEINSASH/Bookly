'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Send, Users, Gift, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/empty-state';

export default function InvitePage() {
  const { user, loading } = useAuth();
  const [copied, setCopied] = useState(false);
  const [link, setLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLink(`${window.location.origin}/login?mode=register`);
    }
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* صامت */
    }
  };

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-bookly py-8">
        <EmptyState
          icon={Users}
          title="سجّل الدخول لدعوة أصدقاءك"
          description="شارك رابط الدعوة واربح نقاطًا مع أول حجز لأصدقائك"
          actionLabel="تسجيل الدخول"
          actionHref="/login?next=/invite"
        />
      </div>
    );
  }

  const waText = encodeURIComponent(
    `جرّب بوكلي لحجز المزارع والفنادق والرحلات — ${link}`,
  );

  return (
    <div className="container-bookly py-8">
      <div className="mt-2 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">ادعُ أصدقاءك</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            شارك الرابط واكسب نقاط ولاء عند أول حجز لأصدقائك
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="card p-6">
          <label className="mb-2 block text-sm text-[var(--text-muted)]">رابط الدعوة الخاص بك</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={link}
              readOnly
              dir="ltr"
              onFocus={(e) => e.currentTarget.select()}
            />
            <button onClick={copy} className="btn btn-primary shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <Send className="h-4 w-4" />
              واتساب
            </a>
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('جرّب بوكلي — منصة الحجز العربية')}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
            >
              <Send className="h-4 w-4" />
              تيليجرام
            </a>
          </div>

          <div className="mt-6 border-t border-[var(--border-subtle)] pt-5">
            <h2 className="font-display text-base font-bold text-[var(--text-strong)]">
              كيف تعمل الدعوات؟
            </h2>
            <ol className="mt-3 space-y-2.5 text-sm text-[var(--text-muted)]">
              {[
                'شارك رابطك مع أصدقائك عبر واتساب أو تيليجرام.',
                'يسجّل صديقك حسابًا جديدًا من رابطك.',
                'يحجز صديقك أول رحلة له عبر بوكلي.',
                'تُضاف نقاط الولاء إلى رصيدك تلقائيًا.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand-text)]">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="card h-fit p-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)]">
            <Gift className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-[var(--text-strong)]">
            نقاط الولاء
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
            اكسب نقاطًا مع كل حجز — لك ولأصدقائك — وحوّلها إلى رصيد شراء فوري.
          </p>
          <Link href="/wallet" className="btn btn-soft mt-4 w-full">
            عرض نقاطي
          </Link>
        </aside>
      </div>
    </div>
  );
}
