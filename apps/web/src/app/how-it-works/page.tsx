import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, CalendarCheck, ShieldCheck, Star, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'كيف يعمل بوكلي',
  description: 'أربع خطوات بسيطة تحجز بها مزرعتك أو فندقك أو رحلتك على بوكلي: ابحث، اختر، ادفع، واستمتع.',
  alternates: { canonical: '/how-it-works' },
};

const STEPS = [
  {
    icon: Search,
    title: 'ابحث واستكشف',
    desc: 'تصفّح المزارع والاستراحات والشاليهات والفنادق والطيران والسيارات والرحلات — مع صور حقيقية وتقييمات موثوقة من ضيوف سابقين.',
  },
  {
    icon: CalendarCheck,
    title: 'اختر التواريخ واحجز',
    desc: 'حدّد تاريخ الوصول والمغادرة وعدد الضيوف. الحجز الفوري يؤكد لحظيًا، والحجز بموافقة يصلك قرار المزوّد خلال ساعات.',
  },
  {
    icon: ShieldCheck,
    title: 'ادفع بأمان',
    desc: 'ادفع من محفظتك أو ببطاقتك. «درع بوكلي» يحمي المبلغ كاملًا حتى تصل للوجهة، وإذا تغيّر خططك يعود لك فورًا.',
  },
  {
    icon: Star,
    title: 'استمتع واكسب',
    desc: 'قيّم تجربتك بعد العودة، واكسب نقاط ولاء مع كل حجز تحوّلها إلى رصيد شراء في رحلاتك القادمة.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container-bookly py-8">
      <Breadcrumbs items={[{ label: 'كيف يعمل بوكلي' }]} />

      <div className="mt-4 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">كيف يعمل بوكلي</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            من البحث إلى الاستمتاع — أربع خطوات فقط
          </p>
        </div>
      </div>

      <div className="relative space-y-6">
        {STEPS.map((s, i) => (
          <div
            key={s.title}
            className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:gap-6"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[var(--brand)] font-display text-2xl font-black text-white">
              {i + 1}
            </span>
            <div>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-[var(--text-strong)]">
                <s.icon className="h-5 w-5 text-[var(--brand)]" />
                {s.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[var(--radius-xl2)] bg-gradient-to-bl from-forest-600 to-forest-900 p-8 text-center text-white">
        <h2 className="font-display text-2xl font-black">جاهز لأول رحلة؟</h2>
        <p className="mt-2 text-sm text-white/70">
          اختر وجهتك من مئات العقارات والرحلات المتوفرة الآن
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/search" className="btn btn-lime">
            ابدأ البحث
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/faq" className="btn bg-white/10 !text-white hover:bg-white/20">
            الأسئلة الشائعة
          </Link>
        </div>
      </div>
    </div>
  );
}
