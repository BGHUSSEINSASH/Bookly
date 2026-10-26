import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  MapPin,
  CalendarDays,
  ArrowLeft,
  Star,
  Sprout,
  Building2,
  Home,
  Umbrella,
  Plane,
  Car,
  Compass,
  Building,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { PropertyCard, type PropertyCardData, SectionHeader } from '@/components/property-card';
import { CityCard } from '@/components/city-card';
import { formatMoney, CATEGORY_LABELS } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'استكشف',
  description: 'تصفّح المزارع والفنادق والشاليهات والرحلات والسيارات في العراق — عروض حقيقية وأسعار واضحة.',
  alternates: { canonical: '/explore' },
};

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    const json = await res.json();
    const d = json?.data ?? [];
    // المغلف يعود أحيانًا {items, meta} — نوحّد المخرجات إلى مصفوفة
    return (Array.isArray(d) ? d : (d?.items ?? [])) as T;
  } catch {
    return [] as unknown as T;
  }
}

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&h=1500&q=80&sat=-12&exp=4';

const CATEGORIES = [
  { label: 'مزارع', icon: Sprout, href: '/search?category=FARM' },
  { label: 'فنادق', icon: Building2, href: '/search?category=HOTEL' },
  { label: 'شاليهات', icon: Home, href: '/search?category=CHALET' },
  { label: 'استراحات', icon: Umbrella, href: '/search?category=REST' },
  { label: 'طيران', icon: Plane, href: '/flights' },
  { label: 'سيارات', icon: Car, href: '/cars' },
  { label: 'رحلات', icon: Compass, href: '/trips' },
  { label: 'شقق', icon: Building, href: '/search?category=APARTMENT' },
];

const ARTICLES = [
  {
    title: 'ثلاث مزارع قريبة من بغداد تكفي لعطلة نهاية الأسبوع',
    body: 'مسافة أقل من ساعة، مسبح خاص، وشواء عائلي. جمعنا خيارات جرّبناها بأنفسنا.',
    image: 'photo-1488646953014-85cb44e25828',
    date: '١٢ أكتوبر',
  },
  {
    title: 'كيف تختار فندقًا في وسط المدينة دون أن تدفع أكثر؟',
    body: 'ثلاث قواعد بسيطة توفّر عليك ليلة كاملة: احجز منتصف الأسبوع، قارن الإفطار، واقرأ آخر عشر مراجعات.',
    image: 'photo-1555396273-367ea4eb4db5',
    date: '٨ أكتوبر',
  },
  {
    title: 'رحلة يوم واحد إلى الأهوار: ماذا تأخذ معك؟',
    body: 'دليل عملي خفيف: مواعيد القوارب، أفضل وقت للتصوير، وما لا تحتاجه فعلًا في حقيبتك.',
    image: 'photo-1547592180-85f173990554',
    date: '٢ أكتوبر',
  },
];

export default async function ExplorePage() {
  const [latest, farms, hotels, trips, banners, cities] = await Promise.all([
    get<PropertyCardData[]>('/properties/deals?limit=6'),
    get<PropertyCardData[]>('/properties/featured?limit=6'),
    get<PropertyCardData[]>('/properties?category=HOTEL&limit=6'),
    get<any[]>('/trips?limit=6'),
    get<any[]>('/content/banners'),
    get<any[]>('/properties/cities'),
  ]);

  const heroImage = banners?.[0]?.imageUrl || HERO_FALLBACK;
  const spotlight = latest[0] ?? farms[0];
  const spotlightRest = [...latest.slice(1), ...farms].filter((p) => p.id !== spotlight?.id).slice(0, 2);
  const heroCaption = farms[0] ?? latest[1];

  return (
    <>
      {/* ═══════════ مسار التنقّل ═══════════ */}
      <div className="border-b border-[var(--border-subtle)]">
        <div className="container-bookly flex items-center gap-1.5 py-2.5 text-[12px] text-[var(--text-muted)]">
          <Link href="/" className="transition hover:text-[var(--text-strong)]">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3 w-3" />
          <span className="text-[var(--text-body)]">استكشف</span>
        </div>
      </div>

      {/* ═══════════ الهيرو ═══════════ */}
      <section className="border-b border-[var(--border-subtle)]">
        <div className="container-bookly grid items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-16">
          <div>
            <p className="eyebrow">مزارع · فنادق · رحلات</p>
            <h1 className="mt-4 font-display text-[2.1rem] font-semibold leading-[1.28] tracking-tight text-[var(--text-strong)] sm:text-[2.9rem]">
              احجز مكانًا
              <br />
              يُشبهك.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-8 text-[var(--text-muted)]">
              من مزارع الأطراف الهادئة إلى فنادق وسط المدينة — احجز مباشرة، ادفع بأمان،
              واسترد فورًا إن تغيّرت خططك.
            </p>

            <form
              action="/search"
              className="mt-7 grid overflow-hidden rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] sm:grid-cols-[1.3fr_1fr_1fr_auto]"
            >
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 sm:border-b-0 sm:border-e">
                <Search className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
                <input
                  name="q"
                  placeholder="مزرعة، فندق، شاليه…"
                  className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-[var(--text-faint)]"
                />
              </div>
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 sm:border-b-0 sm:border-e">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
                <select name="cityId" className="w-full bg-transparent py-3.5 text-sm outline-none" defaultValue="">
                  <option value="">كل المدن</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-4 sm:border-b-0">
                <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-faint)]" />
                <input
                  name="checkIn"
                  type="date"
                  className="w-full bg-transparent py-3.5 text-[13px] outline-none"
                />
              </div>
              <button type="submit" className="btn btn-primary !rounded-none !px-7 !py-3.5">
                <Search className="h-4 w-4" />
                ابحث
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-muted)]">
              <span className="text-[var(--text-faint)]">اقتراحات:</span>
              {[
                ['نهاية الأسبوع', '/search?sortBy=POPULAR'],
                ['عروض العيد', '/search?sortBy=PRICE_ASC'],
                ['إطلالة على الماء', '/search?category=REST'],
                ['رحلة يوم واحد', '/trips'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="transition hover:text-[var(--text-strong)] hover:underline">
                  {label}
                </Link>
              ))}
            </div>

            <p className="mt-7 flex items-center gap-2 text-xs text-[var(--text-faint)]">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                <span className="font-semibold text-[var(--text-body)]">٤٫٨</span>
                من أكثر من ٩٠٠ تقييم
              </span>
              <span>·</span>
              <span>أكثر من ٣٬٢٠٠ حجز مؤكد هذا الموسم</span>
            </p>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-[var(--border-subtle)] bg-[var(--bg-soft)] sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src={heroImage}
                alt="مزرعة على الماء"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="photo-warm object-cover"
              />
            </div>
            {heroCaption ? (
              <div className="absolute bottom-4 right-4 left-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 p-3.5 backdrop-blur sm:left-auto sm:max-w-[260px]">
                <p className="text-[10.5px] font-semibold tracking-wide text-[var(--brand-text)]">
                  {CATEGORY_LABELS[heroCaption.category] ?? heroCaption.category} · {heroCaption.city?.nameAr ?? 'العراق'}
                </p>
                <p className="mt-1 line-clamp-2 font-display text-sm font-semibold text-[var(--text-strong)]">
                  {heroCaption.title}
                </p>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  {formatMoney(heroCaption.pricePerNight, heroCaption.currency)}
                  <span> / ليلة</span>
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ═══════════ الفئات ═══════════ */}
      <section className="border-b border-[var(--border-subtle)]">
        <div className="container-bookly grid grid-cols-4 gap-x-2 gap-y-5 py-5 sm:grid-cols-8">
          {CATEGORIES.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group flex items-center justify-center gap-2 text-[13px] font-medium text-[var(--text-body)] transition hover:text-[var(--brand-text)] sm:flex-col sm:gap-1.5"
            >
              <c.icon className="h-[18px] w-[18px] text-[var(--text-muted)] transition group-hover:text-[var(--brand-text)]" strokeWidth={1.7} />
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ مختارات الأسبوع ═══════════ */}
      {spotlight ? (
        <section className="container-bookly pt-12">
          <SectionHeader title="مختارات هذا الأسبوع" subtitle="اختيار الفريق من عقارات حقيقية" href="/search" />
          <div className="grid gap-5 lg:grid-cols-3">
            <Link
              href={`/property/${spotlight.slug}`}
              className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] lg:col-span-2 lg:row-span-2"
            >
              <div className="relative aspect-[16/11] lg:h-full lg:min-h-[420px]">
                {spotlight.images?.[0] ? (
                  <Image
                    src={spotlight.images[0]}
                    alt={spotlight.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="photo-warm object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="text-[11px] font-semibold tracking-wide text-white/75">
                    {CATEGORY_LABELS[spotlight.category] ?? spotlight.category} · {spotlight.city?.nameAr ?? 'العراق'}
                  </p>
                  <h3 className="mt-2 max-w-lg font-display text-2xl font-semibold leading-snug">{spotlight.title}</h3>
                  <div className="mt-3 flex items-center gap-3 text-sm text-white/85">
                    <span className="font-semibold text-white">
                      {formatMoney(spotlight.pricePerNight, spotlight.currency)}
                      <span className="font-normal text-white/70"> / ليلة</span>
                    </span>
                    {spotlight.ratingCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                        {Number(spotlight.ratingAvg).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </Link>

            {spotlightRest.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════ مزارع ═══════════ */}
      {farms.length ? (
        <section className="container-bookly pt-14">
          <SectionHeader
            title="مزارع تختارها العائلات"
            subtitle="مساحات واسعة، مسبح خاص، وهدوء بعيد عن المدينة"
            href="/search?category=FARM"
          />
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {farms.map((p) => (
              <div key={p.id} className="w-[270px] shrink-0 sm:w-[300px]">
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════ وجهات ═══════════ */}
      {cities.length ? (
        <section className="container-bookly pt-14">
          <SectionHeader title="وجهات قريبة" subtitle="ابدأ من مدينة تعرفها" href="/search" />
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
            {cities.map((c) => (
              <CityCard key={c.id} name={c.nameAr} slug={c.slug} count={c._count?.properties} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════ شريط المزوّد ═══════════ */}
      <section className="container-bookly pt-16">
        <div className="overflow-hidden rounded-[14px] bg-[var(--brand)]">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-[var(--color-clay-200)]">
                للمزوّدين
              </p>
              <h2 className="mt-3 max-w-md font-display text-2xl font-semibold leading-snug text-white sm:text-[1.8rem]">
                عندك مزرعة أو شقة؟ اجعلها مصدر دخل.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-white/70">
                أضف عقارك مجانًا، وحدّد أسعارك وتقويمك بنفسك. لا اشتراك شهري — عمولة فقط عند الحجز.
              </p>
              <ul className="mt-5 space-y-2.5">
                {['تقويم وأسعار تحت سيطرتك', 'تحويلات مباشرة إلى محفظتك', 'دعم فريق بوكلي عند كل حجز'].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-white/85">
                    <Check className="h-4 w-4 shrink-0 text-[var(--color-clay-200)]" strokeWidth={2} />
                    {t}
                  </li>
                ))}
              </ul>
              <Link href="/login?mode=register" className="btn btn-primary mt-7 !px-5">
                أضف عقارك
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative min-h-[240px] border-t border-white/10 lg:border-t-0 lg:border-e">
              <Image
                src="https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&w=900&h=900&q=80&sat=-12&exp=4"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="photo-warm object-cover opacity-80"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-lg bg-[var(--bg-surface)] p-4">
                <p className="text-sm leading-6 text-[var(--text-strong)]">
                  «أول حجز وصلني بعد ثلاثة أيام من نشر المزرعة، والتعامل كان أسهل مما توقعت.»
                </p>
                <p className="mt-2 text-[11px] text-[var(--text-muted)]">أم محمد — مزرعة في بغداد</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ رحلات ═══════════ */}
      {trips.length ? (
        <section className="container-bookly pt-16">
          <SectionHeader title="رحلات ليوم واحد أو أكثر" subtitle="تجارب منظّمة مع مرشد محلي" href="/trips" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                href="/trips"
                className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
                  {t.images?.[0] ? (
                    <Image
                      src={t.images[0]}
                      alt={t.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="photo-warm object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}
                  <span className="pill pill-glass absolute top-2.5 right-2.5">
                    {t.durationDays} يوم
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[15px] font-semibold text-[var(--text-strong)]">{t.title}</h3>
                  <p className="mt-1 line-clamp-2 text-[13px] leading-6 text-[var(--text-muted)]">{t.summary}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                    <span className="text-[11px] text-[var(--text-muted)]">{t.city?.nameAr ?? 'العراق'}</span>
                    <span className="font-display text-sm font-semibold text-[var(--text-strong)]">
                      {formatMoney(t.pricePerPerson, t.currency)}
                      <span className="text-[11px] font-normal text-[var(--text-muted)]"> / شخص</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════ فنادق — قائمة تحريرية ═══════════ */}
      {hotels.length ? (
        <section className="container-bookly pt-16">
          <SectionHeader title="فنادق في وسط المدينة" subtitle="قريبون من كل ما تحتاجه" href="/search?category=HOTEL" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotels.slice(0, 6).map((h) => (
              <Link
                key={h.id}
                href={`/property/${h.slug}`}
                className="group flex gap-3.5 rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3 transition-colors hover:border-[var(--border-strong)]"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-[var(--bg-soft)]">
                  {h.images?.[0] ? (
                    <Image
                      src={h.images[0]}
                      alt={h.title}
                      fill
                      sizes="96px"
                      className="photo-warm object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="text-[10.5px] font-semibold tracking-wide text-[var(--brand-text)]">
                    {h.city?.nameAr ?? 'العراق'}
                  </p>
                  <h3 className="mt-1 line-clamp-2 font-display text-[13.5px] font-semibold leading-snug text-[var(--text-strong)]">
                    {h.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="font-display text-[13px] font-semibold text-[var(--text-strong)]">
                      {formatMoney(h.pricePerNight, h.currency)}
                      <span className="text-[10.5px] font-normal text-[var(--text-muted)]"> / ليلة</span>
                    </span>
                    {h.ratingCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] text-[var(--text-body)]">
                        <Star className="h-3 w-3 fill-[var(--brass)] text-[var(--brass)]" />
                        {Number(h.ratingAvg).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ═══════════ مقالات ═══════════ */}
      <section className="container-bookly pt-16">
        <SectionHeader title="دفتر بوكلي" subtitle="ملاحظات ووجهات من فريقنا" />
        <div className="grid gap-6 sm:grid-cols-3">
          {ARTICLES.map((a) => (
            <article key={a.title} className="group">
              <div className="relative aspect-[3/2] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-soft)]">
                <Image
                  src={`https://images.unsplash.com/${a.image}?auto=format&fit=crop&w=800&h=520&q=80&sat=-12&exp=4`}
                  alt={a.title}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="photo-warm object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-3 font-display text-[15px] font-semibold leading-snug text-[var(--text-strong)]">
                {a.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[13px] leading-6 text-[var(--text-muted)]">{a.body}</p>
              <p className="mt-2.5 text-[11px] text-[var(--text-faint)]">
                {a.date} · فريق Bookly
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ خاتمة هادئة ═══════════ */}
      <section className="container-bookly pt-16">
        <div className="flex flex-col items-center gap-3 border-t border-[var(--border-subtle)] pt-10 text-center">
          <p className="font-display text-lg text-[var(--text-strong)]">
            لأن الرحلة تبدأ قبل أن تصل.
          </p>
          <p className="max-w-md text-sm leading-7 text-[var(--text-muted)]">
            نساعدك تختار المكان المناسب، وتصل مطمئنًا، وترجع وأنت تخطّط للرحلة القادمة.
          </p>
        </div>
      </section>
    </>
  );
}
