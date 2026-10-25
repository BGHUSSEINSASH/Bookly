'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-bookly grid min-h-[60vh] place-items-center py-16">
      <div className="text-center">
        <p className="text-7xl font-black text-[var(--brand)]">!</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--text-strong)]">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          نعمل على إصلاح المشكلة — يمكنك المحاولة مرة أخرى
        </p>
        <button onClick={reset} className="btn btn-primary mt-5">
          <RefreshCw className="h-4 w-4" />
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
