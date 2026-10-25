'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ShieldCheck, Wallet, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatMoney, formatDate } from '@/lib/format';

const METHODS = [
  { key: 'WALLET', label: 'محفظة Bookly', icon: Wallet, desc: 'ادفع من رصيد محفظتك' },
  { key: 'VISA', label: 'فيزا / ماستركارد', icon: CreditCard, desc: 'بطاقة ائتمانية' },
  { key: 'APPLE_PAY', label: 'Apple Pay', icon: Smartphone, desc: 'دفع سريع' },
  { key: 'ZAIN_CASH', label: 'زين كاش', icon: Wallet, desc: 'محفظة إلكترونية' },
  { key: 'ASIA_HAWALA', label: 'آسيا حوالة', icon: Banknote, desc: 'تحويل حوالة' },
  { key: 'CASH_ON_SITE', label: 'الدفع عند الوصول', icon: Banknote, desc: 'نقدًا عند الاستلام' },
];

const STEPS = ['التواريخ', 'الضيوف', 'الدفع', 'التأكيد'];

function CheckoutInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, fetchMe } = useAuth();

  const target = (params.get('target') ?? 'PROPERTY') as 'PROPERTY' | 'FLIGHT' | 'CAR';
  const propertyId = params.get('propertyId') ?? '';
  const flightId = params.get('flightId') ?? '';
  const carId = params.get('carId') ?? '';
  // تواريخ افتراضية إذا جاء الزائر بدون معاملات (روابط قديمة/مباشرة)
  const checkIn = params.get('checkIn') ?? new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const checkOut = params.get('checkOut') ?? new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const guests = Math.max(1, Number(params.get('guests') ?? 2));
  const couponCode = params.get('couponCode') ?? '';

  const entityId = target === 'FLIGHT' ? flightId : target === 'CAR' ? carId : propertyId;
  const metaPath =
    target === 'FLIGHT' ? `/flights/${flightId}` : target === 'CAR' ? `/cars/${carId}` : `/properties/${propertyId}`;

  const [entity, setEntity] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [method, setMethod] = useState('WALLET');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [couponInput, setCouponInput] = useState(couponCode);
  const [appliedCoupon, setAppliedCoupon] = useState(couponCode);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!entityId) return;
    Promise.all([
      api.get(metaPath, false),
      api
        .post(
          '/bookings/quote',
          {
            target,
            ...(target === 'FLIGHT' ? { flightId } : target === 'CAR' ? { carId } : { propertyId }),
            checkIn,
            checkOut,
            guests,
            couponCode: appliedCoupon || undefined,
          },
          true,
        )
        .catch(() => null),
    ])
      .then(([p, q]) => {
        setEntity(p);
        setQuote(q);
        setGuestNames(Array.from({ length: guests }, () => ''));
      })
      .catch((e) => setError(e?.message ?? 'تعذّر تحميل بيانات الحجز'))
      .finally(() => setLoading(false));
  }, [entityId, metaPath, target, flightId, carId, propertyId, checkIn, checkOut, guests, appliedCoupon]);

  const applyCoupon = () => {
    setAppliedCoupon(couponInput.trim());
  };

  const submit = async () => {
    if (!user) {
      router.push(`/login?next=/checkout?${params.toString()}`);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const booking = await api.post('/bookings', {
        target,
        ...(target === 'FLIGHT' ? { flightId } : target === 'CAR' ? { carId } : { propertyId }),
        checkIn,
        checkOut,
        guests,
        couponCode: appliedCoupon || undefined,
        paymentMethod: method,
        customerNote: note || undefined,
        guestsDetail: guestNames.filter(Boolean).map((fullName) => ({ fullName })),
      });
      router.push(`/bookings?created=${booking.code}`);
    } catch (e: any) {
      setError(e?.message ?? 'تعذّر إتمام الحجز');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="grid h-96 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  const total = quote?.total ?? 0;

  return (
    <div className="container-bookly py-8">
      <h1 className="section-title mb-6">إتمام الحجز</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          {/* الخطوات */}
          <div className="card flex items-center gap-2 p-4">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="hidden text-sm font-semibold text-[var(--text-strong)] sm:block">
                  {s}
                </span>
                {i < STEPS.length - 1 ? (
                  <span className="h-0.5 flex-1 bg-[var(--border-subtle)]" />
                ) : null}
              </div>
            ))}
          </div>

          {/* الضيوف */}
          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-strong)]">
              بيانات الضيوف
            </h2>
            <div className="mt-4 space-y-3">
              {guestNames.map((name, i) => (
                <div key={i}>
                  <label className="label">الضيف {i + 1}</label>
                  <input
                    value={name}
                    onChange={(e) => {
                      const next = [...guestNames];
                      next[i] = e.target.value;
                      setGuestNames(next);
                    }}
                    placeholder="الاسم الكامل"
                    className="input"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="label">ملاحظات للمزوّد (اختياري)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="مثال: الوصول الساعة 8 مساءً، نحتاج مفارش إضافية"
                className="input resize-none"
              />
            </div>
          </section>

          {/* الدفع */}
          <section className="card p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-strong)]">
              طريقة الدفع
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMethod(m.key)}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-start transition ${
                    method === m.key
                      ? 'border-[var(--brand)] bg-[var(--brand-soft)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--brand)]'
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                      method === m.key
                        ? 'bg-[var(--brand)] text-white'
                        : 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
                    }`}
                  >
                    <m.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-[var(--text-strong)]">
                      {m.label}
                    </span>
                    <span className="block text-xs text-[var(--text-muted)]">{m.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {method === 'WALLET' && user ? (
              <p className="mt-3 rounded-xl bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand-text)]">
                رصيد محفظتك:{' '}
                <span className="font-extrabold">
                  {formatMoney(user.wallet?.balance ?? 0, user.wallet?.currency ?? 'IQD')}
                </span>
              </p>
            ) : null}
          </section>
        </div>

        {/* الملخص */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-strong)]">
              ملخص الحجز
            </h2>

            {entity ? (
              <div className="mt-4 border-b border-[var(--border-subtle)] pb-4">
                <p className="font-display text-base font-bold text-[var(--text-strong)]">
                  {target === 'FLIGHT'
                    ? `${entity.flightNumber ?? ''} · ${entity.airline?.nameAr ?? ''}`
                    : target === 'CAR'
                      ? `${entity.make ?? ''} ${entity.model ?? ''}`
                      : entity.title}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {target === 'FLIGHT'
                    ? `${entity.from?.cityAr ?? ''} (${entity.from?.iata ?? ''}) ← ${entity.to?.cityAr ?? ''} (${entity.to?.iata ?? ''})`
                    : target === 'CAR'
                      ? `${entity.year ?? ''} · ${entity.transmission === 'AUTOMATIC' ? 'أوتوماتيك' : 'يدوي'}`
                      : entity.city?.nameAr}
                </p>
                <p className="mt-2 text-sm text-[var(--text-body)]">
                  {target === 'FLIGHT'
                    ? `${formatDate(checkIn)}`
                    : `${formatDate(checkIn)} ← ${formatDate(checkOut)}`}
                </p>
                <p className="mt-1 text-sm text-[var(--text-body)]">
                  {target === 'FLIGHT'
                    ? `${guests} مسافر`
                    : target === 'CAR'
                      ? `الحد الأدنى ${entity.minRentalDays ?? 1} يوم`
                      : `${guests} ضيوف`}
                </p>
              </div>
            ) : null}

            {/* كوبون الخصم */}
            <div className="mt-4 flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="كود الخصم"
                className="input flex-1"
              />
              <button type="button" onClick={applyCoupon} className="btn btn-soft">
                تطبيق
              </button>
            </div>
            {appliedCoupon ? (
              <p className="mt-2 text-xs text-[var(--brand-text)]">
                الكوبون المُطبّق: <span className="font-bold">{appliedCoupon}</span>
                {quote?.discount > 0 ? ' — تم تطبيق الخصم' : ' — لم يُقبل بعد'}
              </p>
            ) : null}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>الإجمالي قبل الخصم</span>
                <span>{formatMoney(quote?.subtotal ?? total, entity?.currency ?? 'IQD')}</span>
              </div>
              {quote?.discount > 0 ? (
                <div className="flex justify-between text-[var(--brand-text)]">
                  <span>الخصم</span>
                  <span>- {formatMoney(quote.discount, entity?.currency ?? 'IQD')}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>رسوم الخدمة</span>
                <span>{formatMoney(quote?.serviceFee ?? 0, entity?.currency ?? 'IQD')}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2 text-base font-extrabold text-[var(--text-strong)]">
                <span>المبلغ المستحق</span>
                <span className="text-[var(--brand-text)]">
                  {formatMoney(total, entity?.currency ?? 'IQD')}
                </span>
              </div>
              {quote?.pointsEarned ? (
                <p className="rounded-xl bg-[var(--color-lime-soft)] p-2.5 text-xs text-[var(--color-amber-ink)]">
                  تكسب {quote.pointsEarned.toLocaleString('ar-IQ')} نقطة مكافأة
                </p>
              ) : null}
            </div>

            {error ? (
              <p className="alert-danger alert-enter mt-3">
                {error}
              </p>
            ) : null}

            <button onClick={submit} disabled={submitting} className="btn btn-primary mt-4 w-full">
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {submitting ? 'جارٍ المعالجة…' : `ادفع ${formatMoney(total, entity?.currency ?? 'IQD')}`}
            </button>

            <p className="mt-3 text-center text-[11px] leading-5 text-[var(--text-muted)]">
              بالضغط على «ادفع» أنت توافق على شروط الحجز وسياسة الاسترداد
            </p>

            {!user ? (
              <Link href="/login?next=/checkout" className="btn btn-soft mt-2 w-full">
                يجب تسجيل الدخول أولًا
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="grid h-96 place-items-center">جارٍ التحميل…</div>}>
      <CheckoutInner />
    </Suspense>
  );
}
