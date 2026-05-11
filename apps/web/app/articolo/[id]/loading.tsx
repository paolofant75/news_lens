export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-5 w-28 rounded animate-pulse mb-8" style={{ background: 'var(--bg-card)' }} />
        <div className="h-7 w-72 rounded animate-pulse mb-2" style={{ background: 'var(--bg-card)' }} />
        <div className="h-4 w-48 rounded animate-pulse mb-10" style={{ background: 'var(--bg-card)' }} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-3">
            <div className="h-64 rounded-2xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`h-3 rounded animate-pulse ${i % 4 === 3 ? 'w-3/4' : 'w-full'}`} style={{ background: 'var(--bg-card)' }} />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="h-5 w-40 rounded animate-pulse" style={{ background: 'var(--bg-card)' }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="h-4 w-24 rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
                <div className="h-3 w-full rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
                <div className="h-2 w-full rounded animate-pulse" style={{ background: 'var(--bg-s)' }} />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-sm mt-12 animate-pulse" style={{ color: 'var(--text-3)' }}>
          ⚖️ Claude sta analizzando le fonti... (~20 secondi)
        </p>
      </div>
    </div>
  )
}
