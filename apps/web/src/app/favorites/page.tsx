'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Skeleton } from '@/components/skeleton';
import { api } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';
import { PropertyCard, type PropertyCardData } from '@/components/property-card';

function toCard(p: any): PropertyCardData {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: p.category,
    pricePerNight: p.pricePerNight,
    currency: p.currency,
    ratingAvg: p.ratingAvg,
    ratingCount: 0,
    images: p.images ?? [],
    city: p.city,
  };
}

export default function FavoritesPage() {
  const { ids, ensure, loaded } = useFavorites();
  const [items, setItems] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensure();
      try {
        const res = await api.get<any[]>('/favorites');
        if (alive) setItems((res ?? []).map((f: any) => toCard(f.property)).filter((p) => p.id));
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ensure]);

  // إن أضاف المستخدم عقارًا من صفحة أخرى أثناء بقائه هنا، نجلبه
  useEffect(() => {
    if (!loaded) return;
    const missing = ids.filter((id) => !items.some((i) => i.id === id));
    if (missing.length === 0) return;
    let alive = true;
    Promise.all(missing.map((id) => api.get(`/properties/${id}`, false).catch(() => null))).then((list) => {
      if (!alive) return;
      setItems((prev) => [...prev, ...list.filter(Boolean).map((p: any) => toCard(p))]);
    });
    return () => {
      alive = false;
    };
  }, [ids, items, loaded]);

  const visible = items.filter((p) => ids.includes(p.id));

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">المفضلة</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            العقارات التي حفظتها للرجوع إليها لاحقًا
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="جارٍ التحميل">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="card overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/5" />
              </div>
            </div>
          ))}
          <span className="sr-only">جارٍ تحميل المفضلة</span>
        </div>
      ) : visible.length === 0 ? (
        <div className="card grid place-items-center p-16 text-center">
          <Heart className="h-10 w-10 text-[var(--ink-300)]" />
          <p className="mt-3 font-display text-lg font-bold text-[var(--text-strong)]">
            قائمة المفضلة فارغة
          </p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            اضغط على القلب في أي عقار لحفظه هنا
          </p>
          <Link href="/search" className="btn btn-primary mt-5">
            تصفّح العقارات
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}
