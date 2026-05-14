export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-3 shadow-card">
          <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
          <div className="mt-3 h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
          <div className="mt-3 flex items-center justify-between">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
            <div className="h-7 w-14 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
