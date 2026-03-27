export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header skeleton */}
      <div className="h-20 border-b border-white/[0.05] px-6 flex items-center justify-between flex-shrink-0">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-8 w-20 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="w-10 h-10 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar skeleton */}
        <aside className="w-52 flex-shrink-0 border-r border-white/[0.05] pt-8 pl-4 pr-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-11 animate-pulse rounded-xl bg-white/[0.04]"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </aside>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-6 pt-6 pb-10 space-y-6">
            {/* Profile + info row */}
            <div className="flex gap-6">
              <div className="w-24 h-24 animate-pulse rounded-full bg-white/[0.06] flex-shrink-0" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-4 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
                <div className="h-4 w-56 animate-pulse rounded-lg bg-white/[0.04]" />
                <div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/[0.05] pb-1">
              <div className="h-9 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-9 w-24 animate-pulse rounded-xl bg-white/[0.04]" />
            </div>

            {/* Form block */}
            <div className="bg-white/[0.03] rounded-2xl p-6 space-y-4">
              <div className="h-5 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-white/[0.04]"
                    style={{ animationDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/[0.06] mt-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
