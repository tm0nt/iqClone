"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  showing: number
  itemLabel?: string
  onPageChange: (page: number) => void
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  showing,
  itemLabel = "itens",
  onPageChange,
}: DataTablePaginationProps) {
  if (totalItems === 0) return null

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground">
        {showing} de {totalItems} {itemLabel}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-medium px-2 tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
