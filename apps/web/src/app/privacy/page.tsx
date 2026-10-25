import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'كيف يجمع بوكلي بياناتك ويستخدمها ويحميها — حقوقك وخياراتك بوضوح.',
  alternates: { canonical: '/privacy' },
};

const SECTIONS = [
  {
    title: 'البيانات التي نجمعها',
    body: 'نجمع الاسم والبريد الإلكتروني ورقم الهاتف عند التسجيل، وبيانات الحجز (التواريخ، عدد الضيوف، تفضيلاتك)، وسجل عمليات المحفظة. لا نخزّن بيانات بطاقتك البنكية — تُعالج لدى مزوّد دفع معتمد.',
  },
  {
    title: 'كيف نستخدم بياناتك',
    body: 'لتأكيد الحجوزات وإرسال إشعارات تحديث الحالة، وتحسين دقة نتائج البحث، وحساب نقاط الولاء، والامتثال لل Regulations المحلية. لا نبيع بياناتك لأي طرف ثالث.',
  },
  {
    title: 'الإشعارات والرسائل',
    body: 'نرسل إشعارات فورية لتأكيد الحجوزات والعروض المهمة فقط. يمكنك إدارة تفضيلاتك من صفحة الإعدادات في أي وقت، وإلغاء الاشتراك من الرسائل التسويقية بضغطة واحدة.',
  },
  {
    title: 'ملفات الارتباط (Cookies)',
    body: 'نستخدم ملفات ارتباط أساسية لتسجيل دخولك وحفظ تفضيلاتك (مثل الوضع الليلي). لا نستخدم ملفات تتبع إعلانية.',
  },
  {
    title: 'حقوقك',
    body: 'يمكنك طلب نسخة من بياناتك أو حذف حسابك نهائيًا من خلال الدعم. عند الحذف، نزيل بياناتك الشخصية ونبقي فقط ما يتطلبه القانون حفظه (سجلات مالية مجمّعة).',
  },
  {
    title: 'أمن المعلومات',
    body: 'جميع البيانات مشفّرة أثناء النقل (TLS) وأثناء التخزين. الوصول مقيد بصلاحيات دقيقة، ويُسجَّل كل إداري يطّلع على بيانات حساسة.',
  },
  {
    title: 'خصوصية الأطفال',
    body: 'الخدمة موجّهة لمن هم فوق 18 عامًا. لا نجمع عن قصد بيانات قاصرين.',
  },
  {
    title: 'التواصل معنا',
    body: 'لأي استفسار حول الخصوصية: support@bookly.app — نرد خلال 48 ساعة عمل.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="container-bookly py-8">
      <Breadcrumbs items={[{ label: 'سياسة الخصوصية' }]} />

      <div className="mt-4 mb-8 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">سياسة الخصوصية</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            آخر تحديث: أكتوبر 2026
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="card p-6">
            <h2 className="font-display text-base font-bold text-[var(--text-strong)]">{s.title}</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
