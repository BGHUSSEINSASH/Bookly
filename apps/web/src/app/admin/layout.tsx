'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchMe().then(() => {
      const u = useAuth.getState().user;
      if (!u || !['ADMIN', 'SUPER_ADMIN'].includes(u.role)) {
        router.replace('/login?redirect=/admin');
      }
    });
  }, []);

  if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">جارٍ التحقق من الصلاحيات…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-sky-600">Bookly Admin</h1>
          <p className="text-xs text-gray-400 mt-1">{user.fullName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', label: '📊 لوحة التحكم' },
            { href: '/admin/users', label: '👥 المستخدمون' },
            { href: '/admin/vendors', label: '🏪 المزوّدون' },
            { href: '/admin/properties', label: '🏨 العقارات' },
            { href: '/admin/bookings', label: '📋 الحجوزات' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <a href="/" className="block px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
            ← العودة للموقع
          </a>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
