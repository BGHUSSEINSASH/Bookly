'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Search,
  Wallet,
  Ticket,
  Heart,
  LogOut,
  User,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import { NotificationBell } from '@/components/notification-bell';
import { formatMoney } from '@/lib/format';
import { usePresence } from '@/hooks/use-presence';

const NAV = [
  { href: '/explore', label: 'استكشف' },
  { href: '/search?category=FARM', label: 'المزارع' },
  { href: '/search?category=HOTEL', label: 'الفنادق' },
  { href: '/flights', label: 'الطيران' },
  { href: '/cars', label: 'السيارات' },
  { href: '/trips', label: 'الرحلات' },
  { href: '/search?category=APARTMENT', label: 'الشقق' },
];

export function SiteHeader() {
  const { user, fetchMe, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menu = usePresence(open, 180);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const isActive = (href: string) => pathname === href.split('?')[0];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]/92 backdrop-blur-md">
      <div className="container-bookly flex h-16 items-center gap-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--brand)] text-[17px] font-bold text-white">
            ب
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-[17px] font-semibold tracking-tight text-[var(--text-strong)]">
              Bookly
            </span>
            <span className="mt-1 block text-[10.5px] text-[var(--text-muted)]">
              حجوزاتك بين يديك
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-[13.5px] font-medium text-[var(--text-body)] lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative rounded-md px-3 py-2 transition-colors hover:text-[var(--text-strong)] ${
                isActive(n.href)
                  ? 'text-[var(--text-strong)] after:absolute after:inset-x-3 after:-bottom-[13px] after:h-[2px] after:rounded-full after:bg-[var(--accent)]'
                  : ''
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <Link href="/search" className="btn btn-ghost hidden !px-2.5 sm:inline-flex" title="بحث">
            <Search className="h-4 w-4" />
          </Link>

          {user ? (
            <>
              <Link href="/wallet" className="btn btn-ghost hidden !px-2.5 md:inline-flex" title="المحفظة">
                <Wallet className="h-4 w-4" />
                <span className="text-xs">{formatMoney(user.wallet?.balance ?? 0, user.wallet?.currency ?? 'IQD')}</span>
              </Link>
              <Link href="/bookings" className="btn btn-ghost hidden !px-2.5 sm:inline-flex" title="حجوزاتي">
                <Ticket className="h-4 w-4" />
                <span className="hidden text-xs xl:inline">حجوزاتي</span>
              </Link>
              <Link href="/favorites" className="btn btn-ghost hidden !px-2.5 sm:inline-flex" title="المفضلة">
                <Heart className="h-4 w-4" />
              </Link>
              <NotificationBell />
              <Link href="/account" className="btn btn-ghost !px-2.5" title="حسابي">
                <User className="h-4 w-4" />
              </Link>
              <button onClick={logout} className="btn btn-ghost !px-2.5" title="تسجيل الخروج">
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">
                دخول
              </Link>
              <Link href="/login?mode=register" className="btn btn-primary !px-4">
                حساب جديد
              </Link>
            </>
          )}

          <button
            onClick={toggle}
            className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border-subtle)] text-[var(--text-body)] transition hover:bg-[var(--bg-soft)]"
            title="الوضع الليلي"
          >
            <span className="icon-morph grid place-items-center" style={{ transform: theme === 'dark' ? 'rotate(90deg)' : 'none' }}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </span>
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="btn btn-ghost !px-2 lg:hidden"
            title="القائمة"
            aria-expanded={open}
          >
            <span className="icon-morph grid place-items-center" style={{ transform: open ? 'rotate(90deg)' : 'none' }}>
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </span>
          </button>
        </div>
      </div>

      {menu.mounted && (
        <div
          className={`border-t border-[var(--border-subtle)] bg-[var(--bg-page)] lg:hidden ${menu.overlayClass}`}
        >
          <div className="container-bookly flex flex-wrap gap-2 py-3">
            {NAV.map((n, i) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="chip"
                style={{ animation: `dropdown-in var(--dur-base) var(--ease-emphasized) both`, animationDelay: `${i * 25}ms` }}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/bookings" onClick={() => setOpen(false)} className="chip" style={{ animation: 'dropdown-in var(--dur-base) var(--ease-emphasized) both', animationDelay: '200ms' }}>
              حجوزاتي
            </Link>
            <Link href="/wallet" onClick={() => setOpen(false)} className="chip" style={{ animation: 'dropdown-in var(--dur-base) var(--ease-emphasized) both', animationDelay: '225ms' }}>
              المحفظة
            </Link>
            <Link href="/notifications" onClick={() => setOpen(false)} className="chip" style={{ animation: 'dropdown-in var(--dur-base) var(--ease-emphasized) both', animationDelay: '250ms' }}>
              الإشعارات
            </Link>
            <Link href="/account" onClick={() => setOpen(false)} className="chip" style={{ animation: 'dropdown-in var(--dur-base) var(--ease-emphasized) both', animationDelay: '275ms' }}>
              حسابي
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
