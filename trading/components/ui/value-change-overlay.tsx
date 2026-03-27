"use client";

interface ValueChangeOverlayItem {
  id: number;
  delta: number;
}

interface ValueChangeOverlayProps {
  items: ValueChangeOverlayItem[];
  compact?: boolean;
}

export function ValueChangeOverlay({
  items,
  compact = false,
}: ValueChangeOverlayProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {items.map((item) => {
          const isPositive = item.delta > 0;

          return (
            <div
              key={item.id}
              className={`absolute left-1/2 top-1/2 whitespace-nowrap rounded-full border font-semibold shadow-lg backdrop-blur-sm ${
                compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1 text-xs"
              } ${
                isPositive
                  ? "border-platform-positive/40 bg-platform-positive/15 text-platform-positive"
                  : "border-platform-danger/40 bg-platform-danger/15 text-platform-danger"
              }`}
              style={{
                transform: "translate(-50%, -50%)",
                animation: `${isPositive ? "moneyFloatUp" : "moneyFloatDown"} 720ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              }}
            >
              {isPositive ? "+" : "-"}${Math.abs(item.delta).toLocaleString("en-US")}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes moneyFloatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, -10%) scale(0.9);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(1.08);
          }
        }

        @keyframes moneyFloatDown {
          0% {
            opacity: 0;
            transform: translate(-50%, -90%) scale(0.9);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 40%) scale(1.04);
          }
        }
      `}</style>
    </>
  );
}
