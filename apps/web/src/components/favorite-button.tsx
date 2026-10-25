'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { tokenStore } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';

export function FavoriteButton({
  propertyId,
  variant = 'floating',
}: {
  propertyId: string;
  variant?: 'floating' | 'icon';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const ids = useFavorites((s) => s.ids);
  const ensure = useFavorites((s) => s.ensure);
  const toggle = useFavorites((s) => s.toggle);
  const [pop, setPop] = useState(0);

  useEffect(() => {
    ensure();
  }, [ensure]);

  const liked = ids.includes(propertyId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!tokenStore.get()) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    setPop((p) => p + 1);
    await toggle(propertyId);
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={liked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
        className={`btn btn-ghost !px-3 ${liked ? '!text-[var(--brand-text)]' : ''}`}
      >
        <Heart key={pop} className={`h-4 w-4 ${liked ? 'fill-current heart-pop' : ''}`} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={liked ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
      className="absolute left-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/40 bg-black/25 backdrop-blur-sm transition hover:bg-black/40"
    >
      <Heart
        key={pop}
        className={`h-4 w-4 transition ${
          liked ? 'fill-[var(--danger)] text-[var(--danger)] heart-pop' : 'text-white'
        }`}
      />
    </button>
  );
}
