"use client"

import type { ReactNode } from "react"
import { Search, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FilterBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  filters?: ReactNode
  onRefresh?: () => void
  loading?: boolean
  trailing?: ReactNode
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  onRefresh,
  loading,
  trailing,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {onSearchChange && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="pl-8 h-9 w-full sm:w-[260px] text-sm"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
        {filters}
      </div>
      <div className="flex items-center gap-2">
        {trailing}
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="h-9">
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        )}
      </div>
    </div>
  )
}
