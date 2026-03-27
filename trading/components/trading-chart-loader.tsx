"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TradingChartLoader() {
  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: "var(--platform-background-color)" }}
    >
      <div className="flex h-full flex-col px-4 py-4 sm:px-5 sm:py-5">
        <div className="grid min-h-0 flex-1 grid-cols-[40px_1fr] gap-3 sm:grid-cols-[44px_1fr]">
          <div className="flex flex-col gap-2 pt-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 rounded-xl"
                style={{
                  background:
                    "color-mix(in srgb, var(--platform-overlay-surface-color) 74%, transparent)",
                }}
              />
            ))}
          </div>

          <div
            className="relative min-h-0 overflow-hidden rounded-[24px] border"
            style={{
              borderColor:
                "color-mix(in srgb, var(--platform-overlay-border-color) 55%, transparent)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--platform-background-color) 97%, black), color-mix(in srgb, var(--platform-overlay-surface-color) 16%, var(--platform-background-color)))",
            }}
          >
            <div className="absolute inset-0 p-4 sm:p-5">
              <div className="absolute inset-0">
                {Array.from({ length: 4 }).map((_, row) => (
                  <div
                    key={`h-${row}`}
                    className="absolute left-0 right-0 border-t"
                    style={{
                      top: `${18 + row * 18}%`,
                      borderColor:
                        "color-mix(in srgb, var(--platform-overlay-border-color) 18%, transparent)",
                    }}
                  />
                ))}
                {Array.from({ length: 6 }).map((_, col) => (
                  <div
                    key={`v-${col}`}
                    className="absolute bottom-0 top-0 border-l"
                    style={{
                      left: `${14 + col * 13}%`,
                      borderColor:
                        "color-mix(in srgb, var(--platform-overlay-border-color) 10%, transparent)",
                    }}
                  />
                ))}
              </div>
              <div
                className="relative h-full overflow-hidden rounded-[20px] border"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--platform-overlay-border-color) 28%, transparent)",
                  background:
                    "linear-gradient(180deg, color-mix(in srgb, var(--platform-overlay-surface-color) 8%, transparent), color-mix(in srgb, var(--platform-overlay-surface-color) 3%, transparent))",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--platform-overlay-surface-color)_14%,transparent),transparent_60%)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
