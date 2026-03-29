"use client";

import * as React from "react";

export interface SettlementToastData {
  id: string;
  image: string;
  assetName: string;
  result: "win" | "loss";
  profit: number;
  value: number;
}

type ShowFn = (data: Omit<SettlementToastData, "id">) => void;

let _show: ShowFn | null = null;

export function showSettlementToast(data: Omit<SettlementToastData, "id">) {
  _show?.(data);
}

function formatPnL(result: "win" | "loss", profit: number, value: number) {
  if (result === "win") {
    return `+$${profit.toFixed(2)}`;
  }
  return `-$${value.toFixed(2)}`;
}

function SettlementToastItem({
  data,
  onRemove,
}: {
  data: SettlementToastData;
  onRemove: () => void;
}) {
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    const fadeTimer = setTimeout(() => setExiting(true), 3500);
    const removeTimer = setTimeout(onRemove, 4000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onRemove]);

  const isWin = data.result === "win";

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-500 ${
        exiting
          ? "-translate-x-4 opacity-0"
          : "translate-x-0 opacity-100 animate-in slide-in-from-left-5"
      }`}
      style={{
        backgroundColor: "#1e1e2d",
        borderColor: isWin
          ? "var(--platform-success-color)"
          : "var(--platform-danger-color)",
        borderWidth: "1px",
      }}
    >
      {data.image && (
        <img
          src={data.image}
          alt={data.assetName}
          className="h-7 w-7 rounded-full object-cover"
        />
      )}
      <span className="text-sm text-white/80">{data.assetName}</span>
      <span
        className="ml-auto text-sm font-bold"
        style={{
          color: isWin
            ? "var(--platform-success-color)"
            : "var(--platform-danger-color)",
        }}
      >
        {formatPnL(data.result, data.profit, data.value)}
      </span>
    </div>
  );
}

export function SettlementToastContainer() {
  const [toasts, setToasts] = React.useState<SettlementToastData[]>([]);

  React.useEffect(() => {
    _show = (data) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { ...data, id }]);
    };
    return () => {
      _show = null;
    };
  }, []);

  const remove = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 md:max-w-[340px]">
      {toasts.map((toast) => (
        <SettlementToastItem
          key={toast.id}
          data={toast}
          onRemove={() => remove(toast.id)}
        />
      ))}
    </div>
  );
}
