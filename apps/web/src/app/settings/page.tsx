'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme-provider';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Globe, Wallet, Bell, Mail, ChevronLeft, Moon, Sun, Info, Check } from 'lucide-react';

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'ar', label: 'العربية' },
  { code: 'en', label: 'English' },
];

const CURRENCIES: { code: string; label: string }[] = [
  { code: 'IQD', label: 'الدينار العراقي (د.ع)' },
  { code: 'SAR', label: 'الريال السعودي (ر.س)' },
  { code: 'AED', label: 'الدرهم الإماراتي (د.إ)' },
  { code: 'KWD', label: 'الدينار الكويتي (د.ك)' },
  { code: 'QAR', label: 'الريال القطري (ر.ق)' },
  { code: 'USD', label: 'الدولار الأمريكي ($)' },
];

const langLabel = (code: string) => LANGUAGES.find((l) => l.code === code)?.label ?? LANGUAGES[0].label;
const currencyLabel = (code: string) => CURRENCIES.find((c) => c.code === code)?.label ?? CURRENCIES[0].label;

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { user, fetchMe } = useAuth();

  const [language, setLanguage] = useState('ar');
  const [currency, setCurrency] = useState('IQD');
  const [notifications, setNotifications] = useState(true);
  const [offers, setOffers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState<null | { title: string; options: string[]; value: string; onPick: (v: string) => void }>(null);

  useEffect(() => {
    if (user) {
      if (user.preferredCurrency) setCurrency(user.preferredCurrency);
      // locale يُخزَّن في الملف الشخصي إن كان متاحًا
      const anyUser = user as any;
      if (anyUser.locale) setLanguage(anyUser.locale);
    }
    try {
      const n = localStorage.getItem('bookly:notifications');
      const o = localStorage.getItem('bookly:offers');
      if (n !== null) setNotifications(n === '1');
      if (o !== null) setOffers(o === '1');
    } catch {
      // التخزين المحلي معطّل
    }
  }, [user]);

  const persist = async (patch: { locale?: string; preferredCurrency?: string }) => {
    if (!useAuth.getState().user) return;
    setSaving(true);
    try {
      await api.patch('/users/me', patch);
      const { user: fresh } = useAuth.getState();
      if (fresh) {
        useAuth.setState({ user: { ...fresh, ...patch } as typeof fresh });
      } else {
        void fetchMe();
      }
    } catch {
      void fetchMe();
    } finally {
      setSaving(false);
    }
  };

  const pickLanguage = (code: string) => {
    setLanguage(code);
    void persist({ locale: code });
  };

  const pickCurrency = (code: string) => {
    setCurrency(code);
    void persist({ preferredCurrency: code });
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    try {
      localStorage.setItem('bookly:notifications', next ? '1' : '0');
    } catch {
      // التخزين المحلي معطّل
    }
  };

  const toggleOffers = () => {
    const next = !offers;
    setOffers(next);
    try {
      localStorage.setItem('bookly:offers', next ? '1' : '0');
    } catch {
      // التخزين المحلي معطّل
    }
  };

  const row = (
    icon: React.ReactNode,
    title: string,
    desc: string,
    right?: React.ReactNode,
    onClick?: () => void,
  ) => (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-start transition hover:bg-[var(--bg-soft)]"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--bg-soft)] text-[var(--text-muted)]">
        {icon}
      </span>
      <div className="flex-1 text-start">
        <p className="text-sm font-bold text-[var(--text-strong)]">{title}</p>
        <p className="text-xs text-[var(--text-muted)]">{desc}</p>
      </div>
      {right}
    </button>
  );

  return (
    <div className="container-bookly max-w-3xl py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="section-title !mb-0">الإعدادات</h1>
        {saving ? <span className="text-xs text-[var(--text-muted)]">جارٍ الحفظ…</span> : null}
      </div>

      {!user ? (
        <p className="mb-4 rounded-xl bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand-text)]">
          سجّل الدخول لحفظ اللغة والعملة في حسابك — الإعدادات تُحفظ محليًا لك حتى ذلك الحين.
        </p>
      ) : null}

      <p className="mb-2 text-sm font-semibold text-[var(--text-muted)]">التطبيق</p>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {row(
          <Globe className="h-4 w-4" />,
          'اللغة',
          langLabel(language),
          <ChevronLeft className="h-4 w-4 text-[var(--ink-300)]" />,
          () =>
            setPicker({
              title: 'اللغة',
              options: LANGUAGES.map((l) => l.label),
              value: langLabel(language),
              onPick: (v) => pickLanguage(LANGUAGES.find((l) => l.label === v)?.code ?? 'ar'),
            }),
        )}
        {row(
          <Wallet className="h-4 w-4" />,
          'العملة',
          currencyLabel(currency),
          <ChevronLeft className="h-4 w-4 text-[var(--ink-300)]" />,
          () =>
            setPicker({
              title: 'العملة',
              options: CURRENCIES.map((c) => c.label),
              value: currencyLabel(currency),
              onPick: (v) => pickCurrency(CURRENCIES.find((c) => c.label === v)?.code ?? 'IQD'),
            }),
        )}
        {row(
          <Bell className="h-4 w-4" />,
          'الإشعارات',
          'تفعيل إشعارات الحجوزات والعروض',
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleNotifications();
            }}
            className={`relative h-6 w-11 rounded-full transition ${
              notifications ? 'bg-[var(--brand)]' : 'bg-[var(--ink-200)]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                notifications ? 'right-0.5' : 'right-5.5'
              }`}
            />
          </span>,
        )}
        {row(
          <Mail className="h-4 w-4" />,
          'العروض والبريد',
          'استقبل العروض الموسمية',
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleOffers();
            }}
            className={`relative h-6 w-11 rounded-full transition ${
              offers ? 'bg-[var(--brand)]' : 'bg-[var(--ink-200)]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                offers ? 'right-0.5' : 'right-5.5'
              }`}
            />
          </span>,
        )}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-[var(--text-muted)]">المظهر</p>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {row(
          theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
          'الوضع الليلي',
          theme === 'dark' ? 'مُفعّل' : 'مُعطّل',
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            className={`relative h-6 w-11 rounded-full transition ${
              theme === 'dark' ? 'bg-[var(--brand)]' : 'bg-[var(--ink-200)]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                theme === 'dark' ? 'right-0.5' : 'right-5.5'
              }`}
            />
          </span>,
        )}
      </div>

      <p className="mb-2 mt-6 text-sm font-semibold text-[var(--text-muted)]">المساعدة</p>
      <div className="card divide-y divide-[var(--border-subtle)]">
        {row(
          <Info className="h-4 w-4" />,
          'عن Bookly',
          'نسخة التطبيق: 1.0.0 (1)',
          <ChevronLeft className="h-4 w-4 text-[var(--ink-300)]" />,
        )}
      </div>

      {/* منتقي القيم */}
      {picker ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45"
          onClick={() => setPicker(null)}
        >
          <div
            className="w-full max-w-md rounded-t-[var(--radius-xl2)] bg-[var(--bg-surface)] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--ink-200)]" />
            <h3 className="mb-4 font-display text-lg font-bold text-[var(--text-strong)]">
              {picker.title}
            </h3>
            {picker.options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  picker.onPick(o);
                  setPicker(null);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-start transition hover:bg-[var(--bg-soft)]"
              >
                <span className="text-sm font-semibold text-[var(--text-strong)]">{o}</span>
                {o === picker.value ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--brand)] text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
