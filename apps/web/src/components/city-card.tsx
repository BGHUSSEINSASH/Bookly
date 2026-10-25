import Image from 'next/image';
import Link from 'next/link';
import { cityImage } from '@/lib/city-images';

export { cityImage };

/** بطاقة مدينة — صورة بلقطة موحّدة واسم كتسمية أسفلها */
export function CityCard({
  name,
  slug,
  count,
}: {
  name: string;
  slug: string;
  count?: number;
}) {
  return (
    <Link href={`/search?city=${encodeURIComponent(slug)}`} className="group block w-40 shrink-0 sm:w-48">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)] bg-[var(--bg-soft)]">
        <Image
          src={cityImage(slug)}
          alt={name}
          fill
          sizes="(max-width: 640px) 160px, 192px"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
        <p className="font-display text-sm font-semibold text-[var(--text-strong)]">{name}</p>
        {count ? <span className="text-[11px] text-[var(--text-muted)]">{count} عقار</span> : null}
      </div>
    </Link>
  );
}
