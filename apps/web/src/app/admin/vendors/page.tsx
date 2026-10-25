'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Vendor {
  id: string;
  companyName: string;
  type: string;
  status: string;
  commissionRate: number;
  createdAt: string;
  user: { fullName: string; email: string; phone?: string };
  _count: { properties: number; bookings: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'بانتظار الموافقة', color: 'bg-yellow-100 text-yellow-700' },
  APPROVED:  { label: 'معتمد',            color: 'bg-green-100 text-green-700' },
  REJECTED:  { label: 'مرفوض',            color: 'bg-red-100 text-red-700' },
  SUSPENDED: { label: 'موقوف',            color: 'bg-gray-100 text-gray-500' },
};

export default function AdminVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const load = () => {
    setLoading(true);
    api.get<Vendor[]>('/admin/vendors')
      .then(data => setVendors(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/vendors/${id}/status`, { status });
    load();
  };

  const filtered = vendors.filter(v => filter === 'ALL' || v.status === filter);

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏪 المزوّدون</h1>
        <div className="flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${filter === s ? 'bg-sky-500 text-white border-sky-500' : 'border-gray-200 hover:bg-gray-50'}`}
            >
              {s === 'ALL' ? 'الكل' : STATUS_CONFIG[s]?.label ?? s}
              {s === 'PENDING' && <span className="mr-1 bg-red-500 text-white text-xs rounded-full px-1.5">{vendors.filter(v => v.status === 'PENDING').length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['الشركة', 'المالك', 'النوع', 'العقارات', 'الحجوزات', 'العمولة', 'الحالة', 'إجراء'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={8} className="text-center py-12 text-gray-400">جارٍ التحميل…</td></tr>
              : filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{v.companyName}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{v.user.fullName}</div>
                    <div className="text-gray-400 text-xs">{v.user.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-xs">{v.type}</span></td>
                  <td className="px-4 py-3 text-center">{v._count.properties}</td>
                  <td className="px-4 py-3 text-center">{v._count.bookings}</td>
                  <td className="px-4 py-3 text-center">{v.commissionRate}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_CONFIG[v.status]?.color}`}>
                      {STATUS_CONFIG[v.status]?.label ?? v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {v.status !== 'APPROVED' && (
                        <button onClick={() => setStatus(v.id, 'APPROVED')} className="text-green-600 hover:underline text-xs">قبول</button>
                      )}
                      {v.status !== 'REJECTED' && (
                        <button onClick={() => setStatus(v.id, 'REJECTED')} className="text-red-500 hover:underline text-xs">رفض</button>
                      )}
                      {v.status === 'APPROVED' && (
                        <button onClick={() => setStatus(v.id, 'SUSPENDED')} className="text-gray-500 hover:underline text-xs">إيقاف</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
