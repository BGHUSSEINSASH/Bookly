import type { Metadata } from 'next';
import Link from 'next/link';
import { Compass, Users, HeartHandshake, Target } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'عن بوكلي',
  description:
    'بوكلي منصة عربية للحجز تجمع المزارع والاستراحات والفنادق والطيران والرحلات في مكان واحد، بتجربة عربية أصيلة ودفع آمن.',
  alternates: { canonical: '/about' },
};

const VALUES = [
  {
    icon: Compass,
    title: 'البساطة أولًا',
    desc: 'نحذف الخطوات غير الضرورية. من فتح التطبيق إلى تأكيد الحجز، أربع نقرات فقط.',
  },
  {
    icon: Users,
    title: 'الثقة قبل كل شيء',
    desc: 'كل مزوّد مُراجع، وكل صورة حقيقية، وكل تقييم من ضيوف فعلًا حجزوا وعاشوا التجربة.',
  },
  {
    icon: HeartHandshake,
    title: 'الضيافة العربية',
    desc: 'نبني المنتج بلغتك وثقافتك — من تسميات الفئات إلى تفاصيل الاستراحات والقرى السياحية.',
  },
  {
    icon: Target,
    title: 'القيمة العادلة',
    desc: 'أسعار واضحة بلا رسوم مخفية، وعمولة عادلة للمزوّدين، وحماية كاملة للمحجوز.',
  },
];

export default function AboutPage() {
  return (
    <div className="container-bookly py-8">
      <Breadcrumbs items={[{ label: 'عن بوكلي' }]} />

      <div className="mt-4 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">عن بوكلي</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            منصتك العربية للحجز — من المزرعة إلى مطار الوصول
          </p>
        </div>
      </div>

      <section className="card p-6 sm:p-8">
        <p className="text-[15px] leading-8 text-[var(--text-body)]">
          بُني بوكلي لأن الحجز عبر الإنترنت في منطقتنا كان متناثرًا: مزارع على مواقع، فنادق على
          منصات أجنبية، طيران هنا، وسيارات هناك. جمعنا كل ذلك في تجربة عربية واحدة — ببحث واضح،
          ودفع محلي، ومحفظة تُرجع لك حقك فورًا إذا تغيّر خطتك.
        </p>
        <p className="mt-4 text-[15px] leading-8 text-[var(--text-body)]">
          نؤمن أن الرحلة تبدأ قبل الوصول: لذلك سمحنا بالمحادثة المباشرة مع المزوّد، والتقييمات
          الصادقة، والصور الحقيقية — لا صور مخزّنة من الإنترنت.
        </p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {VALUES.map((v) => (
          <div key={v.title} className="card p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <v.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-3 font-display text-base font-bold text-[var(--text-strong)]">
              {v.title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--text-muted)]">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/vendors" className="btn btn-primary">
          انضم كمزوّد
        </Link>
        <Link href="/how-it-works" className="btn btn-outline">
          كيف يعمل بوكلي
        </Link>
        <Link href="/support" className="btn btn-soft">
          تواصل معنا
        </Link>
      </div>
    </div>
  );
}
