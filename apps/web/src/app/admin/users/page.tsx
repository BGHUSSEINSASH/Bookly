'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  loyaltyPoints: number;
  createdAt: string;
  _count: { bookings: number };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE:               { label: 'نشط',      color: 'bg-green-100 text-green-700' },
  PENDING_VERIFICATION: { label: 'بانتظار التحقق', color: 'bg-yellow-100 text-yellow-700' },
  SUSPENDED:            { label: 'موقوف',    color: 'bg-red-100 text-red-700' },
  DELETED:              { label: 'محذوف',    color: 'bg-gray-100 text-gray-500' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = (p = 1, q = search) => {
    setLoading(true);
    api.get<{ items: User[]; total: number }>(`/admin/users?page=${p}&limit=25${q ? `&q=${q}` : ''}`)
      .then(d => { setUsers(d.items); setTotal(d.total); setPage(p); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await api.patch(`/admin/users/${id}/status`, { status });
    load(page);
  };

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">👥 المستخدمون ({total.toLocaleString()})</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="بحث بالاسم أو الإيميل…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1, search)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
          <button onClick={() => load(1, search)} className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600">
            بحث
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['الاسم', 'البريد', 'الدور', 'الحالة', 'الحجوزات', 'تاريخ الإنشاء', 'إجراء'].map(h => (
                <th key={h} className="px-4 py-3 text-right text-gray-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading
              ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">جارٍ التحميل…</td></tr>
              : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_LABELS[u.status]?.color}`}>
                      {STATUS_LABELS[u.status]?.label ?? u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{u._count.bookings}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString('ar-IQ')}</td>
                  <td className="px-4 py-3">
                    {u.status === 'ACTIVE'
                      ? <button onClick={() => setStatus(u.id, 'SUSPENDED')} className="text-red-500 hover:underline text-xs">إيقاف</button>
                      : <button onClick={() => setStatus(u.id, 'ACTIVE')} className="text-green-600 hover:underline text-xs">تفعيل</button>
                    }
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
          <span className="text-sm text-gray-400">صفحة {page} من {Math.ceil(total / 25)}</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => load(page - 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">السابق</button>
            <button disabled={page >= Math.ceil(total / 25)} onClick={() => load(page + 1)} className="px-3 py-1 text-sm border rounded disabled:opacity-40 hover:bg-gray-50">التالي</button>
          </div>
        </div>
      </div>
    </div>
  );
}
