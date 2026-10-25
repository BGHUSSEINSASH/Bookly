'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Property {
  id: string;
  title: string;
  status: string;
  category: string;
  createdAt: string;
  city?: { nameAr: string };
  vendor?: { companyName: string };
  images?: { media: { url: string } }[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:           { label: 'مسودة',         color: 'bg-gray-100 text-gray-600' },
  PENDING_REVIEW:  { label: 'قيد المراجعة',  color: 'bg-yellow-100 text-yellow-700' },
  PUBLISHED:       { label: 'منشور',         color: 'bg-green-100 text-green-700' },
  REJECTED:        { label: 'مرفوض',         color: 'bg-red-100 text-red-700' },
  ARCHIVED:        { label: 'مؤرشف',         color: 'bg-gray-100 text-gray-500' },
};

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING_REVIEW');

  const load = (status = filter) => {
    setLoading(true);
    api.get<Property[]>(`/admin/properties${status !== 'ALL' ? `?status=${status}` : ''}`)
      .then(data => setProperties(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/properties/${id}/status`, { status });
    load();
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏨 العقارات</h1>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'DRAFT'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); load(s); }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${filter === s ? 'bg-sky-500 text-white border-sky-500' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {s === 'ALL' ? 'الكل' : STATUS_CONFIG[s]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading
          ? <div className="text-center py-12 text-gray-400">جارٍ التحميل…</div>
          : properties.length === 0
          ? <div className="text-center py-12 text-gray-400">لا توجد عقارات</div>
          : properties.map(p => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">
              {p.images?.[0]?.media?.url && (
                <img src={p.images[0].media.url} alt={p.title} className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">{p.title}</h3>
                    <p className="text-sm text-gray-500">{p.vendor?.companyName} — {p.city?.nameAr} — {p.category}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('ar-IQ')}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${STATUS_CONFIG[p.status]?.color}`}>
                    {STATUS_CONFIG[p.status]?.label ?? p.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {p.status !== 'PUBLISHED' && (
                  <button onClick={() => setStatus(p.id, 'PUBLISHED')} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600">نشر</button>
                )}
                {p.status !== 'REJECTED' && (
                  <button onClick={() => setStatus(p.id, 'REJECTED')} className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600">رفض</button>
                )}
                {p.status === 'PUBLISHED' && (
                  <button onClick={() => setStatus(p.id, 'ARCHIVED')} className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-300">أرشفة</button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
