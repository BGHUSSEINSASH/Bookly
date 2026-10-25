import type { Metadata, Viewport } from 'next';
import { Readex_Pro, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { BackToTop } from '@/components/back-to-top';
import { SITE_URL } from '@/lib/site';

const readex = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-readex',
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-plex',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bookly — احجز مزرعتك أو فندقك أو رحلتك',
    template: '%s | Bookly',
  },
  description:
    'منصة عربية متكاملة لحجز المزارع والاستراحات والشاليهات والفنادق وشقق الفندقية وتذاكر الطيران وتأجير السيارات والرحلات السياحية.',
  keywords: ['حجز مزارع', 'استراحات', 'شاليهات', 'حجز فنادق', 'تذاكر طيران', 'رحلات'],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Bookly — منصتك للحجز',
    description: 'مزارع، فنادق، طيران، سيارات ورحلات — كلها في مكان واحد.',
    locale: 'ar_IQ',
    type: 'website',
    siteName: 'Bookly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookly — منصتك للحجز',
    description: 'مزارع، فنادق، طيران، سيارات ورحلات — كلها في مكان واحد.',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7FAF9' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1A16' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const noFlash = `
(function(){try{var t=localStorage.getItem('bookly.theme');
if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}}
)();if(window.requestAnimationFrame){requestAnimationFrame(function(){requestAnimationFrame(function(){document.documentElement.classList.add('theme-anim');});});}
`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#org`,
      name: 'Bookly',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Bookly',
      url: SITE_URL,
      inLanguage: 'ar',
      publisher: { '@id': `${SITE_URL}/#org` },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website-ar`,
      name: 'بوكلي — احجز مزرعتك أو فندقك أو رحلتك',
      url: SITE_URL,
      inLanguage: 'ar-IQ',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${readex.variable} ${plex.variable} font-body antialiased`}
        style={
          {
            '--font-display': 'var(--font-readex)',
            '--font-body': 'var(--font-plex)',
          } as React.CSSProperties
        }
      >
        <Providers>
          <SiteHeader />
          <main className="min-h-[70vh]">{children}</main>
          <SiteFooter />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}
