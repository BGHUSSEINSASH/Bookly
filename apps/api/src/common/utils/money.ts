import { CommissionKey } from '@bookly/shared';

export interface CommissionResult {
  /** المبلغ الذي يستلمه المزوّد */
  vendorAmount: number;
  /** عمولة المنصة */
  commission: number;
  /** المبلغ الإجمالي الذي يدفعه العميل */
  total: number;
}

/**
 * حساب العمولة على المبلغ الإجمالي قبل الخصومات ( commission على سعر الخدمة )
 * commission = subtotal * rate / 100
 */
export function computeCommission(
  subtotal: number,
  ratePercent: number,
): CommissionResult {
  const commission = round2((subtotal * ratePercent) / 100);
  return {
    commission,
    vendorAmount: round2(subtotal - commission),
    total: round2(subtotal),
  };
}

export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function commissionRateFor(key: CommissionKey, overrides?: Partial<Record<CommissionKey, number>>): number {
  const fallback: Record<CommissionKey, number> = {
    FARM: 12,
    HOTEL: 10,
    CAR: 10,
    FLIGHT: 3,
    TRIP: 12,
  };
  return overrides?.[key] ?? fallback[key];
}

/** تحويل الأرقام من Prisma Decimal إلى number */
export function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value);
  const anyVal = value as any;
  if (typeof anyVal?.toNumber === 'function') return anyVal.toNumber();
  return Number(anyVal);
}
