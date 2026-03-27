"use client";

import * as React from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  open: (props: ToastProps) => void;
  close: (id: string) => void;
}>({
  open: () => {},
  close: () => {},
});

export const useToast = () => React.useContext(ToastProvider);

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
} & VariantProps<typeof toastVariants>;

// Updated toastVariants with white background and rounded borders
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-platform-overlay-border bg-white p-4 transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full",
  {
    variants: {
      variant: {
        default: "border-platform-overlay-border",
        success: "border-l-4 border-l-platform-success border-platform-overlay-border",
        error: "border-l-4 border-l-platform-danger border-platform-overlay-border",
        warning: "border-l-4 border-l-platform-warning border-platform-overlay-border",
        info: "border-l-4 border-l-platform-info border-platform-overlay-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

// Toast component with variant-colored title and progress bar
export function Toast({
  id,
  title,
  description,
  action,
  variant,
  duration,
  onClose,
}: ToastProps & { onClose?: () => void }) {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    if (!duration) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      setProgress((remaining / duration) * 100);
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  const renderIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-platform-success flex-shrink-0" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-platform-danger flex-shrink-0" />;
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-platform-warning flex-shrink-0" />
        );
      case "info":
        return <Info className="h-5 w-5 text-platform-info flex-shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(toastVariants({ variant }), "bg-opacity-95")}>
      <div className="flex items-start gap-2.5">
        {renderIcon()}
        <div className="flex-1 space-y-0.5">
          {title && (
            <div className={cn("text-sm font-medium tracking-tight text-black")}>
              {title}
            </div>
          )}
          {description && (
            <div className="text-xs leading-relaxed text-black/70">
              {description}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {action}
          <button
            onClick={onClose}
            className="rounded-full p-1 text-black/50 hover:bg-black/5 hover:text-black/70 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-platform-info"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-platform-overlay-surface/10">
        <div
          className={cn(
            "h-full transition-all duration-50",
            variant === "success" && "bg-platform-success",
            variant === "error" && "bg-platform-danger",
            variant === "warning" && "bg-platform-warning",
            variant === "info" && "bg-platform-info",
            variant === "default" && "bg-platform-overlay-muted",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ToastContainer with clean stacking
export function ToastContainer({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<(ToastProps & { id: string })[]>(
    [],
  );

  const open = React.useCallback(
    (props: ToastProps) => {
      const id = props.id || Math.random().toString(36).substring(2, 9);
      const duration = props.duration || 5000;

      setToasts((prev) => [...prev, { ...props, id }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);

      return id;
    },
    [setToasts],
  );

  const close = React.useCallback(
    (id: string) => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  return (
    <ToastProvider.Provider value={{ open, close }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[400px]">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{
              transform: `translateY(-${index * 8}px)`,
              transition: "transform 0.3s ease-in-out",
            }}
          >
            <Toast {...toast} onClose={() => close(toast.id)} />
          </div>
        ))}
      </div>
    </ToastProvider.Provider>
  );
}
