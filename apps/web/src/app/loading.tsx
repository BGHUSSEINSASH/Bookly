export default function Loading() {
  return (
    <div className="loading-screen container-bookly grid min-h-[60vh] place-items-center py-16" aria-busy="true" aria-label="جارٍ التحميل">
      <div className="relative flex flex-col items-center gap-8">
        <div className="loading-bg" aria-hidden="true">
          <span className="blob blob-1" />
          <span className="blob blob-2" />
          <span className="blob blob-3" />
          <span className="grain" />
        </div>

        <div className="loader-mark" aria-hidden="true">
          <span className="loader-ring" />
          <span className="loader-ring loader-ring-2" />
          <span className="loader-dot" />
          <span className="font-display text-xl font-black text-[var(--brand-text)]">بوكلي</span>
        </div>

        <div className="z-10 flex flex-col items-center gap-3">
          <div className="loader-bar">
            <span />
          </div>
          <p className="loader-text text-sm font-medium text-[var(--text-muted)]">جارٍ التحميل…</p>
        </div>
      </div>
    </div>
  );
}
