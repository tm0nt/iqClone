import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center">
        <div className="grid w-full gap-6 rounded-[32px] border border-black/8 bg-black/3 p-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-[28px] border border-black/6 bg-black/3 p-6">
            <Skeleton className="h-10 w-40 rounded-2xl bg-black/8" />
            <Skeleton className="h-20 w-full rounded-[24px] bg-black/6" />
            <Skeleton className="h-20 w-full rounded-[24px] bg-black/6" />
            <Skeleton className="h-12 w-full rounded-2xl bg-black/8" />
            <Skeleton className="h-12 w-full rounded-2xl bg-black/5" />
          </div>
          <div className="hidden rounded-[28px] border border-black/6 bg-black/3 p-6 md:block">
            <Skeleton className="h-full w-full rounded-[24px] bg-black/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
