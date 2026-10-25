'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchMe().then(() => {
      const u = useAuth.getState().user;
      if (!u) { router.replace('/login?redirect=/vendor'); return; }
      const vendorRoles = ['FARM_OWNER', 'HOTEL_MANAGER', 'TRAVEL_AGENCY', 'VENDOR', 'ADMIN', 'SUPER_ADMIN'];
      if (!vendorRoles.includes(u.role)) router.replace('/');
    });
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center"><p className="text-gray-400">جارٍ التحقق…</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-emerald-600">لوحة المزوّد</h1>
          <p className="text-xs text-gray-400 mt-1">{user.fullName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/vendor', label: '📊 ملخص النشاط' },
            { href: '/vendor/bookings', label: '📋 الحجوزات الواردة' },
            { href: '/vendor/properties', label: '🏨 عقاراتي' },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-1">
          <a href="/account" className="block px-4 py-2 text-sm text-gray-500 hover:text-gray-700">⚙️ إعدادات الحساب</a>
          <a href="/" className="block px-4 py-2 text-sm text-gray-500 hover:text-gray-700">← العودة للموقع</a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
