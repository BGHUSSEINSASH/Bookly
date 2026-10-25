import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, MapPin, CalendarDays, Users, SlidersHorizontal, Star } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { CATEGORY_LABELS } from '@/lib/format';

export const metadata: Metadata = {
  title: 'ابحث عن مكان إقامتك',
  description:
    'ابحث في المزارع والاستراحات والشاليهات والفنادق والشقق الفندقية — فلترة بالسعر والمدينة والتقييم والحجز الفوري.',
  alternates: { canonical: '/search' },
};

export const revalidate = 60;

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 60 } });
    const json = await res.json();
    return (json?.data ?? []) as T;
  } catch {
    return [] as unknown as T;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (typeof v === 'string' && v) query[k] = v;
  });

  const [results, cities] = await Promise.all([
    get<any>(`/properties?${new URLSearchParams(query).toString()}`),
    get<any[]>('/properties/cities'),
  ]);

  const items = results?.items ?? results ?? [];
  const total = results?.meta?.total ?? items.length;

  const chips = [
    { key: 'FARM', label: 'مزارع' },
    { key: 'CHALET', label: 'شاليهات' },
    { key: 'REST', label: 'استراحات' },
    { key: 'HOTEL', label: 'فنادق' },
    { key: 'APARTMENT', label: 'شقق فندقية' },
  ];

  return (
    <div className="container-bookly py-8">
      {/* شريط البحث */}
      <div className="card sticky top-16 z-30 mb-6 p-3 shadow-[var(--shadow-e2)]">
        <form id="search-form" action="/search" className="flex flex-col gap-2 sm:flex-row">
          {/* الحفاظ على الفلاتر الحالية عند إرسال نموذج البحث */}
          {(['category', 'minRating', 'instantBook'] as const).map((k) =>
            query[k] ? <input key={k} type="hidden" name={k} value={query[k]} /> : null,
          )}
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-[var(--bg-soft)] px-4">
            <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              name="q"
              defaultValue={query.q ?? ''}
              placeholder="ابحث عن مزرعة، فندق، رحلة…"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--ink-300)]"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-soft)] px-4 sm:w-52">
            <MapPin className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <select
              name="cityId"
              defaultValue={query.cityId ?? ''}
              className="w-full bg-transparent py-3 text-sm outline-none"
            >
              <option value="">كل المدن</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameAr}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-soft)] px-4 sm:w-44">
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              name="checkIn"
              type="date"
              defaultValue={query.checkIn ?? ''}
              className="w-full bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-[var(--bg-soft)] px-4 sm:w-28">
            <Users className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <input
              name="guests"
              type="number"
              min={1}
              defaultValue={query.guests ?? ''}
              placeholder="الضيوف"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--ink-300)]"
            />
          </div>
          <button type="submit" className="btn btn-primary sm:px-7">
            <Search className="h-4 w-4" />
            بحث
          </button>
        </form>

        {/* شرائح الفئات */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          <Link
            href="/search"
            className={!query.category ? 'chip chip-active' : 'chip'}
          >
            الكل
          </Link>
          {chips.map((c) => (
            <Link
              key={c.key}
              href={`/search?category=${c.key}`}
              className={query.category === c.key ? 'chip chip-active' : 'chip'}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* الفلاتر الجانبية */}
        <aside className="hidden lg:block">
          <FilterSidebar cities={cities} query={query} />
        </aside>

        {/* النتائج */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-strong)]">{total}</span> نتيجة
            </p>
            <Link href="/search" className="btn btn-soft lg:hidden">
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="card grid place-items-center p-16 text-center">
              <p className="font-display text-lg font-bold text-[var(--text-strong)]">
                لا توجد نتائج مطابقة
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                جرّب توسيع نطاق السعر أو تغيير المدينة
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/property/${p.slug}`}
                  className="group block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-e1)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-e3)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
                    {p.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : null}
                    <span className="pill pill-forest absolute right-2.5 top-2.5">
                      {CATEGORY_LABELS[p.category] ?? p.category}
                    </span>
                    <span className="pill pill-glass absolute bottom-2.5 right-2.5">
                      {p.images?.length ?? 0}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-display text-lg font-extrabold text-[var(--brand-text)]">
                        {new Intl.NumberFormat('ar-IQ').format(p.pricePerNight)} د.ع
                      </span>
                      {p.vendor?.companyName ? (
                        <span className="pill pill-teal max-w-[120px] truncate">
                          {p.vendor.companyName}
                        </span>
                      ) : null}
                    </div>
                    {p.city ? (
                      <p className="mt-1 flex items-center gap-1 text-[11.5px] text-[var(--text-muted)]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {p.city.nameAr}
                      </p>
                    ) : null}
                    <h3 className="mt-1 line-clamp-1 font-display text-[15px] font-bold text-[var(--text-strong)]">
                      {p.title}
                    </h3>
                    <div className="my-3 h-px bg-[var(--border-subtle)]" />
                    <div className="grid grid-cols-3 divide-x divide-x-[var(--border-subtle)] divide-x-reverse">
                      {[
                        { v: p.bedrooms ?? 0, l: 'غرف' },
                        { v: p.maxGuests ?? 0, l: 'ضيوف' },
                        { v: p.areaSqm ?? 0, l: 'م²' },
                      ].map((s) => (
                        <div key={s.l} className="flex flex-col items-center gap-0.5">
                          <span className="font-display text-sm font-bold text-[var(--text-strong)]">
                            {s.v}
                          </span>
                          <span className="text-[10.5px] text-[var(--text-muted)]">{s.l}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-bold text-[var(--text-strong)]">
                        <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
                        {Number(p.ratingAvg ?? 0).toFixed(1)}
                        <span className="font-normal text-[var(--ink-300)]">({p.ratingCount ?? 0})</span>
                      </span>
                      {p.isInstantBook ? (
                        <span className="pill pill-lime !text-[10px]">حجز فوري</span>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSidebar({
  cities,
  query,
}: {
  cities: any[];
  query: Record<string, string>;
}) {
  const chips = [
    { key: 'FARM', label: 'مزارع' },
    { key: 'CHALET', label: 'شاليهات' },
    { key: 'REST', label: 'استراحات' },
    { key: 'HOTEL', label: 'فنادق' },
    { key: 'APARTMENT', label: 'شقق' },
  ];

  return (
    <div className="card sticky top-32 space-y-5 p-4">
      <div className="flex items-center gap-2">
        <span className="accent-bar" />
        <h3 className="font-display text-base font-bold text-[var(--text-strong)]">الفلاتر</h3>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--text-body)]">الفئة</h4>
        <div className="flex flex-wrap gap-1.5">
          <Link href="/search" className={!query.category ? 'chip chip-active' : 'chip'}>
            الكل
          </Link>
          {chips.map((c) => (
            <Link
              key={c.key}
              href={`/search?category=${c.key}`}
              className={query.category === c.key ? 'chip chip-active' : 'chip'}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--text-body)]">المدينة</h4>
        <div className="flex flex-wrap gap-1.5">
          {cities.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              href={`/search?cityId=${c.id}`}
              className={query.cityId === c.id ? 'chip chip-active' : 'chip'}
            >
              {c.nameAr}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--text-body)]">السعر (د.ع)</h4>
        <div className="flex items-center gap-2">
          <input
            form="search-form"
            name="minPrice"
            type="number"
            min={0}
            defaultValue={query.minPrice ?? ''}
            placeholder="من"
            className="input !py-2"
          />
          <span className="text-[var(--ink-300)]">—</span>
          <input
            form="search-form"
            name="maxPrice"
            type="number"
            min={0}
            defaultValue={query.maxPrice ?? ''}
            placeholder="إلى"
            className="input !py-2"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--text-body)]">التقييم</h4>
        <div className="flex flex-wrap gap-1.5">
          {[3, 4, 4.5].map((r) => (
            <Link
              key={r}
              href={`/search?minRating=${r}`}
              className={query.minRating === String(r) ? 'chip chip-active' : 'chip'}
            >
              {r}★ فأكثر
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold text-[var(--text-body)]">خيارات</h4>
        <Link
          href="/search?instantBook=true"
          className={query.instantBook === 'true' ? 'chip chip-active' : 'chip'}
        >
          حجز فوري فقط
        </Link>
      </div>

      <Link href="/search" className="btn btn-ghost w-full !text-xs">
        مسح كل الفلاتر
      </Link>
    </div>
  );
}
