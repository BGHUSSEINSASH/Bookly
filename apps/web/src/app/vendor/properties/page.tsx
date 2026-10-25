'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface VendorProperty {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  ratingAvg: number;
  ratingCount: number;
  _count?: { bookings: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:          { label: 'مسودة',        color: 'bg-gray-100 text-gray-600' },
  PENDING_REVIEW: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED:      { label: 'منشور',        color: 'bg-green-100 text-green-700' },
  REJECTED:       { label: 'مرفوض',        color: 'bg-red-100 text-red-700' },
};

export default function VendorProperties() {
  const [properties, setProperties] = useState<VendorProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ properties: VendorProperty[] }>('/vendors/me')
      .then(d => setProperties(d.properties ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏨 عقاراتي ({properties.length})</h1>
        <a
          href="/vendors/new-property"
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition"
        >
          + إضافة عقار جديد
        </a>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">جارٍ التحميل…</div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🏨</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">لا توجد عقارات بعد</h2>
          <p className="text-gray-400 mb-6">أضف أول عقار لك وابدأ في استقبال الحجوزات</p>
          <a href="/vendors/new-property" className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition">
            إضافة أول عقار
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 leading-tight flex-1 ml-2">{p.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_CONFIG[p.status]?.color}`}>
                    {STATUS_CONFIG[p.status]?.label ?? p.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{p.category}</p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-amber-500">
                    <span>⭐</span>
                    <span className="font-medium text-gray-700">{Number(p.ratingAvg).toFixed(1)}</span>
                    <span className="text-gray-400">({p.ratingCount})</span>
                  </div>
                  {p._count && (
                    <span className="text-gray-400">{p._count.bookings} حجز</span>
                  )}
                </div>
              </div>
              <div className="px-5 pb-4 flex gap-2">
                <a
                  href={`/property/${p.slug}`}
                  target="_blank"
                  className="flex-1 text-center border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  عرض
                </a>
                <a
                  href={`/vendors/edit-property/${p.id}`}
                  className="flex-1 text-center bg-emerald-500 text-white py-2 rounded-lg text-sm hover:bg-emerald-600 transition"
                >
                  تعديل
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
