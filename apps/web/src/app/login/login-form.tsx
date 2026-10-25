'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, UserPlus, Zap, Globe, Wallet, Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/account';
  const isRegister = params.get('mode') === 'register';

  const { login, register, loading, error } = useAuth();

  const [form, setForm] = useState({
    email: 'customer@bookly.app',
    password: 'Password@123',
    fullName: '',
    phone: '',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || undefined,
        });
      } else {
        await login(form.email, form.password);
      }
      router.push(next);
    } catch {
      /* يظهر من المتجر */
    }
  };

  return (
    <div className="container-bookly grid min-h-[75vh] items-center gap-8 py-10 lg:grid-cols-2">
      {/* اللوحة الجانبية */}
      <div className="relative hidden overflow-hidden rounded-[var(--radius-xl2)] bg-gradient-to-bl from-forest-700 to-forest-900 p-10 lg:block">
        <div className="relative z-10">
          <span className="pill pill-lime">
            <Zap className="h-3.5 w-3.5" />
           Bookly
          </span>
          <h1 className="mt-5 font-display text-4xl font-black leading-tight text-white">
            حجوزاتك بين يديك
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
            مزارع، فنادق، طيران، سيارات ورحلات — كلها في مكان واحد مع دفع آمن ومحفظة رقمية ونظام نقاط
            ومكافآت.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: Globe, t: 'عربي أولًا', d: 'واجهة عربية بالكامل مع دعم RTL' },
              { icon: Wallet, t: 'محفظة رقمية', d: 'شحن واسترداد لحظي' },
              { icon: Bookmark, t: 'مفضلة ذكية', d: 'احفظ وارجع وقتما تشاء' },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[var(--accent)]">
                  <f.icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{f.t}</p>
                  <p className="text-xs text-white/60">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* النموذج */}
      <div className="card mx-auto w-full max-w-md p-7">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-forest-600 to-forest-400 text-xl font-black text-white">
            ب
          </span>
          <h2 className="mt-4 font-display text-2xl font-black text-[var(--text-strong)]">
            {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {isRegister ? 'احجز مزارع وفنادق ورحلات في ثوانٍ' : 'أهلًا بعودتك إلى Bookly'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {isRegister ? (
            <>
              <div>
                <label className="label">الاسم الكامل</label>
                <input
                  required
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  className="input"
                  placeholder="محمد أحمد"
                />
              </div>
              <div>
                <label className="label">رقم الهاتف (اختياري)</label>
                <input
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="input"
                  placeholder="+964 770 000 0000"
                  dir="ltr"
                />
              </div>
            </>
          ) : null}

          <div>
            <label className="label">البريد الإلكتروني</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="input"
              placeholder="you@example.com"
              dir="ltr"
            />
          </div>

          <div>
            <label className="label">كلمة المرور</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="input"
              placeholder="••••••••"
              dir="ltr"
            />
            {isRegister ? (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                8 أحرف على الأقل، مع حرف ورقم
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="alert-danger alert-enter">{error}</p>
          ) : null}

          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isRegister ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {isRegister ? 'إنشاء الحساب' : 'دخول'}
          </button>
        </form>

        <button
          onClick={() =>
            router.push(isRegister ? '/login' : '/login?mode=register')
          }
          className="mt-4 w-full text-center text-sm text-[var(--text-muted)] transition hover:text-[var(--brand-text)]"
        >
          {isRegister ? 'لديك حساب؟ سجّل الدخول' : 'ليس لديك حساب؟ أنشئ واحدًا'}
        </button>

        <div className="mt-6 rounded-xl bg-[var(--bg-soft)] p-3 text-xs leading-6 text-[var(--text-muted)]">
          <p className="font-bold text-[var(--text-body)]">حسابات تجريبية:</p>
          <p dir="ltr" className="text-start">
            customer@bookly.app / Password@123
          </p>
          <p dir="ltr" className="text-start">
            admin@bookly.app / Admin@12345
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--brand-text)]">
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}
