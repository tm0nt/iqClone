"use client"

import type { ReactNode } from "react"

interface StatCardProps {
  title: string
  value: string | ReactNode
  subtitle?: string
  icon?: ReactNode
  iconClassName?: string
}

export function StatCard({ title, value, subtitle, icon, iconClassName = "bg-primary/10 text-primary" }: StatCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClassName}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
}
