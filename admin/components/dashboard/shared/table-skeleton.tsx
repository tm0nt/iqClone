"use client"

import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {/* Header skeleton */}
      <div className="flex gap-4 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`h-${i}`} className="h-4 flex-1 rounded" />
        ))}
      </div>
      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`r-${i}`} className="flex gap-4 px-4 py-3">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={`c-${i}-${j}`} className="h-5 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[100px] rounded-xl" />
        ))}
      </div>
      {/* Filter bar skeleton */}
      <Skeleton className="h-10 w-full rounded-lg" />
      {/* Table skeleton */}
      <div className="rounded-xl border bg-card shadow-sm">
        <TableSkeleton />
      </div>
    </div>
  )
}
