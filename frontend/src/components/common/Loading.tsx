type PageLoaderVariant = 'default' | 'home' | 'catalog' | 'product-detail' | 'page-content';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[linear-gradient(90deg,rgba(229,231,235,0.95),rgba(243,244,246,0.95),rgba(229,231,235,0.95))] dark:bg-[linear-gradient(90deg,rgba(31,41,55,0.94),rgba(55,65,81,0.94),rgba(31,41,55,0.94))] bg-[length:200%_100%] ${className}`}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden border-gray-200/80">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-3 w-32 rounded-full" />
      </div>
    </div>
  );
}

function SectionHeaderSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="space-y-3">
        <Skeleton className={`h-4 w-28 rounded-full ${compact ? '' : 'md:w-36'}`} />
        <Skeleton className={`h-8 w-48 ${compact ? 'md:w-56' : 'md:w-72'}`} />
      </div>
      {!compact && <Skeleton className="hidden h-10 w-28 rounded-full md:block" />}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div>
      <section className="relative h-[420px] overflow-hidden bg-gray-950 md:h-[500px]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,1),rgba(3,7,18,0.86),rgba(8,47,73,0.74))]" />
        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div className="max-w-xl space-y-5">
              <Skeleton className="h-8 w-24 rounded-full bg-white/15 dark:bg-white/10" />
              <Skeleton className="h-12 w-full max-w-lg bg-white/15 dark:bg-white/10" />
              <Skeleton className="h-12 w-4/5 bg-white/15 dark:bg-white/10" />
              <Skeleton className="h-5 w-full max-w-md rounded-full bg-white/10 dark:bg-white/10" />
              <Skeleton className="h-5 w-3/4 rounded-full bg-white/10 dark:bg-white/10" />
              <div className="flex flex-wrap gap-3 pt-2">
                <Skeleton className="h-12 w-36 rounded-full bg-white/15 dark:bg-white/10" />
                <Skeleton className="h-12 w-40 rounded-full bg-white/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:px-6 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
              <div className="w-full space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <Skeleton className="h-7 w-20 bg-white/15 dark:bg-white/10" />
              <Skeleton className="mt-3 h-4 w-28 rounded-full bg-white/10 dark:bg-white/10" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeaderSkeleton compact />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="card p-6 text-center">
              <Skeleton className="mx-auto h-5 w-24" />
              <Skeleton className="mx-auto mt-3 h-3 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6">
        <div className="rounded-[28px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-8 w-64" />
            </div>
            <div className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <SectionHeaderSkeleton />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="rounded-[24px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <Skeleton className="mt-4 h-6 w-40" />
              <Skeleton className="mt-3 h-4 w-full rounded-full" />
              <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-12 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeaderSkeleton />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {Array.from({ length: 4 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-600 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <Skeleton className="mx-auto h-10 w-full max-w-3xl bg-white/15 dark:bg-white/10" />
          <Skeleton className="mx-auto mt-5 h-5 w-full max-w-2xl rounded-full bg-white/10 dark:bg-white/10" />
          <Skeleton className="mx-auto mt-3 h-5 w-4/5 max-w-xl rounded-full bg-white/10 dark:bg-white/10" />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Skeleton className="h-12 w-36 rounded-xl bg-white/15 dark:bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-xl bg-white/10 dark:bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function CatalogPageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-4 w-64 rounded-full" />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-28 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl md:hidden" />
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full rounded-full" />
            ))}
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 flex-1 rounded-xl" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </aside>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 md:gap-6">
          {Array.from({ length: 9 }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-4 w-72 rounded-full" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <Skeleton className="aspect-square w-full rounded-[28px]" />
          <div className="mt-4 flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 w-20 shrink-0 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-10 w-full max-w-xl" />
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-full rounded-full" />
          <Skeleton className="h-4 w-5/6 rounded-full" />

          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="rounded-2xl border border-gray-200/80 bg-gray-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/70">
                <Skeleton className="h-5 w-5 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-28" />
                <Skeleton className="mt-2 h-3 w-full rounded-full" />
                <Skeleton className="mt-2 h-3 w-3/4 rounded-full" />
              </div>
            ))}
          </div>

          <div>
            <Skeleton className="mb-3 h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-24 rounded-xl" />
              ))}
            </div>
          </div>

          <div>
            <Skeleton className="mb-3 h-4 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-12 flex-1 rounded-xl" />
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>

          <Skeleton className="h-14 w-full rounded-xl" />

          <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="h-5 w-52" />
            <div className="mt-4 flex flex-wrap gap-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-8 w-20 rounded-full" />
              ))}
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Skeleton className="mb-4 h-8 w-40" />
          <div className="rounded-[24px] border border-gray-200/80 bg-white px-6 py-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-5/6 rounded-full" />
              <Skeleton className="h-4 w-4/5 rounded-full" />
            </div>
          </div>
        </div>

        <aside className="rounded-[24px] border border-gray-200/80 bg-white px-5 py-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="h-4 w-36 rounded-full" />
          <div className="mt-4 space-y-4">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-950">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-12">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="card max-w-2xl p-6">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="mt-3 h-4 w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
          <Skeleton className="mt-6 h-11 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ContentPageSkeleton() {
  return (
    <div className="bg-gray-50/70 dark:bg-gray-950">
      <section className="overflow-hidden border-b border-gray-200/80 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,1))] px-4 py-14 dark:border-gray-800 dark:bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(3,7,18,1))] sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl space-y-5">
            <Skeleton className="h-8 w-48 rounded-full" />
            <Skeleton className="h-4 w-64 rounded-full" />
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="h-6 w-full max-w-2xl rounded-full" />
            <Skeleton className="h-6 w-5/6 max-w-xl rounded-full" />
            <div className="flex flex-wrap gap-3 pt-2">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="overflow-hidden rounded-[30px] border border-gray-200/80 bg-white/95 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.34)] dark:border-gray-800 dark:bg-gray-900/90">
            <div className="h-1.5 bg-[linear-gradient(90deg,rgba(6,182,212,1),rgba(14,165,233,0.6),rgba(34,211,238,0.22))]" />
            <div className="space-y-8 px-6 py-8 md:px-10 md:py-10">
              <div className="rounded-[24px] border border-primary-100/80 bg-[linear-gradient(135deg,rgba(240,249,255,0.92),rgba(255,255,255,0.9)_42%,rgba(236,254,255,0.85))] px-5 py-5 dark:border-primary-500/15 dark:bg-[linear-gradient(135deg,rgba(8,47,73,0.36),rgba(17,24,39,0.92)_45%,rgba(2,132,199,0.12))] md:px-6">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="mt-4 h-4 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
              </div>

              <div className="space-y-5">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-11/12 rounded-full" />
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-5 py-5 dark:border-gray-800 dark:bg-gray-950/60">
                <Skeleton className="h-6 w-44" />
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-4 w-full rounded-full" />
                ))}
              </div>

              <div className="space-y-5">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="h-4 w-5/6 rounded-full" />
                <Skeleton className="h-4 w-4/5 rounded-full" />
              </div>
            </div>
          </article>

          <aside className="space-y-5 self-start lg:sticky lg:top-24">
            <div className="card p-6">
              <Skeleton className="h-6 w-40" />
              <div className="mt-5 space-y-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-12 w-full rounded-2xl" />
                ))}
              </div>
            </div>

            <div className="card p-6">
              <Skeleton className="h-6 w-36" />
              <div className="mt-5 space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-lg" />
                    <div className="w-full space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="mt-6 h-11 w-full rounded-xl" />
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export function PageLoader({ variant = 'default' }: { variant?: PageLoaderVariant } = {}) {
  if (variant === 'home') return <HomePageSkeleton />;
  if (variant === 'catalog') return <CatalogPageSkeleton />;
  if (variant === 'product-detail') return <ProductDetailSkeleton />;
  if (variant === 'page-content') return <ContentPageSkeleton />;

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner />
    </div>
  );
}
