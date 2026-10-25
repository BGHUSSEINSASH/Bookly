import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Wallet, CalendarCheck, Gift } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Accordion } from '@/components/accordion';
import { Reveal } from '@/components/marketing/reveal';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة',
  description:
    'إجابات عن الأسئلة الشائعة في بوكلي: الحجز والدفع والإلغاء والاسترداد، نقاط الولاء، وحساب المزوّدين.',
  alternates: { canonical: '/faq' },
};

const FAQS = [
  {
    q: 'كيف أحجز مزرعة أو شاليه في بوكلي؟',
    a: 'اختر الوجهة من صفحة الاستكشاف أو البحث، حدّد تواريخ الإقامة وعدد الضيوف، ثم اضغط «احجز الآن». ستصلك رسالة فورية بتأكيد الحجز من المزوّد.',
  },
  {
    q: 'ما الفرق بين الحجز الفوري والحجز بموافقة؟',
    a: 'الحجز الفوري يؤكد تلقائيًا لحظة إتمام الدفع، أما الحجز بموافقة فيحتاج موافقة المزوّد خلال ساعات قليلة، وإذا لم يوافق يعود المبلغ كاملًا إلى محفظتك.',
  },
  {
    q: 'كيف أدفع؟ وهل الدفع آمن؟',
    a: 'الدفع يتم عبر محفظتك الرقمية أو بطاقات الائتمان. جميع العمليات مشفّرة ولا نخزّن بيانات بطاقتك، ولديك حماية كاملة من خلال «درع بوكلي».',
  },
  {
    q: 'كيف أسترد مبلغ الحجز عند الإلغاء؟',
    a: 'إذا ألغت ضمن سياسة الإلغاء المجانية، يعود المبلغ فورًا إلى رصيد محفظتك (وليس بطاقة) خلال دقائق، ويمكنك استخدامه في أي حجز آخر.',
  },
  {
    q: 'ما هي نقاط الولاء وكيف أستبدلها؟',
    a: 'تحصل على نقاط مع كل حجز تكتمل. يمكنك متابعة رصيدك من صفحة المحفظة وتحويله إلى رصيد شراء فوري من خلال «استبدال النقاط».',
  },
  {
    q: 'كيف أصبح مزوّدًا على بوكلي؟',
    a: 'سجّل حسابًا واختر «مزوّد»، ثم أضف منشأتك وصورها وسعرها. بعد مراجعة فريقنا خلال 24 ساعة تصبح عقارك متاحًا للحجز ويبدأ وصول الحجوزات.',
  },
  {
    q: 'هل يمكنني التواصل مع المزوّد قبل الحجز؟',
    a: 'نعم، من صفحة العقار يمكنك مراسلته عبر واتساب أو الاتصال به مباشرة، ونسخ رقم هاتفه بضغطة واحدة.',
  },
  {
    q: 'ماذا يعني «درع بوكلي»؟',
    a: 'هو ضمان الحماية الذي يغطي مدفوعاتك: إذا لم يتأكد الحجز أو لم تكن الخدمة كما وُصف، نعيد لك المبلغ كاملًا دون أسئلة.',
  },
];

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <div className="container-bookly py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs items={[{ label: 'الأسئلة الشائعة' }]} />

      <div className="mt-4 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">الأسئلة الشائعة</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            كل ما تحتاج معرفته عن الحجز والدفع والاسترداد
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={i * 50}>
            <Accordion
              title={f.q}
              icon={
                <svg
                  viewBox="0 0 16 16"
                  className="accordion-icon h-4 w-4 shrink-0 text-[var(--brand)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 6l4 4 4-4" />
                </svg>
              }
            >
              {f.a}
            </Accordion>
          </Reveal>
        ))}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ShieldCheck, title: 'درع بوكلي', desc: 'حماية كاملة لمدفوعاتك', href: '/how-it-works' },
          { icon: Wallet, title: 'المحفظة', desc: 'شحن واسترداد فوري', href: '/wallet' },
          { icon: CalendarCheck, title: 'حجوزاتي', desc: 'تابع حجوزاتك لحظة بلحظة', href: '/bookings' },
          { icon: Gift, title: 'نقاط الولاء', desc: 'اكسب نقاطًا مع كل حجز', href: '/account' },
        ].map((c) => (
          <Link key={c.title} href={c.href} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-e2)]">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <c.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--text-strong)]">{c.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
        لم تجد إجابتك؟{' '}
        <Link href="/support" className="font-bold text-[var(--brand-text)] hover:underline">
          تواصل مع الدعم
        </Link>{' '}
        أو اطلب إشعارًا من{' '}
        <Link href="/notifications" className="font-bold text-[var(--brand-text)] hover:underline">
          مركز الإشعارات
        </Link>
        .
      </p>
    </div>
  );
}
