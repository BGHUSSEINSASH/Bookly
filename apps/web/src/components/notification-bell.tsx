'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, BellRing, CalendarCheck, Ban, CheckCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { usePresence } from '@/hooks/use-presence';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  data?: { code?: string; bookingId?: string } | null;
  isRead: boolean;
  createdAt: string;
}

const ICONS: Record<string, typeof Bell> = {
  NEW_BOOKING: CalendarCheck,
  BOOKING_UPDATE: CalendarCheck,
  BOOKING_CANCELLED: Ban,
};

const TYPE_LABEL: Record<string, string> = {
  NEW_BOOKING: 'حجز جديد',
  BOOKING_UPDATE: 'تحديث حجز',
  BOOKING_CANCELLED: 'إلغاء حجز',
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return new Date(iso).toLocaleDateString('ar');
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const menu = usePresence(open, 160);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ items: NotificationItem[]; unread: number }>(
        '/notifications?limit=8',
      );
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* صامت — الإشعارات ليست حرجة */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user, load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  if (!user) return null;

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
    setUnread((u) => Math.max(0, u - 1));
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      /* صامت */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost relative !px-3"
        title="الإشعارات"
        aria-label="الإشعارات"
      >
        {unread > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {unread > 0 && (
          <span className="absolute -top-1 -left-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-[var(--accent-ink)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {menu.mounted && (
        <div
          className={`absolute top-12 left-0 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-[var(--shadow-e3)] sm:w-96 ${menu.dropdownClass ?? menu.overlayClass}`}
        >
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
            <span className="font-display text-sm font-bold text-[var(--text-strong)]">الإشعارات</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="flex items-center gap-1 text-xs font-medium text-[var(--brand-text)] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-8 w-8 text-[var(--text-faint)]" />
              <p className="mt-3 text-sm text-[var(--text-muted)]">لا توجد إشعارات بعد</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-[var(--border-subtle)] overflow-y-auto">
              {items.map((n) => {
                const Icon = ICONS[n.type] ?? Bell;
                return (
                  <li key={n.id}>
                    <Link
                      href="/bookings"
                      onClick={() => {
                        if (!n.isRead) markOne(n.id);
                        setOpen(false);
                      }}
                      className={`flex gap-3 px-4 py-3 transition hover:bg-[var(--bg-soft)] ${
                        n.isRead ? '' : 'bg-[var(--bg-soft)]/50'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                          n.isRead
                            ? 'bg-[var(--bg-soft)] text-[var(--text-muted)]'
                            : 'bg-forest-100 text-forest-700 dark:bg-forest-900/40 dark:text-forest-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-[var(--text-strong)]">
                            {n.title}
                          </span>
                          <span className="shrink-0 text-[11px] text-[var(--text-faint)]">
                            {timeAgo(n.createdAt)}
                          </span>
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block truncate text-xs text-[var(--text-muted)]">
                            {n.body}
                          </span>
                        )}
                        {!n.isRead && (
                          <span className="mt-1 inline-block rounded-full bg-forest-100 px-2 py-0.5 text-[10px] font-bold text-forest-700 dark:bg-forest-900/40 dark:text-forest-300">
                            {TYPE_LABEL[n.type] ?? 'إشعار'}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-[var(--border-subtle)] py-2.5 text-center text-xs font-bold text-[var(--brand-text)] hover:bg-[var(--bg-soft)]"
          >
            عرض كل الإشعارات
          </Link>
        </div>
      )}
    </div>
  );
}
