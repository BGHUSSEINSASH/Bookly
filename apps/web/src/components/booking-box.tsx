'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, ShieldCheck } from 'lucide-react';
import { formatMoney, toInputDate } from '@/lib/format';

function nightsBetween(from: string, to: string) {
  if (!from || !to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.round(ms / 86400000));
}

export function BookingBox({ property }: { property: any }) {
  const defaultIn = useMemo(() => toInputDate(new Date(Date.now() + 86400000)), []);
  const defaultOut = useMemo(() => toInputDate(new Date(Date.now() + 3 * 86400000)), []);

  const [checkIn, setCheckIn] = useState(defaultIn);
  const [checkOut, setCheckOut] = useState(defaultOut);
  const [guests, setGuests] = useState(2);
  const [coupon, setCoupon] = useState('');

  const nights = nightsBetween(checkIn, checkOut);
  const total = nights * Number(property.pricePerNight ?? 0);
  const maxGuests = Number(property.maxGuests ?? 16);

  const handleCheckIn = (v: string) => {
    setCheckIn(v);
    if (nightsBetween(v, checkOut) < 1) {
      setCheckOut(toInputDate(new Date(new Date(v).getTime() + 86400000)));
    }
  };

  const checkoutHref = [
    `/checkout?propertyId=${encodeURIComponent(property.id)}`,
    `checkIn=${checkIn}`,
    `checkOut=${checkOut}`,
    `guests=${guests}`,
    coupon ? `couponCode=${encodeURIComponent(coupon)}` : null,
  ]
    .filter(Boolean)
    .join('&');

  return (
    <div className="card p-5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl font-black text-[var(--brand-text)]">
          {formatMoney(property.pricePerNight, property.currency)}
        </span>
        <span className="text-sm text-[var(--text-muted)]">/ ليلة</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="rounded-xl border border-[var(--border-subtle)] p-3">
          <span className="block text-xs text-[var(--text-muted)]">الدخول</span>
          <input
            type="date"
            value={checkIn}
            min={toInputDate(new Date())}
            onChange={(e) => handleCheckIn(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm outline-none"
          />
        </label>
        <label className="rounded-xl border border-[var(--border-subtle)] p-3">
          <span className="block text-xs text-[var(--text-muted)]">الخروج</span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full bg-transparent text-sm outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--border-subtle)] p-3">
        <span className="text-sm text-[var(--text-body)]">عدد الضيوف</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="زيادة الضيوف"
            onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border-subtle)] text-[var(--brand-text)] transition hover:border-[var(--brand)]"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm font-bold">{guests}</span>
          <button
            type="button"
            aria-label="تقليل الضيوف"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="grid h-7 w-7 place-items-center rounded-full border border-[var(--border-subtle)] text-[var(--brand-text)] transition hover:border-[var(--brand)]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <input
          placeholder="كود الخصم (اختياري)"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          className="input"
        />
      </div>

      <div className="mt-4 space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
        <div className="flex justify-between text-[var(--text-muted)]">
          <span>{nights} ليالٍ</span>
          <span>{formatMoney(total, property.currency)}</span>
        </div>
        <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2 text-base font-extrabold text-[var(--text-strong)]">
          <span>الإجمالي</span>
          <span className="text-[var(--brand-text)]">{formatMoney(total, property.currency)}</span>
        </div>
      </div>

      {nights > 0 ? (
        <Link href={checkoutHref} className="btn btn-primary mt-4 w-full">
          احجز الآن
        </Link>
      ) : (
        <span className="btn btn-outline mt-4 w-full cursor-not-allowed opacity-60">
          اختر تواريخ صالحة
        </span>
      )}
      <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
        لن يتم خصم أي مبلغ حتى تؤكد الحجز
      </p>
    </div>
  );
}

export function BookingGuardCard() {
  return (
    <div className="card mt-4 flex items-start gap-3 p-4 text-sm text-[var(--text-body)]">
      <ShieldCheck className="h-5 w-5 shrink-0 text-[var(--brand-text)]" />
      <p>
        دفع آمن عبر محفظة Bookly أو البطاقات أو المحافظ الإلكترونية. استرجاع كامل خلال 48 ساعة من
        موعد الوصول.
      </p>
    </div>
  );
}
