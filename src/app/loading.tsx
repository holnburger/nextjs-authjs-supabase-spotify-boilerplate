export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Profile Skeleton */}
          <div className="mb-12 flex items-center gap-6">
            <div className="w-32 h-32 bg-zinc-800 rounded-full" />
            <div>
              <div className="h-8 w-48 bg-zinc-800 rounded mb-2" />
              <div className="h-4 w-32 bg-zinc-800 rounded" />
            </div>
          </div>

          {/* Currently Playing Skeleton */}
          <div className="mb-12 p-6 bg-zinc-800/50 rounded-lg">
            <div className="h-6 w-32 bg-zinc-700 rounded mb-4" />
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-zinc-700 rounded-md" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-zinc-700 rounded" />
                <div className="h-4 w-32 bg-zinc-700 rounded" />
                <div className="h-1 w-64 bg-zinc-700 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
