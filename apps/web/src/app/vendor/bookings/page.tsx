'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface VendorBooking {
  code: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  createdAt: string;
  customer: { fullName: string; phone?: string; email: string };
  property?: { title: string };
}

const STATUS_AR: Record<string, string> = {
  PENDING: 'معلّق', CONFIRMED: 'مؤكّد', COMPLETED: 'مكتمل', CANCELLED: 'ملغى', DECLINED: 'مرفوض',
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700', CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700',
  DECLINED: 'bg-gray-100 text-gray-500',
};

export default function VendorBookings() {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<VendorBooking[]>(`/bookings/vendor${filter !== 'ALL' ? `?status=${filter}` : ''}`)
      .then(d => setBookings(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (code: string, status: string) => {
    setUpdating(code);
    await api.patch(`/bookings/${code}/status`, { status }).catch(() => {});
    setUpdating(null);
    load();
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 الحجوزات الواردة</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${filter === s ? 'bg-emerald-500 text-white border-emerald-500' : 'border-gray-200 hover:bg-gray-50'}`}>
              {s === 'ALL' ? 'الكل' : STATUS_AR[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading
          ? <div className="text-center py-12 text-gray-400">جارٍ التحميل…</div>
          : bookings.length === 0
          ? <div className="text-center py-12 text-gray-400">لا توجد حجوزات</div>
          : bookings.map(b => (
            <div key={b.code} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-sky-600 font-bold text-lg">{b.code}</span>
                  <span className={`mr-3 text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOR[b.status]}`}>
                    {STATUS_AR[b.status] ?? b.status}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-gray-800">{Number(b.total).toLocaleString()} {b.currency}</p>
                  <p className="text-xs text-gray-400">{b.paymentStatus === 'PAID' ? '✅ مدفوع' : '⏳ غير مدفوع'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-400 text-xs">العميل</p>
                  <p className="font-medium text-gray-800">{b.customer?.fullName}</p>
                  <p className="text-gray-500 text-xs">{b.customer?.phone ?? b.customer?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">العقار</p>
                  <p className="font-medium text-gray-700 truncate">{b.property?.title ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">الوصول / المغادرة</p>
                  <p className="font-medium text-gray-700">{new Date(b.checkIn).toLocaleDateString('ar-IQ')}</p>
                  <p className="text-gray-500 text-xs">{new Date(b.checkOut).toLocaleDateString('ar-IQ')}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">الضيوف / الليالي</p>
                  <p className="font-medium text-gray-700">{b.guests} ضيف — {b.nights} ليلة</p>
                </div>
              </div>

              {b.status === 'PENDING' && (
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    disabled={updating === b.code}
                    onClick={() => updateStatus(b.code, 'CONFIRMED')}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition"
                  >
                    ✅ قبول الحجز
                  </button>
                  <button
                    disabled={updating === b.code}
                    onClick={() => updateStatus(b.code, 'DECLINED')}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition"
                  >
                    ❌ رفض الحجز
                  </button>
                </div>
              )}
              {b.status === 'CONFIRMED' && (
                <div className="flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    disabled={updating === b.code}
                    onClick={() => updateStatus(b.code, 'COMPLETED')}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition"
                  >
                    ✔ تأكيد اكتمال الإقامة
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
