import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Video, Images, ArrowLeft } from 'lucide-react';
import { formatMoney, CATEGORY_LABELS } from '@/lib/format';
import { FavoriteButton } from '@/components/favorite-button';

export interface PropertyCardData {
  id: string;
  slug: string;
  title: string;
  category: string;
  pricePerNight: number;
  currency: string;
  ratingAvg: number;
  ratingCount: number;
  images: string[];
  city?: { nameAr: string; nameEn: string };
  maxGuests?: number;
  bedrooms?: number;
  areaSqm?: number;
  bookingMode?: string;
  hasVideo?: boolean;
  isInstantBook?: boolean;
  vendor?: { companyName: string };
  badgeLabel?: string | null;
  negotiable?: boolean;
  highlights?: string[];
}

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const image = property.images?.[0];
  const category = CATEGORY_LABELS[property.category] ?? property.category;
  const facts = [
    property.bedrooms ? `${property.bedrooms} غرف` : null,
    property.maxGuests ? `${property.maxGuests} ضيوف` : null,
    property.areaSqm ? `${property.areaSqm} م²` : null,
  ].filter(Boolean);

  return (
    <article className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-colors duration-200 hover:border-[var(--border-strong)]">
      <FavoriteButton propertyId={property.id} />
      <Link href={`/property/${property.slug}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-soft)]">
        {image ? (
          <Image
            src={image}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
            className="photo-warm object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-[var(--text-muted)]">لا توجد صورة</div>
        )}

        <span className="pill pill-glass absolute bottom-2.5 right-2.5">
          {property.hasVideo ? (
            <>
              <Video className="h-3 w-3" />
              فيديو
            </>
          ) : (
            <>
              <Images className="h-3 w-3" />
              {property.images?.length ?? 0}
            </>
          )}
        </span>

        {property.isInstantBook ? (
          <span className="pill pill-lime absolute top-2.5 right-2.5">حجز فوري</span>
        ) : null}
      </div>

      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold tracking-wide text-[var(--brand-text)]">{category}</span>
          {property.ratingCount > 0 ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--text-strong)]">
              <Star className="h-3.5 w-3.5 fill-[var(--brass)] text-[var(--brass)]" />
              {Number(property.ratingAvg ?? 0).toFixed(1)}
              <span className="font-normal text-[var(--text-faint)]">({property.ratingCount})</span>
            </span>
          ) : null}
        </div>

        <h3 className="mt-1.5 line-clamp-2 font-display text-[15px] font-semibold leading-snug text-[var(--text-strong)]">
          {property.title}
        </h3>

        <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <MapPin className="h-3 w-3" />
          {property.city?.nameAr ?? 'العراق'}
          {facts.length ? <span className="text-[var(--text-faint)]">·</span> : null}
          <span className="truncate">{facts.join(' · ')}</span>
        </p>

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-[var(--border-subtle)] pt-3">
          <p className="font-display text-[15px] font-semibold text-[var(--text-strong)]">
            {formatMoney(property.pricePerNight, property.currency)}
            <span className="ms-1 text-[11px] font-normal text-[var(--text-muted)]">/ ليلة</span>
          </p>
          {property.vendor?.companyName ? (
            <span className="max-w-[45%] truncate text-[11px] text-[var(--text-muted)]">
              {property.vendor.companyName}
            </span>
          ) : property.negotiable ? (
            <span className="text-[11px] font-medium text-[var(--color-clay-600)]">قابل للتفاوض</span>
          ) : null}
        </div>
      </div>
      </Link>
    </article>
  );
}

/** عنوان قسم — خط طوبي رفيع بدل الشريط العمودي */
export function SectionHeader({
  title,
  subtitle,
  href,
  seeAll = 'عرض الكل',
}: {
  title: string;
  subtitle?: string;
  href?: string;
  seeAll?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <span className="mb-2.5 block h-px w-8 bg-[var(--accent)]" />
        <h2 className="section-title">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group flex shrink-0 items-center gap-1.5 pb-1 text-sm font-medium text-[var(--brand-text)] hover:underline"
        >
          {seeAll}
          <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
