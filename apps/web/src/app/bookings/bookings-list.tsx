'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Ticket, CheckCircle2, CalendarDays, Users, XCircle } from 'lucide-react';
import { ListSkeleton } from '@/components/skeleton';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatMoney, formatDate, BOOKING_STATUS_LABELS, BOOKING_STATUS_STYLES } from '@/lib/format';

export default function BookingsList() {
  const params = useSearchParams();
  const created = params.get('created');
  const { fetchMe } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/bookings?status=${status}&limit=50`)
      .then((res) => {
        setItems(res?.items ?? res ?? []);
        setMeta(res?.meta ?? null);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [status]);

  const cancel = async (code: string) => {
    if (!confirm('هل تريد إلغاء هذا الحجز؟')) return;
    await api.post(`/bookings/${code}/cancel`, { reason: 'إلغاء من قبل العميل' }).catch(() => null);
    setItems((prev) => prev.map((b) => (b.code === code ? { ...b, status: 'CANCELLED' } : b)));
  };

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">حجوزاتي</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            تابع حجوزاتك، ادفع، ألغِ، وقيّم تجربتك
          </p>
        </div>
      </div>

      {created ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[var(--brand)]/20 bg-[var(--brand-soft)] p-4">
          <CheckCircle2 className="h-6 w-6 text-[var(--brand-text)]" />
          <div>
            <p className="font-bold text-[var(--brand-text)]">تم تأكيد حجزك بنجاح</p>
            <p className="text-sm text-[var(--brand-text)]/80">رقم الحجز: {created}</p>
          </div>
        </div>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={status === s ? 'chip chip-active' : 'chip'}
          >
            {s === 'ALL' ? 'الكل' : BOOKING_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={3} />
      ) : items.length === 0 ? (
        <div className="card grid place-items-center p-16 text-center">
          <Ticket className="h-10 w-10 text-[var(--ink-300)]" />
          <p className="mt-3 font-display text-lg font-bold text-[var(--text-strong)]">
            لا توجد حجوزات
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">ابدأ باستكشاف المزارع والفنادق</p>
          <Link href="/search" className="btn btn-primary mt-5">
            تصفّح النتائج
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-52 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`pill ${BOOKING_STATUS_STYLES[b.status] ?? 'pill-outline'}`}
                    >
                      {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">#{b.code}</span>
                  </div>

                  <h3 className="mt-2 font-display text-base font-bold text-[var(--text-strong)]">
                    {b.property?.title ?? b.trip?.title ?? b.flight?.flightNumber ?? b.car?.model}
                  </h3>

                  <div className="mt-1.5 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(b.checkIn)} ← {formatDate(b.checkOut)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {b.guests} ضيوف
                    </span>
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-display text-lg font-extrabold text-[var(--brand-text)]">
                    {formatMoney(b.total, b.currency)}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">الدفع: {b.paymentStatus}</p>
                </div>

                <div className="flex gap-2">
                  {['PENDING', 'CONFIRMED'].includes(b.status) ? (
                    <button onClick={() => cancel(b.code)} className="btn btn-ghost !px-3 !text-xs">
                      <XCircle className="h-3.5 w-3.5" />
                      إلغاء
                    </button>
                  ) : null}
                  {b.property?.slug ? (
                    <Link
                      href={`/property/${b.property.slug}`}
                      className="btn btn-soft !px-3 !text-xs"
                    >
                      التفاصيل
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta?.total ? (
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          إجمالي الحجوزات: {meta.total}
        </p>
      ) : null}
    </div>
  );
}
