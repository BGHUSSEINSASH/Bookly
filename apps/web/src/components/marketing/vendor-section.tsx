import Link from 'next/link';
import { ArrowLeft, TrendingUp, CalendarCheck, Banknote } from 'lucide-react';
import { PhoneFrame } from './phone-frame';
import { Reveal } from './reveal';

/* لوحة المورّع المصغّرة داخل الهاتف */
function VendorScreen() {
  return (
    <div className="flex h-full flex-col bg-[var(--bg-page)]">
      <div className="flex items-center justify-between px-6 pt-4 pb-1 text-[11px] font-semibold text-[var(--text-strong)]">
        <span>٩:٤١</span>
        <span>لوحة المورّد</span>
      </div>
      <div className="px-4 pt-2">
        <p className="text-[9px] text-[var(--text-muted)]">أرباح هذا الشهر</p>
        <p className="mt-0.5 font-display text-[17px] font-bold text-[var(--brand-text)]">١٬٤٥٠٬٠٠٠ د.ع</p>
        <div className="mt-2 rounded-xl bg-[var(--brand)] p-3 text-white">
          <p className="text-[8.5px] text-white/70">مزرعة الفرات</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[8.5px] text-white/70">حجوزات أكتوبر</span>
            <span className="font-display text-[12px] font-bold">١٢</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[8.5px] text-white/70">نسبة الإشغال</span>
            <span className="font-display text-[12px] font-bold">٧٨٪</span>
          </div>
        </div>
        <p className="mt-3 text-[8.5px] font-bold text-[var(--text-muted)]">حجوزات قادمة</p>
        <div className="mt-1.5 space-y-1.5">
          {[
            ['٢٤ أكتوبر — عائلة الحسن', 'مؤكد'],
            ['٢٨ أكتوبر — مجموعة صدام', 'بانتظار الدفع'],
          ].map(([label, status]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 py-2"
            >
              <span className="text-[8.5px] text-[var(--text-body)]">{label}</span>
              <span className="rounded bg-[var(--brand-soft)] px-1.5 py-0.5 text-[7.5px] font-bold text-[var(--brand-text)]">
                {status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PERKS = [
  { icon: TrendingUp, title: 'عمولة ثابتة ١٢٪', desc: 'لا اشتراك شهري ولا رسوم إعداد — تدفع فقط عند الحجز الفعلي.' },
  { icon: CalendarCheck, title: 'تقويم تحت سيطرتك', desc: 'حدّد الأسعار والتواريخ المتاحة، وأغلق التقويم متى شئت.' },
  { icon: Banknote, title: 'تحويلات فورية', desc: 'أرباحك تصل إلى محفظتك فور تأكيد الحجز، واسحبها متى شئت.' },
];

export function VendorSection() {
  return (
    <section className="border-b border-[var(--border-subtle)] py-20 lg:py-28">
      <div className="container-bookly grid items-center gap-14 lg:grid-cols-[1fr_0.85fr] lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">للمورّدين</p>
            <h2 className="display-xl mt-3 max-w-lg text-[var(--text-strong)]">
              عندك مزرعة أو شقة؟
              <br />
              اجعلها مصدر دخل.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-8 text-[var(--text-muted)]">
              انضم إلى بوكلي واعرض عقارك أمام آلاف الضيوف الجاهزين للحجز — بنشر مجاني،
              ولوحة تحكم تتابع فيها كل حجز وأرباحك لحظة بلحظة.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={i * 110}>
                <div className="border-t border-[var(--border-strong)] pt-5">
                  <p.icon className="h-5 w-5 text-[var(--brand)]" strokeWidth={1.7} />
                  <h3 className="mt-3 font-display text-[15px] font-semibold text-[var(--text-strong)]">{p.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-6 text-[var(--text-muted)]">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={250}>
            <Link href="/login?mode=register" className="btn btn-primary mt-10 !px-6 !py-3 !text-[15px]">
              أضف عقارك مجانًا
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={200} className="flex justify-center lg:justify-end">
          <PhoneFrame>
            <div className="phone-app-screen is-active">
              <VendorScreen />
            </div>
          </PhoneFrame>
        </Reveal>
      </div>
    </section>
  );
}
