'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Wallet,
  Sparkles,
  Ticket,
  Heart,
  Settings,
  LogOut,
  Loader2,
  Bell,
  ChevronLeft,
  Globe,
  Moon,
  Phone,
  Save,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/components/theme-provider';
import { api } from '@/lib/api';
import { formatMoney, formatDate } from '@/lib/format';

export default function AccountPage() {
  const { user, fetchMe, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [wallet, setWallet] = useState<any>(null);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? '');
      setPhone(user.phone ?? '');
    }
  }, [user]);

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.patch('/users/me', { fullName, phone });
      await fetchMe();
      setProfileMsg('تم حفظ التغييرات');
    } catch (e: any) {
      setProfileMsg(e?.message ?? 'تعذّر الحفظ');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/wallet').catch(() => null),
      api.get('/loyalty/me').catch(() => null),
      api.get('/notifications').catch(() => null),
    ])
      .then(([w, l, n]) => {
        setWallet(w);
        setLoyalty(l);
        setNotifications(n?.items ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-bookly grid min-h-[60vh] place-items-center">
        <div className="card max-w-sm p-8 text-center">
          <User className="mx-auto h-10 w-10 text-[var(--ink-300)]" />
          <p className="mt-3 font-display text-lg font-bold text-[var(--text-strong)]">
            سجّل الدخول لعرض لوحة التحكم
          </p>
          <Link href="/login?next=/account" className="btn btn-primary mt-5">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  const menu = [
    {
      icon: Wallet,
      title: 'المحفظة',
      desc: 'شحن وسجل العمليات',
      href: '/wallet',
    },
    { icon: Ticket, title: 'حجوزاتي', desc: 'تتبع وإلغاء وتقييم', href: '/bookings' },
    { icon: Heart, title: 'المفضلة', desc: 'العقارات المحفوظة', href: '/favorites' },
    { icon: Settings, title: 'الإعدادات', desc: 'اللغة والعملة والمظهر', href: '/settings' },
    { icon: Phone, title: 'الدعم الفني', desc: 'تواصل معنا عبر واتساب', href: '#' },
  ];

  return (
    <div className="container-bookly py-8">
      {/* الترويسة */}
      <div className="relative overflow-hidden rounded-[var(--radius-xl2)] bg-gradient-to-bl from-forest-600 to-forest-900 p-6 shadow-[var(--shadow-e3)] sm:p-8">
        <div className="relative z-10 flex flex-wrap items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-white/30 bg-white/15 font-display text-2xl font-black text-white">
            {user.fullName.charAt(0)}
          </span>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black text-white">{user.fullName}</h1>
            <p dir="ltr" className="text-start text-sm text-white/70">
              {user.email}
            </p>
          </div>
          <button onClick={() => logout()} className="btn bg-white/10 !text-white hover:bg-white/20">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* الإحصاءات */}
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: Wallet,
            value: formatMoney(wallet?.balance ?? 0, wallet?.currency ?? 'IQD'),
            label: 'رصيد المحفظة',
            href: '/wallet',
          },
          {
            icon: Sparkles,
            value: (loyalty?.points ?? 0).toLocaleString('ar-IQ'),
            label: 'نقطة مكافأة',
            href: '#',
          },
          {
            icon: Ticket,
            value: 'الحجوزات',
            label: 'تابع حجوزاتك',
            href: '/bookings',
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-e2)]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-text)]">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-extrabold text-[var(--text-strong)]">
                {s.value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* بياناتي */}
      <h2 className="mt-8 mb-3 font-display text-lg font-bold text-[var(--text-strong)]">
        بياناتي
      </h2>
      <div className="card p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--text-muted)]">الاسم الكامل</span>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="اسمك الكامل"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm text-[var(--text-muted)]">رقم الهاتف</span>
            <input
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+964…"
              dir="ltr"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm text-[var(--text-muted)]">البريد الإلكتروني</span>
            <input className="input opacity-60" value={user.email} disabled />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={saveProfile} disabled={savingProfile || !fullName.trim()} className="btn btn-primary">
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ التغييرات
          </button>
          {profileMsg ? <span className="text-sm text-[var(--text-muted)]">{profileMsg}</span> : null}
        </div>
      </div>

      {/* القائمة */}
      <h2 className="mt-8 mb-3 font-display text-lg font-bold text-[var(--text-strong)]">
        حساباتي
      </h2>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {menu.map((m) => (
          <Link
            key={m.title}
            href={m.href}
            className="flex items-center gap-3 p-4 transition hover:bg-[var(--bg-soft)]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--text-muted)]">
              <m.icon className="h-4.5 w-4.5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[var(--text-strong)]">{m.title}</p>
              <p className="text-xs text-[var(--text-muted)]">{m.desc}</p>
            </div>
            <ChevronLeft className="h-4 w-4 text-[var(--ink-300)]" />
          </Link>
        ))}
      </div>

      {/* تبديل الوضع الليلي */}
      <button
        onClick={toggle}
        className="card mt-4 flex w-full items-center gap-3 p-4 text-start transition hover:bg-[var(--bg-soft)]"
      >
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--text-muted)]">
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--text-strong)]">الوضع الليلي</p>
          <p className="text-xs text-[var(--text-muted)]">
            {theme === 'dark' ? 'مُفعّل' : 'مُعطّل'}
          </p>
        </div>
        <span
          className={`relative h-6 w-11 rounded-full transition ${
            theme === 'dark' ? 'bg-[var(--brand)]' : 'bg-[var(--ink-200)]'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              theme === 'dark' ? 'right-0.5' : 'right-5.5'
            }`}
          />
        </span>
      </button>

      {/* الإشعارات */}
      <h2 className="mt-8 mb-3 flex items-center gap-2 font-display text-lg font-bold text-[var(--text-strong)]">
        <Bell className="h-4 w-4" />
        آخر الإشعارات
      </h2>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">لا توجد إشعارات</p>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-[var(--text-strong)]">{n.title}</p>
                <p className="mt-0.5 text-sm text-[var(--text-muted)]">{n.body}</p>
              </div>
              <span className="shrink-0 text-xs text-[var(--ink-300)]">
                {formatDate(n.createdAt, true)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
