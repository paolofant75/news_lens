export function FeaturedSkeleton() {
  return (
    <div className="mb-10 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="grid grid-cols-1 md:grid-cols-5">
        <div className="md:col-span-2 min-h-[260px] animate-pulse" style={{ background: 'var(--bg-s)' }} />
        <div className="md:col-span-3 p-7 flex flex-col gap-4" style={{ background: 'var(--bg-card)' }}>
          <div className="h-2.5 w-20 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          <div className="h-7 w-full rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          <div className="h-7 w-3/4 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          <div className="h-3.5 w-full rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          <div className="h-3.5 w-2/3 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          <div className="flex gap-3 mt-2">
            <div className="h-10 w-36 rounded-xl animate-pulse" style={{ background: 'var(--bg-s)' }} />
            <div className="h-10 w-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-s)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex gap-2 mb-3">
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
            <div className="h-3 w-12 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
          </div>
          <div className="h-4 w-full rounded animate-pulse mb-2" style={{ background: 'var(--bg-s)' }} />
          <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
        </div>
      ))}
    </div>
  )
}

export function SidebarSkeleton() {
  return (
    <aside
      className="hidden lg:flex flex-col w-60 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto"
      style={{ background: 'var(--bg-s)', borderRight: '1px solid var(--border)' }}
    >
      <div className="p-3 space-y-2 pt-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-full rounded-lg animate-pulse" style={{ background: 'var(--bg-card)' }} />
        ))}
        <div className="pt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded animate-pulse" style={{ background: 'var(--bg-card)', width: `${70 + (i % 3) * 10}%` }} />
          ))}
        </div>
      </div>
    </aside>
  )
}

export function TrendingSkeleton() {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-7 rounded-full animate-pulse" style={{ background: 'var(--bg-card)', width: `${60 + i * 15}px` }} />
      ))}
    </div>
  )
}
