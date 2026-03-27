"use client"

import { useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"
import {
  CreditCard,
  DollarSign,
  Users,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Wallet,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialOverview } from "@/components/dashboard/financial-overview"
import { DateRangePicker } from "@/components/date-range-picker"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useAdminDashboardMetrics } from "@/hooks/use-admin-dashboard-metrics"

import ptTranslations from "@/dictionaries/dashboard/pt.json"
import enTranslations from "@/dictionaries/dashboard/en.json"
import esTranslations from "@/dictionaries/dashboard/es.json"

/* ─── Skeleton card ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="skeleton h-3 w-28 rounded" />
            <div className="skeleton h-7 w-36 rounded" />
          </div>
          <div className="skeleton h-10 w-10 rounded-xl" />
        </div>
        <div className="mt-4 skeleton h-3 w-44 rounded" />
      </CardContent>
    </Card>
  )
}

function SkeletonChart() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <div className="skeleton h-4 w-48 rounded" />
        <div className="skeleton h-3 w-64 rounded mt-1" />
      </CardHeader>
      <CardContent className="pb-6 pt-0">
        <div className="skeleton h-[300px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

/* ─── Stat badge ─────────────────────────────────────── */
function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const positive = value >= 0
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        positive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400"
      )}
    >
      {positive ? (
        <TrendingUp className="h-2.5 w-2.5" />
      ) : (
        <TrendingDown className="h-2.5 w-2.5" />
      )}
      {Math.abs(value)}{suffix}
    </span>
  )
}

/* ─── Main page ──────────────────────────────────────── */
export default function DashboardPage() {
  const params = useParams()
  const langParam = Array.isArray(params.lang) ? params.lang[0] : params.lang
  const currentLang = langParam === "en" || langParam === "es" ? langParam : "pt"

  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  })

  const translations: any = { pt: ptTranslations, en: enTranslations, es: esTranslations }
  const t = translations[currentLang] || translations["pt"]

  useEffect(() => { setMounted(true) }, [])
  const { data, loading, metrics } = useAdminDashboardMetrics(dateRange)

  // Derived metrics
  const totalDeposits = metrics.totalDeposits
  const totalWithdrawals = metrics.totalWithdrawals
  const netRevenue = metrics.netRevenue
  const clientGrowth = metrics.clientGrowth
  const pendingCount = metrics.pendingCount
  const pendingValue = metrics.pendingValue

  const statCards = [
    {
      label: t.totalDeposits,
      value: `$${totalDeposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: t.comparedLastMonth,
      badge: clientGrowth,
      icon: DollarSign,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      delay: 0,
    },
    {
      label: t.totalWithdrawals,
      value: `$${totalWithdrawals.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${pendingCount} ${t.requestsAwaiting}`,
      badge: null,
      icon: CreditCard,
      accent: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/30",
      delay: 60,
    },
    {
      label: t.registeredClients,
      value: String(metrics.totalClients ?? 0),
      sub: t.comparedLastMonth,
      badge: clientGrowth,
      icon: Users,
      accent: "text-violet-600",
      iconBg: "bg-violet-50 dark:bg-violet-950/30",
      delay: 120,
    },
    {
      label: t.pendingWithdrawals,
      value: `$${pendingValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      sub: `${pendingCount} ${t.requestsAwaiting}`,
      badge: null,
      icon: AlertCircle,
      accent: "text-amber-600",
      iconBg: "bg-amber-50 dark:bg-amber-950/30",
      delay: 180,
    },
  ]

  const summaryCards = [
    {
      label: "Receita Líquida",
      value: `$${netRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      desc: "Depósitos − Saques no período",
      icon: Wallet,
      accent: netRevenue >= 0 ? "text-emerald-600" : "text-red-500",
      iconBg: netRevenue >= 0 ? "bg-emerald-50 dark:bg-emerald-950/30" : "bg-red-50 dark:bg-red-950/30",
    },
    {
      label: "Taxa de Conversão",
      value: metrics.conversionRate != null ? `${metrics.conversionRate.toFixed(1)}%` : "—",
      desc: "Depósitos por cliente",
      icon: Activity,
      accent: "text-primary",
      iconBg: "bg-primary/8",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t.title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{t.overview}</p>
        </div>
        <DateRangePicker onDateRangeChange={setDateRange} dateRange={dateRange} />
      </div>

      {/* ── KPI stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card, i) => (
              <Card
                key={i}
                style={{ animationDelay: `${card.delay}ms` }}
                className={cn(
                  "group border border-border/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-px",
                  mounted ? "animate-fade-in-up" : "opacity-0"
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground truncate">
                        {card.label}
                      </p>
                      <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
                        {card.value}
                      </p>
                    </div>
                    <div className={cn("ml-3 shrink-0 rounded-xl p-2.5", card.iconBg)}>
                      <card.icon className={cn("h-4 w-4", card.accent)} />
                    </div>
                  </div>
                  <div className="mt-3.5 flex items-center gap-2">
                    {card.badge !== null && <TrendBadge value={card.badge} />}
                    <span className="text-xs text-muted-foreground">{card.sub}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ── Summary mini cards ── */}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {summaryCards.map((card, i) => (
            <Card
              key={i}
              className="border border-border/60 shadow-sm transition-all hover:shadow-md hover:-translate-y-px"
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("rounded-xl p-3", card.iconBg)}>
                  <card.icon className={cn("h-5 w-5", card.accent)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums text-foreground">
                    {card.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/70">{card.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Financial chart ── */}
      {loading ? (
        <SkeletonChart />
      ) : (
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">{t.financialOverview}</CardTitle>
                <CardDescription className="mt-0.5 text-xs">{t.annualPerformance}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 pt-4 pl-2 pr-4">
            <FinancialOverview />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
