import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
      <Link href="/" className="hover:text-[var(--brand-text)]">
        الرئيسية
      </Link>
      {items.map((c, i) => (
        <span key={`${c.label}-${i}`} className="flex items-center gap-2">
          <ChevronLeft className="h-3 w-3 text-[var(--ink-200)]" />
          {c.href ? (
            <Link href={c.href} className="truncate hover:text-[var(--brand-text)]">
              {c.label}
            </Link>
          ) : (
            <span className="truncate text-[var(--text-body)]">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
