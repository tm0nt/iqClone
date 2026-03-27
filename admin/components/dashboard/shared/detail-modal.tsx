"use client"

import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface DetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg"
}

const sizeMap = {
  sm: "sm:max-w-[420px]",
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[720px]",
}

export function DetailModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: DetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeMap[size]} p-0 gap-0 overflow-hidden`}>
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <DialogTitle className="text-base">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-xs">{description}</DialogDescription>
          )}
        </DialogHeader>
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{children}</div>
        {footer && (
          <DialogFooter className="px-6 py-4 border-t bg-muted/20">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Standardized detail row for modals
export function DetailRow({ label, value, className = "" }: { label: string; value: ReactNode; className?: string }) {
  return (
    <div className={`flex items-start justify-between py-2.5 border-b border-border/50 last:border-0 ${className}`}>
      <span className="text-xs text-muted-foreground font-medium shrink-0">{label}</span>
      <span className="text-sm font-medium text-right ml-4">{value || "—"}</span>
    </div>
  )
}
