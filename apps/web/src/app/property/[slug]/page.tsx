import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, MapPin, Check, Phone, MessageCircle, ArrowRight, Eye, CalendarDays } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney, AMENITY_LABELS, CATEGORY_LABELS } from '@/lib/format';
import { PropertyCard, type PropertyCardData } from '@/components/property-card';
import { BookingBox, BookingGuardCard } from '@/components/booking-box';
import { CopyPhoneButton } from '@/components/copy-phone-button';
import { FavoriteButton } from '@/components/favorite-button';
import { ShareButton } from '@/components/share-button';
import { ReviewForm } from '@/components/review-form';
import { GalleryLightbox } from '@/components/gallery-lightbox';
import { Breadcrumbs } from '@/components/breadcrumbs';

export const dynamic = 'force-dynamic';

// Next قد يمرّر المسار مرمّزًا (%D9%85…) أو مفكوكًا — نفكّ بأمان في الحالتين
const decodeSlug = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

async function getProperty(slug: string) {
  const res = await fetch(`${API_URL}/properties/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json?.data ?? null;
}

async function getSimilar(id: string) {
  try {
    const res = await fetch(`${API_URL}/properties?limit=4&exclude=${id}`, {
      next: { revalidate: 60 },
    });
    const json = await res.json();
    return (json?.data?.items ?? []) as PropertyCardData[];
  } catch {
    return [] as PropertyCardData[];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const property = await getProperty(decodeSlug(rawSlug));
  if (!property) return { title: 'العقار غير موجود' };
  return {
    title: property.title,
    description: property.summary ?? property.description?.slice(0, 160),
    openGraph: { images: property.images?.[0] ? [property.images[0]] : [] },
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = await params;
  const property = await getProperty(decodeSlug(rawSlug));
  if (!property) notFound();

  const similar = await getSimilar(property.id);
  const images = property.images ?? [];
  const category = CATEGORY_LABELS[property.category] ?? property.category;

  const specs = [
    { label: 'نوع العقار', value: category },
    { label: 'عدد الغرف', value: String(property.bedrooms ?? 0) },
    { label: 'عدد الضيوف', value: String(property.maxGuests ?? 0) },
    { label: 'المساحة', value: `${property.areaSqm ?? 0} م²` },
    { label: 'عدد الحمّامات', value: String(property.bathrooms ?? 0) },
    { label: 'نوع الحجز', value: property.isInstantBook ? 'فوري' : 'بموافقة' },
  ];

  return (
    <div className="container-bookly py-6">
      {/* الترويسة */}
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/search"
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-subtle)] transition hover:border-[var(--brand)]"
        >
          <ArrowRight className="h-4 w-4 text-[var(--text-body)]" />
        </Link>
        <Breadcrumbs
          items={[
            { label: category, href: `/search?category=${property.category}` },
            { label: property.title },
          ]}
        />
        <div className="ms-auto flex gap-2">
          <ShareButton />
          <FavoriteButton propertyId={property.id} variant="icon" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {/* المعرض */}
          <div className="group">
            <GalleryLightbox images={images} title={property.title} />
          </div>

          {/* السعر والشارات */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="font-display text-2xl font-black text-[var(--brand-text)]">
              {formatMoney(property.pricePerNight, property.currency)}
            </span>
            <span className="text-sm text-[var(--text-muted)]">لليلة</span>
            {property.negotiable ? (
              <span className="pill pill-amber">سعر قابل للتفاوض</span>
            ) : null}
            <span className="pill pill-forest">{category}</span>
            {property.isInstantBook ? (
              <span className="pill pill-lime">حجز فوري</span>
            ) : null}
          </div>

          {/* العنوان */}
          <h1 className="mt-3 font-display text-2xl font-black text-[var(--text-strong)] sm:text-3xl">
            {property.title}
          </h1>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
            <MapPin className="h-4 w-4" />
            {property.city?.nameAr} — {property.city?.nameEn}
          </p>

          {/* بيانات سريعة */}
          <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-[var(--text-body)]">
            <span className="flex items-center gap-1 font-bold">
              <Star className="h-4 w-4 fill-[var(--brass)] text-[var(--brass)]" />
              {Number(property.ratingAvg ?? 0).toFixed(1)}
              <span className="font-normal text-[var(--ink-300)]">
                ({property.ratingCount ?? 0} تقييم)
              </span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-[var(--text-muted)]" />
              {property.viewsCount ?? 0} مشاهدة
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
              آخر تحديث اليوم
            </span>
          </div>

          {/* جدول المواصفات */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
            <div className="grid grid-cols-2 sm:grid-cols-3">
              {specs.map((s) => (
                <div
                  key={s.label}
                  className="border-b border-l border-[var(--border-subtle)] p-4 last:border-l-0"
                >
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  <p className="mt-0.5 font-display text-sm font-bold text-[var(--text-strong)]">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* الوصف */}
          {property.summary ? (
            <section className="mt-8">
              <h2 className="section-title">الوصف</h2>
              <p className="mt-3 text-[15px] leading-7 text-[var(--text-body)]">
                {property.summary}
              </p>
              {property.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--text-muted)]">
                  {property.description}
                </p>
              ) : null}
            </section>
          ) : null}

          {/* أبرز المميزات */}
          {property.highlights?.length ? (
            <section className="mt-8">
              <h2 className="section-title">أبرز المميزات</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.highlights.map((h: string) => (
                  <span key={h} className="pill pill-outline">
                    <Check className="h-3.5 w-3.5 text-[var(--brand-text)]" />
                    {h}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* المرافق */}
          {property.amenities?.length ? (
            <section className="mt-8">
              <h2 className="section-title">المرافق والخدمات</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {property.amenities.map((a: string) => (
                  <span
                    key={a}
                    className="flex items-center gap-2 rounded-xl bg-[var(--bg-soft)] px-3 py-2.5 text-sm text-[var(--text-body)]"
                  >
                    <Check className="h-4 w-4 shrink-0 text-[var(--brand-text)]" />
                    {AMENITY_LABELS[a] ?? a}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* الغرف */}
          {property.roomTypes?.length ? (
            <section className="mt-8">
              <h2 className="section-title">أنواع الغرف والأسعار</h2>
              <div className="mt-3 space-y-3">
                {property.roomTypes.map((room: any) => (
                  <div
                    key={room.id}
                    className="card flex flex-wrap items-center justify-between gap-4 p-4"
                  >
                    <div>
                      <h3 className="font-display text-base font-bold text-[var(--text-strong)]">
                        {room.name}
                      </h3>
                      <p className="mt-0.5 text-sm text-[var(--text-muted)]">
                        {room.bedType} · حتى {room.maxGuests} ضيوف
                        {room.breakfastIncluded ? ' · شامل الإفطار' : ''}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-display text-lg font-extrabold text-[var(--brand-text)]">
                        {formatMoney(room.pricePerNight, room.currency)}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">/ ليلة</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* التقييمات */}
          {property.reviews?.length ? (
            <section className="mt-8">
              <h2 className="section-title">التقييمات ({property.reviews.length})</h2>
              <div className="mt-3 grid gap-4 lg:grid-cols-[260px_1fr]">
                <div className="card grid place-items-center p-6 text-center">
                  <p className="font-display text-4xl font-black text-[var(--brand-text)]">
                    {Number(property.ratingAvg ?? 0).toFixed(1)}
                  </p>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(property.ratingAvg ?? 0)
                            ? 'fill-[var(--brass)] text-[var(--brass)]'
                            : 'text-[var(--ink-200)]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    {property.ratingCount ?? 0} تقييم
                  </p>
                </div>
                <div className="space-y-3">
                  {property.reviews.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="card p-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-soft)] font-display text-sm font-bold text-[var(--brand-text)]">
                          {(r.customer?.fullName ?? 'ع').charAt(0)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[var(--text-strong)]">
                            {r.customer?.fullName}
                          </p>
                          <div className="flex gap-0.5">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="h-3 w-3 fill-[var(--brass)] text-[var(--brass)]"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {r.comment ? (
                        <p className="mt-2.5 text-sm leading-6 text-[var(--text-body)]">{r.comment}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* نموذج التقييم */}
          <section className="mt-8">
            <h2 className="section-title">تقييمك يفرق</h2>
            <div className="mt-3">
              <ReviewForm propertyTitle={property.title} />
            </div>
          </section>

          {/* المزوّد */}
          <section className="mt-8">
            <h2 className="section-title">معلومات المزوّد</h2>
            <div className="card mt-3 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--brand-soft)] font-display text-lg font-bold text-[var(--brand-text)]">
                  {(property.vendor?.companyName ?? 'م').charAt(0)}
                </span>
                <div className="flex-1">
                  <p className="font-display text-base font-bold text-[var(--text-strong)]">
                    {property.vendor?.companyName}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">مزوّد خدمات معتمد</p>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-[var(--brass)] text-[var(--brass)]" />
                  {Number(property.vendor?.ratingAvg ?? 0).toFixed(1)}
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <a
                  href={`https://wa.me/${(property.vendor?.phone ?? '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary col-span-full sm:col-span-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  محادثة فورية
                </a>
                <a href={`tel:${property.vendor?.phone ?? ''}`} className="btn btn-outline">
                  <Phone className="h-4 w-4" />
                  اتصال
                </a>
                <CopyPhoneButton phone={property.vendor?.phone} />
              </div>
            </div>
          </section>

          {/* عقارات مشابهة */}
          {similar.length ? (
            <section className="mt-10">
              <h2 className="section-title">عقارات مشابهة</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {similar.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* ─────── شريط الحجز ─────── */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <BookingBox property={property} />
          <BookingGuardCard />
        </aside>
      </div>
    </div>
  );
}
