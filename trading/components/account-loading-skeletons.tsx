import { Skeleton } from "@/components/ui/skeleton";

interface SidebarPanelSkeletonProps {
  showSearch?: boolean;
  items?: number;
}

export function SidebarPanelSkeleton({
  showSearch = false,
  items = 5,
}: SidebarPanelSkeletonProps) {
  return (
    <div className="flex h-full flex-col">
      <div
        className="border-b p-3"
        style={{
          borderColor:
            "color-mix(in srgb, var(--platform-overlay-border-color) 55%, transparent)",
        }}
      >
        {showSearch ? (
          <Skeleton className="h-12 w-full rounded-2xl bg-white/[0.06]" />
        ) : null}
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border px-4 py-3"
            style={{
              borderColor:
                "color-mix(in srgb, var(--platform-overlay-border-color) 42%, transparent)",
              background:
                "color-mix(in srgb, var(--platform-background-color) 12%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full bg-white/[0.08]" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28 rounded-lg bg-white/[0.08]" />
                <Skeleton className="h-3 w-20 rounded-lg bg-white/[0.05]" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="ml-auto h-4 w-16 rounded-lg bg-white/[0.08]" />
                <Skeleton className="ml-auto h-3 w-12 rounded-lg bg-white/[0.05]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AccountTableSectionSkeletonProps {
  showStats?: boolean;
  showActions?: boolean;
  rows?: number;
  columns?: number;
}

export function AccountTableSectionSkeleton({
  showStats = true,
  showActions = true,
  rows = 6,
  columns = 6,
}: AccountTableSectionSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-32 rounded-xl bg-white/[0.05]" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-lg bg-white/[0.05]" />
            <Skeleton className="h-12 w-full rounded-xl bg-white/[0.08]" />
          </div>
        ))}
      </div>

      {showStats ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded-lg bg-white/[0.05]" />
                <Skeleton className="h-4 w-4 rounded-md bg-white/[0.08]" />
              </div>
              <Skeleton className="h-7 w-24 rounded-xl bg-white/[0.08]" />
            </div>
          ))}
        </div>
      ) : null}

      {showActions ? (
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-12 w-36 rounded-xl bg-white/[0.08]" />
          <Skeleton className="h-12 w-32 rounded-xl bg-white/[0.08]" />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="grid gap-0 border-b border-white/[0.06]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="px-4 py-4">
              <Skeleton className="h-4 w-20 rounded-lg bg-white/[0.06]" />
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-0 border-b border-white/[0.05] px-0 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, colIndex) => (
              <div key={colIndex} className="px-4 py-4">
                <Skeleton
                  className={`h-4 rounded-lg bg-white/[0.05] ${
                    colIndex === 0 ? "w-24" : colIndex % 3 === 0 ? "w-20" : "w-16"
                  }`}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AccountListSectionSkeletonProps {
  items?: number;
  showFilters?: boolean;
}

export function AccountListSectionSkeleton({
  items = 4,
  showFilters = true,
}: AccountListSectionSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-44 rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-32 rounded-xl bg-white/[0.05]" />
      </div>

      {showFilters ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24 rounded-lg bg-white/[0.05]" />
              <Skeleton className="h-12 w-full rounded-xl bg-white/[0.08]" />
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-3">
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg bg-white/[0.08]" />
                <Skeleton className="h-3 w-20 rounded-lg bg-white/[0.05]" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-white/[0.08]" />
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 6 }).map((__, rowIndex) => (
                <div key={rowIndex} className="contents">
                  <Skeleton className="h-3 w-16 rounded-lg bg-white/[0.05]" />
                  <Skeleton className="ml-auto h-3 w-20 rounded-lg bg-white/[0.08]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AccountProcessingSkeletonProps {
  blocks?: number;
}

export function AccountProcessingSkeleton({
  blocks = 3,
}: AccountProcessingSkeletonProps) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-6">
      <div className="space-y-3">
        <Skeleton className="h-6 w-56 rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-4 w-72 rounded-xl bg-white/[0.05]" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: blocks }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            <Skeleton className="mb-3 h-4 w-28 rounded-lg bg-white/[0.08]" />
            <Skeleton className="h-20 w-full rounded-xl bg-white/[0.05]" />
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Skeleton className="h-12 w-full rounded-xl bg-white/[0.08]" />
        <Skeleton className="h-2 w-full rounded-full bg-white/[0.05]" />
      </div>
    </div>
  );
}

export function AccountDropdownSkeleton() {
  return (
    <div className="space-y-2 bg-transparent p-4">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl bg-platform-overlay-card/20 p-3"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-lg bg-white/[0.08]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg bg-white/[0.08]" />
                <Skeleton className="h-6 w-28 rounded-lg bg-white/[0.1]" />
                <Skeleton className="h-3 w-32 rounded-lg bg-white/[0.05]" />
              </div>
            </div>
            <Skeleton className="h-9 w-24 rounded-lg bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}
