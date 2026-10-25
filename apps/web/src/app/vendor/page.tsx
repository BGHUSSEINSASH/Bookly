'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface VendorProfile {
  companyName: string;
  status: string;
  commissionRate: number;
  _count: { properties: number; bookings: number };
}

export default function VendorDashboard() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<VendorProfile>('/vendors/me'),
      api.get<any[]>('/bookings/vendor'),
    ])
      .then(([p, b]) => { setProfile(p); setBookings(Array.isArray(b) ? b : []); })
      .catch(() => setError('لا يوجد حساب مزوّد. تقدّم أولاً عبر الإعدادات.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-gray-400">جارٍ التحميل…</div>;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-gray-500 mb-4">{error}</p>
      <a href="/vendors/apply" className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600">التقديم كمزوّد</a>
    </div>
  );

  const pending   = bookings.filter(b => b.status === 'PENDING').length;
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length;
  const revenue   = bookings.filter(b => b.paymentStatus === 'PAID').reduce((s: number, b: any) => s + Number(b.total), 0);

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{profile?.companyName}</h1>
          <span className={`text-sm px-2 py-0.5 rounded mt-1 inline-block ${profile?.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {profile?.status === 'APPROVED' ? '✅ حساب معتمد' : '⏳ بانتظار الاعتماد'}
          </span>
        </div>
        <a href="/vendor/properties" className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600">+ إضافة عقار</a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'عقاراتي',      value: profile?._count.properties ?? 0, color: 'border-blue-500' },
          { label: 'حجوزات معلّقة', value: pending,                         color: 'border-yellow-500' },
          { label: 'حجوزات مؤكّدة', value: confirmed,                        color: 'border-green-500' },
          { label: 'الإيرادات',    value: `${revenue.toLocaleString()} IQD`, color: 'border-emerald-500' },
        ].map(c => (
          <div key={c.label} className={`bg-white rounded-xl p-5 border-r-4 ${c.color} shadow-sm`}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800 font-medium">🔔 لديك {pending} حجز جديد بانتظار ردّك</p>
          <a href="/vendor/bookings" className="text-amber-600 text-sm underline mt-1 inline-block">عرض الحجوزات</a>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-gray-700 mb-4">آخر الحجوزات</h2>
        {bookings.slice(0, 5).length === 0
          ? <p className="text-gray-400 text-sm">لا توجد حجوزات بعد</p>
          : bookings.slice(0, 5).map((b: any) => (
            <div key={b.code} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
              <div>
                <span className="font-mono text-sky-600 font-semibold text-sm">{b.code}</span>
                <span className="text-gray-500 text-sm mx-2">— {b.customer?.fullName}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {b.status === 'PENDING' ? 'معلّق' : b.status === 'CONFIRMED' ? 'مؤكّد' : b.status}
              </span>
            </div>
          ))}
        <a href="/vendor/bookings" className="text-emerald-600 text-sm hover:underline mt-3 inline-block">عرض كل الحجوزات →</a>
      </div>
    </div>
  );
}
