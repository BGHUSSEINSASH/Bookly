import Link from 'next/link';
import type { Metadata } from 'next';
import { Plane, Search, Luggage, ArrowLeft } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { formatMoney } from '@/lib/format';

export const metadata: Metadata = {
  title: 'حجز تذاكر الطيران',
  description:
    'قارن أسعار الرحلات الداخلية والدولية — السعر، مدة الرحلة، عدد التوقفات وشركة الطيران في مكان واحد.',
  alternates: { canonical: '/flights' },
};

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
    const json = await res.json();
    return (json?.data ?? []) as T;
  } catch {
    return [] as unknown as T;
  }
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function fmtDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} د`;
  if (m === 0) return `${h} س`;
  return `${h} س ${m} د`;
}

const STOPS = ['مباشر', 'توقف واحد', 'توقفان', '٣ توقفات'];

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const fromAirportId = sp.fromAirportId ?? '';
  const toAirportId = sp.toAirportId ?? '';
  const departureDate = sp.departureDate ?? '';
  const passengers = sp.passengers ?? '1';

  const [airports, airlines] = await Promise.all([
    get<any[]>('/flights/airports'),
    get<any[]>('/flights/airlines'),
  ]);

  const canSearch = !!fromAirportId && !!toAirportId && fromAirportId !== toAirportId;
  const flights = canSearch
    ? await get<any[]>(
        `/flights/search?fromAirportId=${fromAirportId}&toAirportId=${toAirportId}` +
          `${departureDate ? `&departureDate=${departureDate}` : ''}&passengers=${passengers}`,
      )
    : [];

  const defaultFrom = fromAirportId || airports[0]?.id || '';
  const defaultTo = toAirportId || airports[1]?.id || defaultFrom;

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start gap-2.5">
        <span className="accent-bar mt-1" />
        <div>
          <h1 className="section-title">حجز تذاكر الطيران</h1>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">
            رحلات داخلية ودولية بأسعار مقارنة — {airlines.length} شركة طيران
          </p>
        </div>
      </div>

      <form action="/flights" className="card mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_120px_auto]">
          <select className="input" name="fromAirportId" defaultValue={defaultFrom}>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                من: {a.city?.nameAr} ({a.iataCode})
              </option>
            ))}
          </select>
          <select className="input" name="toAirportId" defaultValue={defaultTo}>
            {airports.map((a) => (
              <option key={a.id} value={a.id}>
                إلى: {a.city?.nameAr} ({a.iataCode})
              </option>
            ))}
          </select>
          <input
            type="date"
            name="departureDate"
            className="input"
            defaultValue={departureDate}
            aria-label="تاريخ المغادرة"
          />
          <input
            type="number"
            name="passengers"
            min={1}
            max={9}
            defaultValue={passengers}
            className="input"
            aria-label="عدد المسافرين"
          />
          <button type="submit" className="btn btn-primary">
            <Search className="h-4 w-4" />
            بحث
          </button>
        </div>
      </form>

      {canSearch ? (
        <>
          <p className="mb-3 text-sm font-bold text-[var(--text-strong)]">
            {flights.length > 0
              ? `تم العثور على ${flights.length} رحلة`
              : 'لا توجد رحلات مطابقة لتاريخك — جرّب يومًا آخر'}
          </p>
          <div className="grid gap-4">
            {flights.map((f) => {
              const dep = new Date(f.departureTime);
              const checkOut = new Date(dep.getTime() + 24 * 3600 * 1000);
              const iso = (d: Date) =>
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const price = f.prices?.ECONOMY ?? 0;
              return (
                <article key={f.id} className="card flex flex-wrap items-center gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] font-display text-sm font-bold text-[var(--brand-text)]">
                      {f.airline?.iataCode ?? '---'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--text-strong)]">
                        {f.flightNumber} — {f.airline?.nameAr}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {f.from?.cityAr} ({f.from?.iata}) ← {f.to?.cityAr} ({f.to?.iata})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-center">
                    <div>
                      <p className="font-display text-base font-bold text-[var(--text-strong)]">
                        {fmtTime(f.departureTime)}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">{f.from?.iata}</p>
                    </div>
                    <div className="min-w-20">
                      <div className="h-px w-full bg-[var(--border-subtle)]" />
                      <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                        {fmtDuration(f.durationMinutes)}
                      </p>
                    </div>
                    <div>
                      <p className="font-display text-base font-bold text-[var(--text-strong)]">
                        {fmtTime(f.arrivalTime)}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">{f.to?.iata}</p>
                    </div>
                  </div>

                  <span className="chip">
                    {STOPS[f.stops ?? 0] ?? STOPS[0]}
                  </span>
                  {f.baggageAllowance > 0 ? (
                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Luggage className="h-3.5 w-3.5" />
                      {f.baggageAllowance} كجم
                    </span>
                  ) : null}

                  <div className="ms-auto flex items-center gap-4">
                    <div className="text-end">
                      <p className="font-display text-lg font-extrabold text-[var(--brand-text)]">
                        {formatMoney(price, f.currency ?? 'IQD')}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">للمسافر · اقتصادية</p>
                    </div>
                    <Link
                      href={`/checkout?target=FLIGHT&flightId=${f.id}&checkIn=${iso(dep)}&checkOut=${iso(checkOut)}&guests=${passengers}`}
                      className="btn btn-primary !px-4 !py-2 !text-xs"
                    >
                      احجز
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="card grid place-items-center p-16 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-soft)]">
            <Plane className="h-7 w-7 text-[var(--brand-text)]" />
          </span>
          <p className="mt-4 font-display text-lg font-bold text-[var(--text-strong)]">
            اختر مسارك وابحث عن الرحلات
          </p>
          <p className="mt-1 max-w-sm text-sm text-[var(--text-muted)]">
            ستظهر هنا الرحلات مع السعر، مدة الرحلة، عدد التوقفات وشركة الطيران — مع مقارنة فورية بين
            الخيارات.
          </p>
        </div>
      )}
    </div>
  );
}
