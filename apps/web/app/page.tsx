export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-2xl flex-col items-center justify-center py-32 px-6 text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          News Lens Veritas
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl">
          Global news aggregator with AI-powered anti-bias analysis
        </p>

        <div className="pt-6 space-y-2 text-sm text-gray-500 dark:text-gray-500">
          <p>✓ Phase 0: Setup Complete</p>
          <p>✓ Monorepo initialized</p>
          <p>✓ Dark mode enabled</p>
          <p>✓ Ready for Phase 1</p>
        </div>

        <div className="pt-8 flex gap-4 flex-wrap justify-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Get Started
          </button>
          <button className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition">
            Documentation
          </button>
        </div>
      </main>
    </div>
  );
}
