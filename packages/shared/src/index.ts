/**
 * الثوابت المشتركة بين الـ API والويب وتطبيق الموبايل.
 * مصدر واحد للحقائق حتى لا تتناقض الأسعار/العمولات بين المنصات.
 */

export const APP_NAME = 'Bookly';

export const SUPPORTED_LOCALES = ['ar', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

export const CURRENCIES = {
  IQD: { code: 'IQD', nameAr: 'دينار عراقي', nameEn: 'Iraqi Dinar', symbol: 'د.ع', minorUnits: 0, symbolPlacement: 'after' },
  SAR: { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', minorUnits: 2, symbolPlacement: 'after' },
  AED: { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ', minorUnits: 2, symbolPlacement: 'after' },
  KWD: { code: 'KWD', nameAr: 'دينار كويتي', nameEn: 'Kuwaiti Dinar', symbol: 'د.ك', minorUnits: 3, symbolPlacement: 'after' },
  QAR: { code: 'QAR', nameAr: 'ريال قطري', nameEn: 'Qatari Riyal', symbol: 'ر.ق', minorUnits: 2, symbolPlacement: 'after' },
  BHD: { code: 'BHD', nameAr: 'دينار بحريني', nameEn: 'Bahraini Dinar', symbol: 'د.ب', minorUnits: 3, symbolPlacement: 'after' },
  OMR: { code: 'OMR', nameAr: 'ريال عماني', nameEn: 'Omani Rial', symbol: 'ر.ع', minorUnits: 3, symbolPlacement: 'after' },
  JOD: { code: 'JOD', nameAr: 'دينار أردني', nameEn: 'Jordanian Dinar', symbol: 'د.أ', minorUnits: 3, symbolPlacement: 'after' },
  EGP: { code: 'EGP', nameAr: 'جنيه مصري', nameEn: 'Egyptian Pound', symbol: 'ج.م', minorUnits: 2, symbolPlacement: 'after' },
  USD: { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', minorUnits: 2, symbolPlacement: 'before' },
  EUR: { code: 'EUR', nameAr: 'يورو', nameEn: 'Euro', symbol: '€', minorUnits: 2, symbolPlacement: 'before' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const SUPPORTED_CURRENCIES = Object.keys(CURRENCIES) as CurrencyCode[];

/** ألوان الهوية — تُستخدم في التطبيق والويب */
export const BRAND = {
  primary: '#0E7C66',
  primaryDark: '#0A5D4E',
  accent: '#F2A33C',
  sand: '#F6F1E7',
  ink: '#12211E',
} as const;

/** نسب العمولة الافتراضية على كل نوع خدمة (نسبة مئوية) */
export const COMMISSION_RATES = {
  FARM: 12,
  HOTEL: 10,
  CAR: 10,
  FLIGHT: 3,
  TRIP: 12,
} as const;

export type CommissionKey = keyof typeof COMMISSION_RATES;

/** فئات الأصول — تحدد شكل التفاصيل والفلاتر */
export const SERVICE_CATEGORIES = {
  FARM: 'FARM',
  CHALET: 'CHALET',
  REST: 'REST',
  HOTEL: 'HOTEL',
  APARTMENT: 'APARTMENT',
  FLIGHT: 'FLIGHT',
  CAR: 'CAR',
  TRIP: 'TRIP',
} as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];

export const SERVICE_CATEGORY_LABELS_AR: Record<ServiceCategory, string> = {
  FARM: 'مزرعة',
  CHALET: 'شاليه',
  REST: 'استراحة',
  HOTEL: 'فندق',
  APARTMENT: 'شقة فندقية',
  FLIGHT: 'رحلة طيران',
  CAR: 'تأجير سيارات',
  TRIP: 'رحلة سياحية',
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  REJECTED: 'REJECTED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_METHODS = {
  WALLET: 'WALLET',
  VISA: 'VISA',
  MASTERCARD: 'MASTERCARD',
  APPLE_PAY: 'APPLE_PAY',
  GOOGLE_PAY: 'GOOGLE_PAY',
  PAYPAL: 'PAYPAL',
  ZAIN_CASH: 'ZAIN_CASH',
  ASIA_HAWALA: 'ASIA_HAWALA',
  FASTPAY: 'FASTPAY',
  CASH_ON_SITE: 'CASH_ON_SITE',
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  FARM_OWNER: 'FARM_OWNER',
  HOTEL_MANAGER: 'HOTEL_MANAGER',
  TRAVEL_AGENCY: 'TRAVEL_AGENCY',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;

/** رصيد النقاط ونسبة الاستبدال */
export const LOYALTY = {
  /** نقطة واحدة مقابل كل 10 وحدات عملة منفق */
  POINTS_PER_MAJOR_UNIT: 0.1,
  POINTS_PER_MINOR_UNIT: 0.001,
  MIN_REDEEM_POINTS: 100,
  /** قيمة 100 نقطة بوحدات العملة (100 نقطة = 100 وحدة) */
  POINT_VALUE_MINOR: 100,
  POINTS_REDEEM_RATIO: 100,
  EXPIRY_MONTHS: 12,
  TIERS: [
    { name: 'BRONZE', nameAr: 'برونزي', minPoints: 0, multiplier: 1 },
    { name: 'SILVER', nameAr: 'فضي', minPoints: 2000, multiplier: 1.25 },
    { name: 'GOLD', nameAr: 'ذهبي', minPoints: 10000, multiplier: 1.5 },
    { name: 'PLATINUM', nameAr: 'بلاتيني', minPoints: 25000, multiplier: 2 },
  ],
} as const;

export type LoyaltyTier = (typeof LOYALTY.TIERS)[number]['name'];

/** الفئات العمومية التي يستخدمها الفلتر في كل الخدمات */
export const AMENITIES = {
  POOL: 'POOL',
  FOOTBALL_PITCH: 'FOOTBALL_PITCH',
  GARDEN: 'GARDEN',
  BBQ_AREA: 'BBQ_AREA',
  PLAYGROUND: 'PLAYGROUND',
  PETS_ALLOWED: 'PETS_ALLOWED',
  PRIVATE_BATHROOM: 'PRIVATE_BATHROOM',
  KITCHEN: 'KITCHEN',
  AC: 'AC',
  PARKING: 'PARKING',
  WIFI: 'WIFI',
  SEA_VIEW: 'SEA_VIEW',
  MOUNTAIN_VIEW: 'MOUNTAIN_VIEW',
  FAMILY_ROOM: 'FAMILY_ROOM',
  SAFARI: 'SAFARI',
} as const;

export type Amenity = (typeof AMENITIES)[keyof typeof AMENITIES];

/** رموزotyping الأخطاء الموحّدة */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  BOOKING_UNAVAILABLE: 'BOOKING_UNAVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  VENDOR_NOT_APPROVED: 'VENDOR_NOT_APPROVED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
