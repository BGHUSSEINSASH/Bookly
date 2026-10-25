import { CalendarDays, MousePointerClick, CreditCard, PartyPopper } from 'lucide-react';
import { Reveal } from './reveal';

const STEPS = [
  {
    icon: CalendarDays,
    num: '١',
    title: 'حدّد التاريخ',
    body: 'اختر أيام إقامتك أو موعد رحلتك — نعرض لك المتاح فورًا بالسعر النهائي.',
  },
  {
    icon: MousePointerClick,
    num: '٢',
    title: 'اختر مكانك',
    body: 'قارن الصور والتقييمات والمميزات، واقرأ تجارب ضيوف سبقوك.',
  },
  {
    icon: CreditCard,
    num: '٣',
    title: 'ادفع بأمان',
    body: 'محفظة بوكلي، بطاقات، آبل باي أو الدفع عند الاستلام — والملخص واضح قبل التأكيد.',
  },
  {
    icon: PartyPopper,
    num: '٤',
    title: 'أكّد واسعد',
    body: 'يصلك التأكيد فورًا، وتظهر حجوزاتك في التطبيق — وإن غيّرت رأيك، استرد فورًا.',
  },
];

export function StepsSection() {
  return (
    <section className="bg-[var(--brand-deep)] py-24 lg:py-32">
      <div className="container-bookly">
        <Reveal className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-clay-200)]">الحجز مع بوكلي</p>
          <h2 className="display-xl mt-4 text-white">
            أربع خطوات فقط.
            <br />
            لا أكثر.
          </h2>
          <p className="mt-5 text-[15px] leading-8 text-white/65">
            صممنا كل خطوة لتكون واضحة ومباشرة — من أول اختيار حتى تأكيد الحجز، بدون تعقيد وبدون رسوم مخفية.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.num} delay={i * 110}>
              <div className="relative border-t border-white/20 pt-6">
                <span className="absolute -top-5 start-0 font-display text-[64px] font-bold leading-none text-white/10">
                  {s.num}
                </span>
                <s.icon className="h-6 w-6 text-[var(--color-clay-200)]" strokeWidth={1.6} />
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-7 text-white/60">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
