import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-black px-4 py-4 text-white">
      <div className="mb-4 flex items-center justify-between rounded-3xl border border-slate-800/70 bg-slate-950/60 px-5 py-4">
        <Skeleton className="h-10 w-40 rounded-2xl bg-slate-800/70" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-2xl bg-slate-800/70" />
          <Skeleton className="h-10 w-20 rounded-2xl bg-slate-800/70" />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="hidden w-20 shrink-0 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-3 md:flex md:flex-col md:gap-3">
          <Skeleton className="h-16 rounded-2xl bg-slate-800/70" />
          <Skeleton className="h-16 rounded-2xl bg-slate-800/70" />
          <Skeleton className="h-16 rounded-2xl bg-slate-800/70" />
          <Skeleton className="h-16 rounded-2xl bg-slate-800/70" />
        </div>

        <div className="flex-1 rounded-[32px] border border-slate-800/70 bg-slate-950/50 p-5">
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-10 w-40 rounded-2xl bg-slate-800/70" />
            <Skeleton className="h-10 w-24 rounded-2xl bg-slate-800/70" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-[28px] bg-slate-800/55" />
            <Skeleton className="h-24 w-10/12 rounded-[28px] bg-slate-800/45" />
            <Skeleton className="h-32 w-11/12 rounded-[28px] bg-slate-800/55" />
            <Skeleton className="h-20 w-9/12 rounded-[24px] bg-slate-800/45" />
          </div>
        </div>

        <div className="hidden w-[135px] shrink-0 rounded-[28px] border border-slate-800/70 bg-slate-950/60 p-3 md:block">
          <Skeleton className="mb-3 h-14 rounded-2xl bg-slate-800/70" />
          <Skeleton className="mb-3 h-14 rounded-2xl bg-slate-800/70" />
          <Skeleton className="mb-4 h-20 rounded-3xl bg-slate-800/55" />
          <Skeleton className="mb-3 h-28 rounded-3xl bg-slate-800/70" />
          <Skeleton className="h-28 rounded-3xl bg-slate-800/70" />
        </div>
      </div>
    </div>
  );
}
