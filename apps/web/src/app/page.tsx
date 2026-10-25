import { API_URL } from '@/lib/api';
import type { PropertyCardData } from '@/components/property-card';
import { HeroSection } from '@/components/marketing/hero';
import { CategoryRail } from '@/components/marketing/category-rail';
import { PhoneShowcase } from '@/components/marketing/phone-showcase';
import { StepsSection } from '@/components/marketing/steps-section';
import { FeaturedRail } from '@/components/marketing/featured-rail';
import { MobilityTriptych } from '@/components/marketing/mobility-triptych';
import { VendorSection } from '@/components/marketing/vendor-section';
import { Testimonials } from '@/components/marketing/testimonials';
import { DownloadCta } from '@/components/marketing/download-cta';
import { Reveal } from '@/components/marketing/reveal';
import { StatsStrip } from '@/components/marketing/stats-strip';
import { LoyaltySection } from '@/components/marketing/loyalty-section';
import { CampaignBanner } from '@/components/marketing/campaign-banner';

export const revalidate = 60;

export const metadata = {
  title: 'Bookly — احجز مكاناً يشبهك',
  description:
    'بوكلي: مزارع وفنادق وشاليهات ورحلات وطيران وتأجير سيارات في العراق — بحجز واضح، دفع آمن، ومحفظة تُسترد فورًا عند الإلغاء.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Bookly — احجز مكاناً يشبهك',
    description:
      'من مزرعة على أطراف بغداد إلى فندق في قلب المدينة — تطبيق واحد يرافقك من أول فكرة حتى آخر عودة.',
    url: '/',
    siteName: 'Bookly',
    locale: 'ar_IQ',
    type: 'website',
  },
};

async function getFeatured(): Promise<PropertyCardData[]> {
  try {
    const res = await fetch(`${API_URL}/properties/featured?limit=8`, { next: { revalidate: 60 } });
    const json = await res.json();
    const d = json?.data ?? [];
    return (Array.isArray(d) ? d : (d?.items ?? [])) as PropertyCardData[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      <HeroSection />
      <CampaignBanner />
      <CategoryRail />
      <StatsStrip />

      {/* قسم الهاتف المتصدّر */}
      <section className="border-b border-[var(--border-subtle)] py-20 lg:py-28">
        <div className="container-bookly">
          <Reveal className="mb-16 max-w-2xl lg:mb-24">
            <p className="eyebrow">التطبيق</p>
            <h2 className="display-xl mt-3 text-[var(--text-strong)]">
              كل رحلة…
              <br />
              تبدأ من شاشة واحدة.
            </h2>
          </Reveal>
          <PhoneShowcase />
        </div>
      </section>

      <StepsSection />
      <FeaturedRail properties={featured} />
      <LoyaltySection />
      <MobilityTriptych />
      <VendorSection />
      <Testimonials />
      <DownloadCta />
    </>
  );
}
