/**
 * الثوابت المشتركة بين الـ API والويب وتطبيق الموبايل.
 * مصدر واحد للحقائق حتى لا تتناقض الأسعار/العمولات بين المنصات.
 */
export declare const APP_NAME = "Bookly";
export declare const SUPPORTED_LOCALES: readonly ["ar", "en"];
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export declare const DEFAULT_LOCALE: Locale;
export declare const CURRENCIES: {
    readonly IQD: {
        readonly code: "IQD";
        readonly nameAr: "دينار عراقي";
        readonly nameEn: "Iraqi Dinar";
        readonly symbol: "د.ع";
        readonly minorUnits: 0;
        readonly symbolPlacement: "after";
    };
    readonly SAR: {
        readonly code: "SAR";
        readonly nameAr: "ريال سعودي";
        readonly nameEn: "Saudi Riyal";
        readonly symbol: "ر.س";
        readonly minorUnits: 2;
        readonly symbolPlacement: "after";
    };
    readonly AED: {
        readonly code: "AED";
        readonly nameAr: "درهم إماراتي";
        readonly nameEn: "UAE Dirham";
        readonly symbol: "د.إ";
        readonly minorUnits: 2;
        readonly symbolPlacement: "after";
    };
    readonly KWD: {
        readonly code: "KWD";
        readonly nameAr: "دينار كويتي";
        readonly nameEn: "Kuwaiti Dinar";
        readonly symbol: "د.ك";
        readonly minorUnits: 3;
        readonly symbolPlacement: "after";
    };
    readonly QAR: {
        readonly code: "QAR";
        readonly nameAr: "ريال قطري";
        readonly nameEn: "Qatari Riyal";
        readonly symbol: "ر.ق";
        readonly minorUnits: 2;
        readonly symbolPlacement: "after";
    };
    readonly BHD: {
        readonly code: "BHD";
        readonly nameAr: "دينار بحريني";
        readonly nameEn: "Bahraini Dinar";
        readonly symbol: "د.ب";
        readonly minorUnits: 3;
        readonly symbolPlacement: "after";
    };
    readonly OMR: {
        readonly code: "OMR";
        readonly nameAr: "ريال عماني";
        readonly nameEn: "Omani Rial";
        readonly symbol: "ر.ع";
        readonly minorUnits: 3;
        readonly symbolPlacement: "after";
    };
    readonly JOD: {
        readonly code: "JOD";
        readonly nameAr: "دينار أردني";
        readonly nameEn: "Jordanian Dinar";
        readonly symbol: "د.أ";
        readonly minorUnits: 3;
        readonly symbolPlacement: "after";
    };
    readonly EGP: {
        readonly code: "EGP";
        readonly nameAr: "جنيه مصري";
        readonly nameEn: "Egyptian Pound";
        readonly symbol: "ج.م";
        readonly minorUnits: 2;
        readonly symbolPlacement: "after";
    };
    readonly USD: {
        readonly code: "USD";
        readonly nameAr: "دولار أمريكي";
        readonly nameEn: "US Dollar";
        readonly symbol: "$";
        readonly minorUnits: 2;
        readonly symbolPlacement: "before";
    };
    readonly EUR: {
        readonly code: "EUR";
        readonly nameAr: "يورو";
        readonly nameEn: "Euro";
        readonly symbol: "€";
        readonly minorUnits: 2;
        readonly symbolPlacement: "before";
    };
};
export type CurrencyCode = keyof typeof CURRENCIES;
export declare const SUPPORTED_CURRENCIES: CurrencyCode[];
/** ألوان الهوية — تُستخدم في التطبيق والويب */
export declare const BRAND: {
    readonly primary: "#0E7C66";
    readonly primaryDark: "#0A5D4E";
    readonly accent: "#F2A33C";
    readonly sand: "#F6F1E7";
    readonly ink: "#12211E";
};
/** نسب العمولة الافتراضية على كل نوع خدمة (نسبة مئوية) */
export declare const COMMISSION_RATES: {
    readonly FARM: 12;
    readonly HOTEL: 10;
    readonly CAR: 10;
    readonly FLIGHT: 3;
    readonly TRIP: 12;
};
export type CommissionKey = keyof typeof COMMISSION_RATES;
/** فئات الأصول — تحدد شكل التفاصيل والفلاتر */
export declare const SERVICE_CATEGORIES: {
    readonly FARM: "FARM";
    readonly CHALET: "CHALET";
    readonly REST: "REST";
    readonly HOTEL: "HOTEL";
    readonly APARTMENT: "APARTMENT";
    readonly FLIGHT: "FLIGHT";
    readonly CAR: "CAR";
    readonly TRIP: "TRIP";
};
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[keyof typeof SERVICE_CATEGORIES];
export declare const SERVICE_CATEGORY_LABELS_AR: Record<ServiceCategory, string>;
export declare const BOOKING_STATUS: {
    readonly PENDING: "PENDING";
    readonly CONFIRMED: "CONFIRMED";
    readonly COMPLETED: "COMPLETED";
    readonly CANCELLED: "CANCELLED";
    readonly REFUNDED: "REFUNDED";
    readonly REJECTED: "REJECTED";
};
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export declare const PAYMENT_STATUS: {
    readonly PENDING: "PENDING";
    readonly AUTHORIZED: "AUTHORIZED";
    readonly PAID: "PAID";
    readonly FAILED: "FAILED";
    readonly REFUNDED: "REFUNDED";
    readonly PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED";
};
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export declare const PAYMENT_METHODS: {
    readonly WALLET: "WALLET";
    readonly VISA: "VISA";
    readonly MASTERCARD: "MASTERCARD";
    readonly APPLE_PAY: "APPLE_PAY";
    readonly GOOGLE_PAY: "GOOGLE_PAY";
    readonly PAYPAL: "PAYPAL";
    readonly ZAIN_CASH: "ZAIN_CASH";
    readonly ASIA_HAWALA: "ASIA_HAWALA";
    readonly FASTPAY: "FASTPAY";
    readonly CASH_ON_SITE: "CASH_ON_SITE";
};
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export declare const USER_ROLES: {
    readonly CUSTOMER: "CUSTOMER";
    readonly FARM_OWNER: "FARM_OWNER";
    readonly HOTEL_MANAGER: "HOTEL_MANAGER";
    readonly TRAVEL_AGENCY: "TRAVEL_AGENCY";
    readonly VENDOR: "VENDOR";
    readonly ADMIN: "ADMIN";
    readonly SUPER_ADMIN: "SUPER_ADMIN";
};
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export declare const USER_STATUS: {
    readonly ACTIVE: "ACTIVE";
    readonly PENDING_VERIFICATION: "PENDING_VERIFICATION";
    readonly SUSPENDED: "SUSPENDED";
    readonly DELETED: "DELETED";
};
/** رصيد النقاط ونسبة الاستبدال */
export declare const LOYALTY: {
    /** نقطة واحدة مقابل كل 10 وحدات عملة منفق */
    readonly POINTS_PER_MAJOR_UNIT: 0.1;
    readonly POINTS_PER_MINOR_UNIT: 0.001;
    readonly MIN_REDEEM_POINTS: 100;
    /** قيمة 100 نقطة بوحدات العملة (100 نقطة = 100 وحدة) */
    readonly POINT_VALUE_MINOR: 100;
    readonly POINTS_REDEEM_RATIO: 100;
    readonly EXPIRY_MONTHS: 12;
    readonly TIERS: readonly [{
        readonly name: "BRONZE";
        readonly nameAr: "برونزي";
        readonly minPoints: 0;
        readonly multiplier: 1;
    }, {
        readonly name: "SILVER";
        readonly nameAr: "فضي";
        readonly minPoints: 2000;
        readonly multiplier: 1.25;
    }, {
        readonly name: "GOLD";
        readonly nameAr: "ذهبي";
        readonly minPoints: 10000;
        readonly multiplier: 1.5;
    }, {
        readonly name: "PLATINUM";
        readonly nameAr: "بلاتيني";
        readonly minPoints: 25000;
        readonly multiplier: 2;
    }];
};
export type LoyaltyTier = (typeof LOYALTY.TIERS)[number]['name'];
/** الفئات العمومية التي يستخدمها الفلتر في كل الخدمات */
export declare const AMENITIES: {
    readonly POOL: "POOL";
    readonly FOOTBALL_PITCH: "FOOTBALL_PITCH";
    readonly GARDEN: "GARDEN";
    readonly BBQ_AREA: "BBQ_AREA";
    readonly PLAYGROUND: "PLAYGROUND";
    readonly PETS_ALLOWED: "PETS_ALLOWED";
    readonly PRIVATE_BATHROOM: "PRIVATE_BATHROOM";
    readonly KITCHEN: "KITCHEN";
    readonly AC: "AC";
    readonly PARKING: "PARKING";
    readonly WIFI: "WIFI";
    readonly SEA_VIEW: "SEA_VIEW";
    readonly MOUNTAIN_VIEW: "MOUNTAIN_VIEW";
    readonly FAMILY_ROOM: "FAMILY_ROOM";
    readonly SAFARI: "SAFARI";
};
export type Amenity = (typeof AMENITIES)[keyof typeof AMENITIES];
/** رموزotyping الأخطاء الموحّدة */
export declare const ERROR_CODES: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly INSUFFICIENT_BALANCE: "INSUFFICIENT_BALANCE";
    readonly BOOKING_UNAVAILABLE: "BOOKING_UNAVAILABLE";
    readonly PAYMENT_FAILED: "PAYMENT_FAILED";
    readonly VENDOR_NOT_APPROVED: "VENDOR_NOT_APPROVED";
    readonly RATE_LIMITED: "RATE_LIMITED";
};
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
