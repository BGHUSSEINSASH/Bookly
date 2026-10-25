import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="grid min-h-[240px] place-items-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
      <div>
        <Icon className="mx-auto h-10 w-10 text-[var(--ink-300)]" />
        <p className="mt-3 font-display text-lg font-bold text-[var(--text-strong)]">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
        {actionLabel && actionHref ? (
          <Link href={actionHref} className="btn btn-primary mt-4 inline-flex">
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
