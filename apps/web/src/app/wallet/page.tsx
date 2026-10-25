'use client';

import { useEffect, useState } from 'react';
import { Wallet, Plus, Loader2, ArrowDownLeft, ArrowUpRight, Gift, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatMoney, formatDate } from '@/lib/format';
import { Skeleton } from '@/components/skeleton';

const TXN_LABELS: Record<string, string> = {
  TOPUP: 'شحن رصيد',
  BOOKING_DEBIT: 'دفع حجز',
  REFUND: 'استرداد',
  REWARD: 'مكافأة',
  ADJUSTMENT: 'تسوية',
  TRANSFER_OUT: 'تحويل صادر',
  TRANSFER_IN: 'تحويل وارد',
  WITHDRAW: 'سحب',
};

export default function WalletPage() {
  const { fetchMe } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);
  const [points, setPoints] = useState<any>(null);
  const [amount, setAmount] = useState(50000);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [w, t, p] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions?limit=30'),
        api.get('/loyalty/me'),
      ]);
      setBalance(w);
      setTxns(t?.items ?? t ?? []);
      setPoints(p);
    } catch {
      setMessage('يجب تسجيل الدخول لعرض المحفظة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
    load();
  }, [fetchMe]);

  const topUp = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await api.post('/wallet/topup', { amount: Number(amount), method: 'VISA' });
      setMessage('تم شحن الرصيد بنجاح (بيئة تجريبية)');
      await load();
    } catch (e: any) {
      setMessage(e?.message ?? 'فشل شحن الرصيد');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="container-bookly py-8">
        <div className="mb-6 flex items-start gap-2.5">
          <span className="accent-bar mt-1" />
          <div>
            <h1 className="section-title">المحفظة والمكافآت</h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              شحن، دفع، استرداد ونقاط المكافآت
            </p>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-[var(--radius-xl2)]" />
          <div className="grid gap-4 lg:col-span-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-64" />
          </div>
        </div>
        <span className="sr-only">جارٍ تحميل المحفظة</span>
      </div>
    );
  }

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">المحفظة والمكافآت</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            شحن، دفع، استرداد ونقاط المكافآت
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* الرصيد */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl2)] bg-gradient-to-bl from-forest-600 to-forest-900 p-6 text-white shadow-[var(--shadow-e3)]">
          <div className="relative z-10">
            <span className="flex items-center gap-2 text-sm text-white/70">
              <Wallet className="h-4 w-4" />
              رصيد المحفظة
            </span>
            <p className="mt-3 font-display text-4xl font-black">
              {formatMoney(balance?.balance ?? 0, balance?.currency ?? 'IQD')}
            </p>
            <p className="mt-1 text-sm text-white/60">
              إجمالي الشحن: {formatMoney(balance?.totalToppedUp ?? 0, balance?.currency ?? 'IQD')}
            </p>

            <div className="mt-5 border-t border-white/15 pt-4">
              <label className="mb-2 block text-sm text-white/80">مبلغ الشحن</label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {[10000, 25000, 50000, 100000, 250000].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      amount === p
                        ? 'bg-[var(--accent)] text-[var(--accent-ink)]'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {p.toLocaleString('ar-IQ')}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input !border-transparent"
                min={1000}
                step={1000}
              />
              <button onClick={topUp} disabled={busy} className="btn btn-lime mt-2 w-full">
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                شحن الرصيد
              </button>
              {message ? <p className="mt-2 text-xs text-white/80">{message}</p> : null}
            </div>
          </div>
        </div>

        {/* النقاط */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Sparkles className="h-4 w-4" />
                نقاط المكافآت
              </span>
              <p className="mt-2 font-display text-3xl font-black text-[var(--text-strong)]">
                {(points?.points ?? 0).toLocaleString('ar-IQ')}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                المستوى: {points?.tierLabelAr} · معامل {points?.multiplier}×
              </p>
            </div>
            <span className="pill pill-lime">
              {formatMoney(points?.redeemValue ?? 0, 'IQD')} قيمة الاستبدال
            </span>
          </div>

          {points?.nextTier ? (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs text-[var(--text-muted)]">
                <span>الوصول إلى {points.nextTier.nameAr}</span>
                <span>{points.nextTier.remaining.toLocaleString('ar-IQ')} نقطة متبقية</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{
                    width: `${Math.min(100, (points.points / points.nextTier.minPoints) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-5 space-y-2 border-t border-[var(--border-subtle)] pt-4">
            {(points?.history ?? []).slice(0, 5).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--text-body)]">
                  <Gift className="h-3.5 w-3.5 text-[var(--brand-text)]" />
                  {h.description ?? TXN_LABELS[h.type]}
                </span>
                <span
                  className={
                    h.points > 0
                      ? 'font-bold text-[var(--brand-text)]'
                      : 'font-bold text-[var(--danger)]'
                  }
                >
                  {h.points > 0 ? '+' : ''}
                  {h.points.toLocaleString('ar-IQ')}
                </span>
              </div>
            ))}
            {points?.history?.length ? null : (
              <p className="text-sm text-[var(--text-muted)]">لا توجد عمليات نقاط بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* السجل */}
      <h2 className="mt-8 mb-3 font-display text-lg font-bold text-[var(--text-strong)]">
        سجل العمليات
      </h2>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {txns.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">لا توجد عمليات بعد</p>
        ) : (
          txns.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-lg ${
                    Number(t.amount) > 0
                      ? 'bg-[var(--brand-soft)] text-[var(--brand-text)]'
                      : 'bg-[var(--danger-soft)] text-[var(--danger)]'
                  }`}
                >
                  {Number(t.amount) > 0 ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--text-strong)]">
                    {t.note ?? TXN_LABELS[t.type] ?? t.type}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {formatDate(t.createdAt, true)}
                    {t.bookingCode ? ` · ${t.bookingCode}` : ''}
                  </p>
                </div>
              </div>
              <div className="text-left">
                <p
                  className={`font-extrabold ${
                    Number(t.amount) > 0 ? 'text-[var(--brand-text)]' : 'text-[var(--text-strong)]'
                  }`}
                >
                  {Number(t.amount) > 0 ? '+' : ''}
                  {formatMoney(t.amount, t.currency)}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  الرصيد: {formatMoney(t.balanceAfter, t.currency)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
