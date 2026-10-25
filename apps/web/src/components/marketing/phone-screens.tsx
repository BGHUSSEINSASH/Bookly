import Image from 'next/image';
import { Search, Heart, MapPin, Star, ChevronLeft, Wallet, CalendarDays, Users, Check } from 'lucide-react';

/* شاشات مصغّرة تحاكي تطبيق Bookly — بيانات واقعية من البذور */

const IMG_FARM = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&h=400&q=75&sat=-10';
const IMG_CHALET = 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=600&h=400&q=75&sat=-10';

function StatusBar({ time = '٩:٤١' }: { time?: string }) {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-[var(--text-strong)]">
      <span>{time}</span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2.5 w-3.5 rounded-[3px] border border-[var(--text-strong)]/70">
          <span className="block h-full w-2/3 rounded-[1px] bg-[var(--text-strong)]/70" />
        </span>
      </span>
    </div>
  );
}

function MiniCard({
  img,
  tag,
  title,
  price,
}: {
  img: string;
  tag: string;
  title: string;
  price: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="relative aspect-[16/10]">
        <Image src={img} alt="" fill sizes="220px" className="photo-warm object-cover" />
        <span className="pill pill-forest absolute top-1.5 right-1.5 !text-[8px]">{tag}</span>
      </div>
      <div className="px-2.5 py-2">
        <p className="truncate font-display text-[10.5px] font-semibold text-[var(--text-strong)]">{title}</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="font-display text-[10px] font-bold text-[var(--brand-text)]">
            {price}
            <span className="font-normal text-[var(--text-muted)]"> / ليلة</span>
          </span>
          <span className="flex items-center gap-0.5 text-[9px] text-[var(--text-body)]">
            <Star className="h-2 w-2 fill-[var(--brass)] text-[var(--brass)]" />
            ٤٫٨
          </span>
        </div>
      </div>
    </div>
  );
}

/** شاشة الاستكشاف */
export function ScreenExplore() {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)]">
      <StatusBar />
      <div className="px-4 pt-2">
        <p className="text-[9px] text-[var(--text-muted)]">أهلاً بك</p>
        <p className="font-display text-[13px] font-bold text-[var(--text-strong)]">إلى أين تودّ السفر؟</p>
        <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2">
          <Search className="h-3 w-3 text-[var(--text-faint)]" />
          <span className="text-[9.5px] text-[var(--text-faint)]">مزرعة، فندق، شاليه…</span>
        </div>
        <div className="mt-2 flex gap-1">
          {['الكل', 'مزارع', 'فنادق', 'شاليهات'].map((c, i) => (
            <span
              key={c}
              className={`rounded-md px-2 py-1 text-[8.5px] font-semibold ${
                i === 0 ? 'bg-[var(--brand)] text-white' : 'border border-[var(--border-subtle)] text-[var(--text-muted)]'
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-2.5 flex flex-col gap-2 px-4 pb-2">
        <MiniCard img={IMG_FARM} tag="مزرعة" title="مزرعة الفرات — استراحة عائلية" price="٧٥٬٠٠٠ د.ع" />
        <MiniCard img={IMG_CHALET} tag="شاليه" title="شاليهات النخيل" price="٤٥٬٠٠٠ د.ع" />
      </div>
      <div className="mt-auto grid grid-cols-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5">
        {[
          ['الرئيسية', true],
          ['البحث', false],
          ['حجوزاتي', false],
          ['حسابي', false],
        ].map(([label, active]) => (
          <span
            key={label as string}
            className={`text-center text-[8px] font-semibold ${active ? 'text-[var(--brand-text)]' : 'text-[var(--text-faint)]'}`}
          >
            {label as string}
          </span>
        ))}
      </div>
    </div>
  );
}

/** شاشة تفاصيل العقار */
export function ScreenProperty() {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)]">
      <div className="relative aspect-[4/3.4] shrink-0">
        <Image src={IMG_FARM} alt="" fill sizes="260px" className="photo-warm object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/45" />
        <StatusBar />
        <Heart className="absolute right-3 top-11 h-5 w-5 fill-white/90 text-white" />
        <div className="absolute inset-x-3.5 bottom-3 text-white">
          <p className="text-[8.5px] font-semibold tracking-wide text-white/80">مزرعة · بغداد</p>
          <p className="mt-0.5 font-display text-[13px] font-bold leading-snug">مزرعة الفرات — استراحة عائلية</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-[12px] font-bold text-[var(--brand-text)]">
            ٧٥٬٠٠٠ د.ع
            <span className="text-[9px] font-normal text-[var(--text-muted)]"> / ليلة</span>
          </span>
          <span className="flex items-center gap-1 rounded-md bg-[var(--color-amber-soft)] px-1.5 py-0.5 text-[8.5px] font-bold text-[var(--color-amber-ink)]">
            <Star className="h-2 w-2 fill-current" /> ٤٫٨ (٩٦)
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {['مسبح خاص', 'شواء', 'واي فاي', 'موقف', 'مطبخ', 'مساحات خضراء'].map((a) => (
            <span
              key={a}
              className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-1.5 text-center text-[8px] font-medium text-[var(--text-body)]"
            >
              {a}
            </span>
          ))}
        </div>
        <div className="mt-auto mb-3 flex items-center gap-2">
          <span className="rounded-lg bg-[var(--accent)] px-4 py-2 text-center text-[10px] font-bold text-[var(--accent-ink)]">
            احجز الآن
          </span>
          <span className="flex-1 rounded-lg border border-[var(--border-subtle)] py-2 text-center text-[9.5px] font-semibold text-[var(--text-body)]">
            اتصال · واتساب
          </span>
        </div>
      </div>
    </div>
  );
}

/** شاشة خطوات الحجز */
export function ScreenBooking() {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)]">
      <StatusBar />
      <div className="px-4 pt-2">
        <p className="font-display text-[12.5px] font-bold text-[var(--text-strong)]">إتمام الحجز</p>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="flex items-center gap-1">
              <span
                className={`grid h-4 w-4 place-items-center rounded-full text-[7.5px] font-bold ${
                  n <= 2 ? 'bg-[var(--brand)] text-white' : 'bg-[var(--bg-soft)] text-[var(--text-faint)]'
                }`}
              >
                {n}
              </span>
              {n < 4 && <span className="h-px w-3 bg-[var(--border-strong)]" />}
            </span>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2">
            <CalendarDays className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="text-[9px] text-[var(--text-body)]">٢٤ — ٢٦ أكتوبر · ليلتان</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2">
            <Users className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="text-[9px] text-[var(--text-body)]">٦ ضيوف</span>
          </div>
        </div>
        <div className="mt-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5">
          <p className="text-[8.5px] text-[var(--text-muted)]">مزرعة الفرات</p>
          <div className="mt-1.5 flex justify-between text-[9px] text-[var(--text-body)]">
            <span>الإجمالي قبل الخصم</span>
            <span>١٥٠٬٠٠٠ د.ع</span>
          </div>
          <div className="mt-1 flex justify-between text-[9px] text-[var(--text-body)]">
            <span>رسوم الخدمة</span>
            <span>٠ د.ع</span>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-[var(--border-subtle)] pt-1.5 font-display text-[10.5px] font-bold text-[var(--text-strong)]">
            <span>المبلغ المستحق</span>
            <span>١٥٠٬٠٠٠ د.ع</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-[10px] font-bold text-[var(--accent-ink)]">
          <Check className="h-3 w-3" /> ادفع ١٥٠٬٠٠٠ د.ع
        </div>
      </div>
    </div>
  );
}

/** شاشة المحفظة */
export function ScreenWallet() {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)]">
      <StatusBar />
      <div className="px-4 pt-2">
        <p className="font-display text-[12.5px] font-bold text-[var(--text-strong)]">المحفظة</p>
        <div className="mt-2.5 rounded-xl bg-[var(--brand)] p-3.5 text-white">
          <div className="flex items-center gap-1.5 text-[8.5px] text-white/70">
            <Wallet className="h-2.5 w-2.5" /> الرصيد الحالي
          </div>
          <p className="mt-1 font-display text-[17px] font-bold">٣٢٠٬٠٠٠ د.ع</p>
          <p className="mt-1 text-[8.5px] text-white/70">+ ١٬٢٥٠ نقطة ولاء</p>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <span className="rounded-lg bg-[var(--accent)] py-1.5 text-center text-[9px] font-bold text-[var(--accent-ink)]">شحن الرصيد</span>
          <span className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 text-center text-[9px] font-semibold text-[var(--text-body)]">
            سحب الأرباح
          </span>
        </div>
        <p className="mt-3 text-[8.5px] font-bold text-[var(--text-muted)]">آخر العمليات</p>
        <div className="mt-1.5 space-y-1.5">
          {[
            ['استرداد حجز — مزرعة الفرات', '+ ٧٥٬٠٠٠', true],
            ['شحن المحفظة', '+ ٢٠٠٬٠٠٠', true],
            ['حجز — فندق الرافدين', '− ١٥٠٬٠٠٠', false],
          ].map(([label, amount, positive]) => (
            <div
              key={label as string}
              className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2"
            >
              <span className="text-[8.5px] text-[var(--text-body)]">{label as string}</span>
              <span
                className={`text-[8.5px] font-bold ${positive ? 'text-[var(--brand-text)]' : 'text-[var(--danger)]'}`}
              >
                {amount as string}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const PHONE_SCREENS = {
  explore: ScreenExplore,
  property: ScreenProperty,
  booking: ScreenBooking,
  wallet: ScreenWallet,
} as const;

export type PhoneScreenKey = keyof typeof PHONE_SCREENS;

/** أيقونة شريط علوي للشاشات المدمجة (تُستخدم خارج StatusBar) */
export const ScreenChromeIcons = { Search, MapPin, ChevronLeft };
