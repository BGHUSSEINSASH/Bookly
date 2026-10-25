import { CURRENCIES, type CurrencyCode } from '@bookly/shared';

export function formatMoney(
  amount: number | string | null | undefined,
  currency: string = 'IQD',
  locale = 'ar-IQ',
): string {
  const value = Number(amount ?? 0);
  const code = (currency as CurrencyCode) in CURRENCIES ? (currency as CurrencyCode) : 'IQD';
  const meta = CURRENCIES[code];
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: meta.minorUnits,
    minimumFractionDigits: 0,
  }).format(value);

  return meta.symbolPlacement === 'before' ? `${meta.symbol} ${formatted}` : `${formatted} ${meta.symbol}`;
}

export function formatDate(date: string | Date | null | undefined, withTime = false): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('ar-IQ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d);
}

export function formatDateRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const nights = Math.max(1, Math.ceil((t.getTime() - f.getTime()) / 86400000));
  const fmt = new Intl.DateTimeFormat('ar-IQ', { day: 'numeric', month: 'short' });
  return `${fmt.format(f)} — ${fmt.format(t)} · ${nights} ${nights === 1 ? 'ليلة' : 'ليالٍ'}`;
}

export function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const CATEGORY_LABELS: Record<string, string> = {
  FARM: 'مزرعة',
  CHALET: 'شاليه',
  REST: 'استراحة',
  HOTEL: 'فندق',
  APARTMENT: 'شقة فندقية',
  FLIGHT: 'رحلة طيران',
  CAR: 'تأجير سيارات',
  TRIP: 'رحلة سياحية',
};

export const AMENITY_LABELS: Record<string, string> = {
  POOL: 'مسبح خاص',
  FOOTBALL_PITCH: 'ملعب كرة',
  GARDEN: 'حديقة',
  BBQ_AREA: 'منطقة شواء',
  PLAYGROUND: 'ملعب أطفال',
  PETS_ALLOWED: 'يسمح بالحيوانات',
  PRIVATE_BATHROOM: 'حمام خاص',
  KITCHEN: 'مطبخ',
  AC: 'تكييف',
  PARKING: 'موقف سيارات',
  WIFI: 'واي فاي',
  SEA_VIEW: 'إطلالة بحرية',
  MOUNTAIN_VIEW: 'إطلالة جبلية',
  FAMILY_ROOM: 'غرفة عائلية',
  SAFARI: 'جولة سفاري',
};

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'بانتظار الموافقة',
  CONFIRMED: 'مؤكد',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
  REFUNDED: 'مسترد',
  REJECTED: 'مرفوض',
  EXPIRED: 'منتهي',
};

export const BOOKING_STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-[var(--warning-soft)] text-[var(--color-amber-ink)]',
  CONFIRMED: 'bg-[var(--brand-soft)] text-[var(--brand-text)]',
  COMPLETED: 'bg-[var(--bg-soft)] text-[var(--text-muted)]',
  CANCELLED: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  REFUNDED: 'bg-[var(--info-soft)] text-[var(--info)]',
  REJECTED: 'bg-[var(--danger-soft)] text-[var(--danger)]',
  EXPIRED: 'bg-[var(--bg-soft)] text-[var(--text-faint)]',
};
