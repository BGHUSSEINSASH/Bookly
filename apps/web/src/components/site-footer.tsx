import Link from 'next/link';
import { Mail, Phone, Instagram, Twitter, Facebook, Send, ShieldCheck, Headphones, Wallet } from 'lucide-react';

const columns = [
  {
    title: 'الخدمات',
    links: [
      { href: '/search?category=FARM', label: 'حجز المزارع' },
      { href: '/search?category=CHALET', label: 'حجز الشاليهات' },
      { href: '/search?category=HOTEL', label: 'حجز الفنادق' },
      { href: '/search?category=APARTMENT', label: 'الشقق الفندقية' },
      { href: '/flights', label: 'تذاكر الطيران' },
      { href: '/cars', label: 'تأجير السيارات' },
      { href: '/trips', label: 'الرحلات السياحية' },
    ],
  },
  {
    title: 'حسابك',
    links: [
      { href: '/bookings', label: 'حجوزاتي' },
      { href: '/favorites', label: 'المفضلة' },
      { href: '/wallet', label: 'المحفظة والنقاط' },
      { href: '/notifications', label: 'الإشعارات' },
      { href: '/settings', label: 'الإعدادات' },
      { href: '/invite', label: 'ادعُ أصدقاءك' },
      { href: '/support', label: 'الدعم والمساعدة' },
      { href: '/faq', label: 'الأسئلة الشائعة' },
    ],
  },
  {
    title: 'بوكلي',
    links: [
      { href: '/about', label: 'عن بوكلي' },
      { href: '/how-it-works', label: 'كيف يعمل بوكلي' },
      { href: '/vendors', label: 'انضم كمزوّد' },
      { href: '/explore', label: 'تصفّح الوجهات' },
      { href: '/privacy', label: 'سياسة الخصوصية' },
      { href: '/terms', label: 'شروط الاستخدام' },
    ],
  },
];

const trust = [
  { icon: ShieldCheck, title: 'دفع آمن', desc: 'بطاقات ومحافظ إلكترونية' },
  { icon: Wallet, title: 'محفظة رقمية', desc: 'شحن واسترداد فوري' },
  { icon: Headphones, title: 'دعم متواصل', desc: 'فريق يرافقك قبل الرحلة وبعدها' },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div className="pattern-arabesque h-10 border-b border-[var(--border-subtle)] opacity-60" />

      <div className="border-b border-[var(--border-subtle)]">
        <div className="container-bookly grid gap-6 py-7 sm:grid-cols-3">
          {trust.map((t) => (
            <div key={t.title} className="flex items-start gap-3">
              <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-text)]" strokeWidth={1.6} />
              <div>
                <p className="font-display text-sm font-semibold text-[var(--text-strong)]">{t.title}</p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-bookly grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[var(--brand)] text-[17px] font-bold text-white">
              ب
            </span>
            <span className="font-display text-[17px] font-semibold text-[var(--text-strong)]">Bookly</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--text-muted)]">
            منصة عربية لحجز المزارع والاستراحات والفنادق والطيران والرحلات — بحجز واضح، ودفع آمن،
            ومحفظة تُرجع لك حقك فورًا عند الإلغاء.
          </p>

          <div className="mt-5 space-y-2 text-sm">
            <a
              href="tel:+9647700000000"
              className="flex items-center gap-2 text-[var(--text-body)] transition hover:text-[var(--brand-text)]"
            >
              <Phone className="h-4 w-4" /> +964 770 000 0000
            </a>
            <a
              href="mailto:support@bookly.app"
              className="flex items-center gap-2 text-[var(--text-body)] transition hover:text-[var(--brand-text)]"
            >
              <Mail className="h-4 w-4" /> support@bookly.app
            </a>
          </div>

          <div className="mt-5 flex gap-2">
            {[
              { Icon: Instagram, label: 'انستغرام' },
              { Icon: Twitter, label: 'إكس' },
              { Icon: Facebook, label: 'فيسبوك' },
              { Icon: Send, label: 'تيليجرام' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text-strong)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3.5 font-display text-[13px] font-semibold text-[var(--text-strong)]">
              {col.title}
            </h3>
            <ul className="space-y-2.5 text-[13px]">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-[var(--text-muted)] transition hover:text-[var(--text-strong)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--border-subtle)] py-5">
        <div className="container-bookly flex flex-col items-center justify-between gap-2 text-[11.5px] text-[var(--text-faint)] sm:flex-row">
          <p>© {new Date().getFullYear()} Bookly — جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-4">
            <span>د.ع · ر.س · د.إ · د.ك · ر.ق · $</span>
            <span>العربية · English</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
