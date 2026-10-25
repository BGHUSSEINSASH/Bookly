import { API_URL } from '@/lib/api';
import { Reveal } from '@/components/marketing/reveal';
import { Counter } from '@/components/marketing/counter';
import { MapPinned, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';

async function getStats() {
  try {
    const res = await fetch(`${API_URL}/properties?limit=1`, { next: { revalidate: 300 } });
    const p = await res.json();
    const total = p?.data?.total ?? p?.total ?? 0;
    return { properties: Number(total) || 0 };
  } catch {
    return { properties: 0 };
  }
}

export async function StatsStrip() {
  const stats = await getStats();

  const items = [
    {
      icon: MapPinned,
      node: <Counter to={stats.properties || 120} suffix="+" />,
      label: 'وجهة متوفرة',
    },
    {
      icon: CalendarCheck,
      node: <Counter to={50} suffix="K+" />,
      label: 'حجز مكتمل',
    },
    {
      icon: ShieldCheck,
      node: <Counter to={100} suffix="%" />,
      label: 'دفع محمي بدرع بوكلي',
    },
    {
      icon: Sparkles,
      node: <Counter to={4.8} decimals={1} />,
      label: 'متوسط تقييم الضيوف',
    },
  ];

  return (
    <section className="border-y border-[var(--border-subtle)] bg-[var(--bg-surface)] py-14">
      <div className="container-bookly grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 90} className="text-center">
            <s.icon className="mx-auto h-6 w-6 text-[var(--brand)]" strokeWidth={1.7} />
            <p className="mt-3 font-display text-3xl font-black text-[var(--text-strong)]">
              {s.node}
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
