"use client"

import { Inbox } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  colSpan?: number
}

export function EmptyState({
  icon,
  title = "Nenhum resultado encontrado",
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60 mb-3">
        {icon || <Inbox className="h-6 w-6 text-muted-foreground" />}
      </div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1 max-w-[260px]">{description}</p>
      )}
    </div>
  )
}

export function TableEmptyRow({ colSpan, title, description }: EmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-0">
        <EmptyState title={title} description={description} />
      </td>
    </tr>
  )
}
