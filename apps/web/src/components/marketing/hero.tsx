import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { PhoneFrame } from './phone-frame';
import { ScreenExplore } from './phone-screens';
import { Reveal } from './reveal';
import { GlowShift } from './glow-shift';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)]">
      <GlowShift />
      <div className="hero-glow -top-40 -right-32" aria-hidden />
      <div className="hero-glow-clay top-40 -left-24" aria-hidden />

      <div className="container-bookly relative grid items-center gap-16 pt-16 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24 lg:pb-28">
        <div>
          <Reveal delay={100}>
            <p className="eyebrow">مزارع · فنادق · طيران · رحلات</p>
          </Reveal>
          <Reveal delay={200}>
            <h1 className="display-hero mt-5 text-[var(--text-strong)]">
              احجز مكاناً
              <br />
              يشبهك.
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <p className="mt-6 max-w-lg text-[17px] leading-9 text-[var(--text-muted)]">
              من مزرعة هادئة على أطراف بغداد إلى فندق في قلب المدينة — تطبيق واحد يرافقك
              من أول فكرة حتى آخر عودة، بدفع آمن واسترداد فوري.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/explore" className="btn btn-primary !px-6 !py-3 !text-[15px]">
                تصفّح الآن
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <a href="#download" className="btn btn-outline !px-6 !py-3 !text-[15px]">
                حمّل التطبيق
              </a>
            </div>
          </Reveal>
          <Reveal delay={350}>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                <span className="font-semibold text-[var(--text-body)]">٤٫٨</span>
                من أكثر من ٩٠٠ تقييم
              </span>
              <span className="h-3 w-px bg-[var(--border-strong)]" />
              <span>أكثر من ٣٬٢٠٠ حجز مؤكد هذا الموسم</span>
              <span className="h-3 w-px bg-[var(--border-strong)]" />
              <span>استرداد فوري إلى المحفظة</span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={250} className="relative flex justify-center lg:justify-start">
          <div className="absolute inset-0 -m-16 rounded-full bg-[var(--brand-soft)]/70 blur-3xl" aria-hidden />
          <div className="relative lg:rotate-[-3deg] phone-breathe">
            <PhoneFrame>
              <div className="phone-app-screen is-active">
                <ScreenExplore />
              </div>
            </PhoneFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
