"use client"

import { useEffect, useState } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import {
  ADMIN_FINANCIAL_INTERVALS,
  useAdminFinancialOverview,
} from "@/hooks/use-admin-financial-overview"

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border/60 bg-background/98 p-3.5 shadow-xl backdrop-blur-sm">
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-semibold tabular-nums text-foreground">
                ${Number(entry.value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {payload.length === 2 && (
            <>
              <div className="my-1.5 border-t border-border/40" />
              <div className="flex items-center justify-between gap-6 text-sm">
                <span className="text-muted-foreground">Líquido</span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    (payload[0].value - payload[1].value) >= 0
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  ${(payload[0].value - payload[1].value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
  return null
}

export function FinancialOverview() {
  const [mounted, setMounted] = useState(false)
  const {
    chartData,
    interval,
    loading,
    netRevenue,
    totalDeposits,
    totalWithdrawals,
    isEmpty,
    setInterval,
  } = useAdminFinancialOverview("6m")

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className={cn("transition-opacity duration-500", mounted ? "opacity-100" : "opacity-0")}>
      {/* Top row: legend + interval selector */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="text-xs font-medium text-muted-foreground">Depósitos</span>
            <span className="ml-1 text-xs font-semibold text-foreground tabular-nums">
              ${totalDeposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span className="text-xs font-medium text-muted-foreground">Saques</span>
            <span className="ml-1 text-xs font-semibold text-foreground tabular-nums">
              ${totalWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            <span className="text-xs font-medium text-muted-foreground">Líquido</span>
            <span
              className={cn(
                "ml-1 text-xs font-semibold tabular-nums",
                netRevenue >= 0 ? "text-success" : "text-destructive"
              )}
            >
              ${netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1">
          {ADMIN_FINANCIAL_INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setInterval(opt.value)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all",
                interval === opt.value
                  ? "bg-white text-foreground shadow-sm dark:bg-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : isEmpty ? (
        <div className="flex h-[300px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Nenhum dado para o período selecionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradDepositos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.18} />
                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradSaques" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.18} />
                <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.05)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={(v) =>
                v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
              }
              dx={-4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="depositos"
              name="Depósitos"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              fill="url(#gradDepositos)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--success))" }}
            />
            <Area
              type="monotone"
              dataKey="saques"
              name="Saques"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              fill="url(#gradSaques)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0, fill: "hsl(var(--destructive))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
