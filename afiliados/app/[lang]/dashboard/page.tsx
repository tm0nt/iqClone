"use client"

import { useEffect, useState } from "react"
import { Activity, CreditCard, DollarSign, Download, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/dashboard/overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { DateRangePicker } from "@/components/date-range-picker"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { addDays } from "date-fns"
import { formatUsd } from "@shared/platform/branding"
import { useAffiliateDashboardMetrics } from "@/hooks/use-affiliate-dashboard-metrics"

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    setMounted(true)
  }, [])
  const { data } = useAffiliateDashboardMetrics(dateRange)

  const handleStartDateChange = (value: string) => {
    setDateRange((current) => ({
      ...current,
      from: new Date(value),
    }))
  }

  const handleEndDateChange = (value: string) => {
    setDateRange((current) => ({
      ...current,
      to: new Date(value),
    }))
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="animate-fade-in-up">
          <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
          <p className="text-muted-foreground">Visão geral das suas análises e desempenho</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 animate-fade-in-up animation-delay-100">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
          <Button variant="outline" size="sm" className="h-9 group">
            <Download className="mr-2 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total */}
        <Card
          className={cn(
            "overflow-hidden border-none bg-gradient-to-br from-primary/90 to-primary/80 shadow-md transition-all duration-500 hover:shadow-xl",
            mounted ? "animate-fade-in-up" : "opacity-0",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-primary-foreground">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <div className="rounded-full bg-primary-foreground/20 p-2">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="text-primary-foreground">
            <div className="text-2xl font-bold">
              {data ? formatUsd(data.receitaTotal) : "Carregando..."}
            </div>
            <div className="flex items-center text-xs">
              <Badge
                variant="outline"
                className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
              >
                +{data?.usuariosAtivos?.crescimento ?? 0}%
              </Badge>
              <span className="ml-2">em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        {/* Usuários Ativos */}
        <Card
          className={cn(
            "group border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            mounted ? "animate-fade-in-up animation-delay-100" : "opacity-0",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 transition-transform duration-300 group-hover:scale-110">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? `+${data.usuariosAtivos.totalUsuarios}` : "Carregando..."}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-500">
                +{data?.usuariosAtivos?.crescimento ?? 0}%
              </Badge>
              <span className="ml-2">em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        {/* Conversões */}
        <Card
          className={cn(
            "group border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            mounted ? "animate-fade-in-up animation-delay-200" : "opacity-0",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 transition-transform duration-300 group-hover:scale-110">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? `${data.conversoes.toFixed(2)}%` : "Carregando..."}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-500">
                +{data?.conversoes.toFixed(2) ?? 0}%
              </Badge>
              <span className="ml-2">em relação ao mês passado</span>
            </div>
          </CardContent>
        </Card>

        {/* Saldo disponível */}
        <Card
          className={cn(
            "group border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
            mounted ? "animate-fade-in-up animation-delay-300" : "opacity-0",
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo disponível</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600 transition-transform duration-300 group-hover:scale-110">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data ? formatUsd(data.saldoDisponivel) : "Carregando..."}
            </div>
          </CardContent>
        </Card>
      </div>

          <div className="grid gap-4 md:grid-cols-1">
            <Card className="col-span-4 border-none shadow-md">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>Receita mensal e aquisição de usuários</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
          </div>
    </div>
  )
}
