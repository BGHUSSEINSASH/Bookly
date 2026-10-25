import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, TrendingUp, ShieldCheck, Wallet, BarChart3, ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'انضم كمزوّد',
  description:
    'أضف مزرعتك أو فندقك أو أسطول سياراتك إلى بوكلي وابدأ باستقبال الحجوزات. لوحة تحكم متكاملة، عمولة عادلة، ودفعات منتظمة.',
  alternates: { canonical: '/vendors' },
};

const PERKS = [
  {
    icon: TrendingUp,
    title: 'زيارات أكثر',
    desc: 'ظهورك في نتائج البحث والصفحة الرئيسية لآلاف المستخدمين الباحثين عن تجربتك يوميًا.',
  },
  {
    icon: BarChart3,
    title: 'لوحة تحكم كاملة',
    desc: 'تابع الحجوزات والإيرادات والتقييمات وتوفر عقارك من مكان واحد بلوحة إحصائيات فورية.',
  },
  {
    icon: Wallet,
    title: 'عمولة عادلة',
    desc: 'تدفع عمولة فقط على الحجوزات المؤكدة، مع تحويلات بنكية منتظمة إلى حسابك.',
  },
  {
    icon: ShieldCheck,
    title: 'دعم متواصل',
    desc: 'فريق نجاح مخصص يساعدك على تحسين صفحتك ورفع نسبة الحجوزات، ودعم فني على مدار الساعة.',
  },
];

export default function VendorsPage() {
  return (
    <div className="container-bookly py-8">
      <Breadcrumbs items={[{ label: 'انضم كمزوّد' }]} />

      <div className="mt-4 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">أضف منشأتك على بوكلي</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            مزارع · استراحات · شاليهات · فنادق · شقق فندقية · سيارات · رحلات
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2">
          {PERKS.map((p) => (
            <div key={p.title} className="card p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
                <p.icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-display text-base font-bold text-[var(--text-strong)]">
                {p.title}
              </h2>
              <p className="mt-1.5 text-sm leading-6 text-[var(--text-muted)]">{p.desc}</p>
            </div>
          ))}
        </div>

        <aside className="card h-fit p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand)] text-white">
            <Building2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 font-display text-lg font-bold text-[var(--text-strong)]">
            ابدأ خلال دقائق
          </h2>
          <ol className="mt-3 space-y-3 text-sm text-[var(--text-muted)]">
            {[
              'سجّل حسابًا واختر «مزوّد».',
              'أضف بيانات منشأتك وصورها وسعرها.',
              'نراجع الطلب خلال 24 ساعة.',
              'يبدأ وصول الحجوزات فورًا.',
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[11px] font-bold text-[var(--brand-text)]">
                  {i + 1}
                </span>
                {t}
              </li>
            ))}
          </ol>
          <Link href="/login?mode=register" className="btn btn-primary mt-5 w-full">
            سجّل كمزوّد
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
            بدون رسوم اشتراك — عمولة فقط على الحجوزات المؤكدة
          </p>
        </aside>
      </div>
    </div>
  );
}
