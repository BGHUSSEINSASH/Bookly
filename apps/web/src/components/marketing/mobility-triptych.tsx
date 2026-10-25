import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from './reveal';

const ITEMS = [
  {
    title: 'الطيران',
    body: 'قارن رحلات ٧ شركات طيران، واحجز مقعدك بأسعار مباشرة من التطبيق.',
    href: '/flights',
    cta: 'ابحث عن رحلة',
    img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&h=600&q=80&sat=-14',
  },
  {
    title: 'السيارات',
    body: 'استلم من المطار أو من الفندق — سيارات مع سائق أو بسائق خاص، بأسعار يومية واضحة.',
    href: '/cars',
    cta: 'استأجر سيارة',
    img: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=900&h=600&q=80&sat=-14',
  },
  {
    title: 'الرحلات',
    body: 'تجارب منظّمة ليوم واحد أو أكثر، مع مرشد محلي يعرف كل زاوية.',
    href: '/trips',
    cta: 'اختر رحلة',
    img: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&h=600&q=80&sat=-14',
  },
];

export function MobilityTriptych() {
  return (
    <section className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-20 lg:py-28">
      <div className="container-bookly">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">تنقّل بلا تعقيد</p>
          <h2 className="display-xl mt-3 text-[var(--text-strong)]">
            من باب منزلك
            <br />
            حتى وجهتك.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 90}>
              <Link
                href={item.href}
                className="group block overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-page)] transition-all hover:-translate-y-1 hover:shadow-e3"
              >
                <div className="relative aspect-[3/2] overflow-hidden bg-[var(--bg-soft)]">
                  <Image
                    src={item.img}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="photo-warm object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                  <h3 className="absolute bottom-4 right-5 font-display text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-[13.5px] leading-7 text-[var(--text-muted)]">{item.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--brand-text)]">
                    {item.cta}
                    <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
