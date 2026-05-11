export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sinistra — articolo consolidato */}
          <div className="lg:col-span-3 space-y-4">
            <div className="h-8 w-64 bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-800 rounded animate-pulse" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`h-4 bg-gray-800 rounded animate-pulse ${i % 4 === 3 ? 'w-3/4' : 'w-full'}`} />
              ))}
            </div>
          </div>
          {/* Destra — fonti */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3">
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-full bg-gray-800 rounded animate-pulse" />
                <div className="h-2 w-full bg-gray-800 rounded animate-pulse" />
                <div className="h-2 w-3/4 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <p className="text-center text-gray-600 text-sm mt-12 animate-pulse">
          ⚖️ Claude sta analizzando le fonti... (~20 secondi)
        </p>
      </div>
    </div>
  )
}
