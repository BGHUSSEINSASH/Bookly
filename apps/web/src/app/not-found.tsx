import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container-bookly grid min-h-[60vh] place-items-center py-16">
      <div className="text-center">
        <p className="text-7xl font-black text-[var(--brand)]">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-[var(--text-strong)]">
          الصفحة غير موجودة
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          ربما تم نقل الصفحة أو حذفها. جرّب البحث من جديد.
        </p>
        <Link href="/" className="btn btn-primary mt-6">
          العودة للرئيسية
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
