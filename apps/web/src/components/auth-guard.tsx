'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

/** يعيد التوجيه تلقائيًا إذا كان المستخدم مسجّل الدخول بالفعل */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuth();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  if (!user) {
    return (
      <div className="container-bookly grid min-h-[60vh] place-items-center py-10">
        <div className="card max-w-sm p-8 text-center">
          <p className="font-bold text-ink-900">يجب تسجيل الدخول</p>
          <p className="mt-1 text-sm text-ink-500">سجّل الدخول للوصول إلى هذه الصفحة</p>
          <a href="/login" className="btn-primary mt-5">
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
