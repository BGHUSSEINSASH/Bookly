'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Booking {
  code: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  customer: { fullName: string; email: string };
  property?: { title: string };
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DECLINED:  'bg-gray-100 text-gray-500',
};

const STATUS_AR: Record<string, string> = {
  PENDING: 'معلّق', CONFIRMED: 'مؤكّد', COMPLETED: 'مكتمل', CANCELLED: 'ملغى', DECLINED: 'مرفوض',
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    setLoading(true);
    api.get<{ recentBookings: Booking[] }>('/admin/dashboard')
      .then(d => setBookings(d.recentBookings ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => filter === 'ALL' || b.status === filter);

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 الحجوزات</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${filter === s ? 'bg-sky-500 text-white border-sky-500' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {s === 'ALL' ? 'الكل' : STATUS_AR[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['رمز الحجز', 'العميل', 'العقار', 'تسجيل الدخول', 'الإجمالي', 'الحالة', 'الدفع'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">جارٍ التحميل…</td></tr>
              : filtered.length === 0
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">لا توجد حجوزات</td></tr>
              : filtered.map(b => (
                <tr key={b.code} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-mono text-sky-600 font-semibold">{b.code}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{b.customer?.fullName}</div>
                    <div className="text-gray-400 text-xs">{b.customer?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-32 truncate">{b.property?.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(b.checkIn).toLocaleDateString('ar-IQ')}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{Number(b.total).toLocaleString()} {b.currency}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLOR[b.status]}`}>
                      {STATUS_AR[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${b.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.paymentStatus === 'PAID' ? 'مدفوع' : b.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
