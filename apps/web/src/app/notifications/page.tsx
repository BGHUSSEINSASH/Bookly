'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bell, Ban, CalendarCheck, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { EmptyState } from '@/components/empty-state';
import { ListSkeleton } from '@/components/skeleton';
import type { NotificationItem } from '@/components/notification-bell';

const ICONS: Record<string, typeof Bell> = {
  NEW_BOOKING: CalendarCheck,
  BOOKING_UPDATE: CalendarCheck,
  BOOKING_CANCELLED: Ban,
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ar', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ items: NotificationItem[]; unread: number }>(
        '/notifications?limit=100',
      );
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* صامت */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading, load]);

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* صامت */
    }
  };

  const markOne = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      /* صامت */
    }
  };

  return (
    <div className="container-bookly py-8">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="accent-bar mt-1" />
          <div>
            <h1 className="section-title">الإشعارات</h1>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {unread > 0 ? `لديك ${unread} إشعار غير مقروء` : 'كل الإشعارات مقروءة'}
            </p>
          </div>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="btn-soft shrink-0">
            <CheckCheck className="h-4 w-4" />
            تعليم الكل كمقروء
          </button>
        )}
      </div>

      {loading || authLoading ? (
        <ListSkeleton rows={5} />
      ) : !user ? (
        <EmptyState
          icon={Bell}
          title="سجّل الدخول لعرض إشعاراتك"
          actionLabel="تسجيل الدخول"
          actionHref="/login"
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="لا توجد إشعارات بعد"
          description="ستظهر هنا تحديثات الحجوزات والعروض الجديدة"
          actionLabel="ابدأ رحلتك الأولى"
          actionHref="/search"
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            return (
              <li key={n.id}>
                <Link
                  href="/bookings"
                  onClick={() => {
                    if (!n.isRead) markOne(n.id);
                  }}
                  className={`flex items-start gap-4 rounded-2xl border px-4 py-4 transition hover:shadow-[var(--shadow-e1)] ${
                    n.isRead
                      ? 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                      : 'border-forest-200 bg-forest-50/60 dark:border-forest-800 dark:bg-forest-900/20'
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      n.isRead
                        ? 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
                        : 'bg-forest-100 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-display text-sm font-bold text-[var(--text-strong)]">
                        {n.title}
                        {!n.isRead && (
                          <span className="ms-2 inline-block h-2 w-2 rounded-full bg-forest-500 align-middle" />
                        )}
                      </span>
                      <span className="text-[11px] text-[var(--text-faint)]">{fmtDate(n.createdAt)}</span>
                    </span>
                    {n.body && (
                      <span className="mt-1 block text-sm text-[var(--text-muted)]">{n.body}</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
