'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  users: { total: number; newThisMonth: number; activeToday: number };
  vendors: { approved: number; pending: number };
  properties: { published: number; pending: number };
  bookings: { total: number; pending: number };
  revenue: { total: number; month: number; commission: number };
}

function StatCard({ title, value, sub, color }: { title: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className={`bg-white rounded-xl p-6 border-r-4 ${color} shadow-sm`}>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value?.toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<DashboardStats>('/admin/dashboard')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">جارٍ التحميل…</div>;
  if (!stats) return <div className="p-8 text-red-500">تعذّر تحميل البيانات</div>;

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">لوحة التحكم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="إجمالي المستخدمين" value={stats.users.total} sub={`${stats.users.newThisMonth} هذا الشهر`} color="border-blue-500" />
        <StatCard title="المزوّدون النشطون" value={stats.vendors.approved} sub={`${stats.vendors.pending} بانتظار الموافقة`} color="border-green-500" />
        <StatCard title="العقارات المنشورة" value={stats.properties.published} sub={`${stats.properties.pending} قيد المراجعة`} color="border-purple-500" />
        <StatCard title="إجمالي الحجوزات" value={stats.bookings.total} sub={`${stats.bookings.pending} معلّق`} color="border-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="إجمالي الإيرادات" value={`${stats.revenue.total.toLocaleString()} IQD`} color="border-emerald-500" />
        <StatCard title="إيرادات هذا الشهر" value={`${stats.revenue.month.toLocaleString()} IQD`} color="border-sky-500" />
        <StatCard title="عمولة المنصة" value={`${stats.revenue.commission.toLocaleString()} IQD`} color="border-rose-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">⚡ إجراءات سريعة</h2>
          <div className="space-y-2">
            <a href="/admin/vendors" className="block p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition">
              🔔 {stats.vendors.pending} مزوّد بانتظار الموافقة
            </a>
            <a href="/admin/properties" className="block p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
              🏨 {stats.properties.pending} عقار بانتظار المراجعة
            </a>
            <a href="/admin/bookings" className="block p-3 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition">
              📋 {stats.bookings.pending} حجز معلّق
            </a>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">📈 المستخدمون اليوم</h2>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-sky-600">{stats.users.activeToday}</p>
            <p className="text-gray-400 mt-2">مستخدم نشط اليوم</p>
          </div>
        </div>
      </div>
    </div>
  );
}
