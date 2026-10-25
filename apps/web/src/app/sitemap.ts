import type { MetadataRoute } from 'next';
import { API_URL } from '@/lib/api';
import { absoluteUrl } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/search'), changeFrequency: 'daily', priority: 0.9 },
    { url: absoluteUrl('/flights'), changeFrequency: 'daily', priority: 0.7 },
    { url: absoluteUrl('/cars'), changeFrequency: 'daily', priority: 0.7 },
    { url: absoluteUrl('/trips'), changeFrequency: 'daily', priority: 0.7 },
    { url: absoluteUrl('/support'), changeFrequency: 'monthly', priority: 0.3 },
  ];

  let properties: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/properties?limit=100`, { next: { revalidate: 3600 } });
    const json = await res.json();
    const items = (json?.data?.items ?? []) as { slug: string; updatedAt?: string }[];
    properties = items.filter((p) => p.slug).map((p) => ({
      url: absoluteUrl(`/property/${p.slug}`),
      lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // نترك الصفحات الثابتة فقط عند تعذّر الاتصال
  }

  return [...staticPages, ...properties];
}
