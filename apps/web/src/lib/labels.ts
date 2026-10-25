import { formatMoney, CATEGORY_LABELS } from '@/lib/format';

export function formatPrice(amount: number, currency = 'IQD') {
  return formatMoney(amount, currency);
}

export const CATEGORIES = [
  { key: 'FARM', label: 'مزارع', icon: '' },
  { key: 'CHALET', label: 'شاليهات', icon: '' },
  { key: 'REST', label: 'استراحات', icon: '' },
  { key: 'HOTEL', label: 'فنادق', icon: '' },
  { key: 'APARTMENT', label: 'شقق فندقية', icon: '' },
  { key: 'FLIGHT', label: 'طيران', icon: '' },
  { key: 'CAR', label: 'سيارات', icon: '' },
  { key: 'TRIP', label: 'رحلات', icon: '' },
];

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

export { CATEGORY_LABELS };
