import { Reveal } from './reveal';

const QUOTES = [
  {
    quote: 'أول مرة أحجز مزرعة أونلاين وأكون مطمئن من أول ثانية — الصور مطابقة، والسعر النهائي هو المذكور.',
    name: 'أم محمد',
    role: 'حجزت مزرعة في بغداد',
  },
  {
    quote: 'ألغيت حجز فندق قبلها بيومين لظرف طارئ، ووصل الاسترداد إلى محفظتي خلال دقائق. هذه ليست وعوداً.',
    name: 'عبدالله الجبوري',
    role: 'مستخدم منذ ٢٠٢٤',
  },
  {
    quote: 'أدير مزرعتي من التطبيق كأنها مكتب محجوزات كامل — التقويم، الأسعار، والحجوزات كلها في شاشة واحدة.',
    name: 'أبو حسين',
    role: 'مورّد — مزرعة في الأنبار',
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-24 lg:py-32">
      <div className="container-bookly">
        <Reveal>
          <p className="eyebrow">قالوا عن بوكلي</p>
        </Reveal>
        <div className="mt-12 grid gap-14 lg:grid-cols-3 lg:gap-10">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i * 90}>
              <figure className="h-full border-t border-[var(--border-strong)] pt-8">
                <blockquote className="font-display text-[19px] font-medium leading-[1.75] tracking-tight text-[var(--text-strong)] lg:text-[21px]">
                  «{q.quote}»
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-display text-sm font-semibold text-[var(--text-strong)]">{q.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-[var(--text-muted)]">{q.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
