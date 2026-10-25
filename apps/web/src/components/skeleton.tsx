/** عناصر تحميل بهيئة shimmer — أخف على العين من دوران الـspinner */

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} aria-hidden />;
}

/** قائمة عناصر (إشعارات/حجوزات/معاملات) أثناء التحميل */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="grid gap-3" role="status" aria-label="جارٍ التحميل">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="card flex items-center gap-3 p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  );
}
