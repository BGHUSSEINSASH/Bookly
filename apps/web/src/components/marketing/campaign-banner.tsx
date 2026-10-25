import Link from 'next/link';
import { Megaphone, ArrowLeft } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { Reveal } from '@/components/marketing/reveal';

type Banner = {
  id: string;
  titleAr?: string;
  subtitleAr?: string;
  imageUrl?: string;
  linkUrl?: string;
};

async function getBanner(): Promise<Banner | null> {
  try {
    const res = await fetch(`${API_URL}/content/banners`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = await res.json();
    const items = (Array.isArray(json) ? json : (json?.data ?? [])) as Banner[];
    return items[0] ?? null;
  } catch {
    return null;
  }
}

export async function CampaignBanner() {
  const banner = await getBanner();
  if (!banner) return null;

  return (
    <section className="container-bookly pt-10">
      <Reveal>
        <div className="relative overflow-hidden rounded-[var(--radius-xl2)] bg-gradient-to-l from-forest-700 to-forest-900 p-6 text-white sm:p-8">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-ink)]">
                <Megaphone className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-lg font-black sm:text-xl">
                  {banner.titleAr ?? 'عرض خاص'}
                </h2>
                {banner.subtitleAr ? (
                  <p className="mt-0.5 text-sm text-white/70">{banner.subtitleAr}</p>
                ) : null}
              </div>
            </div>
            <Link
              href={banner.linkUrl ?? '/search'}
              className="btn btn-lime shrink-0"
            >
              اكتشف العرض
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
