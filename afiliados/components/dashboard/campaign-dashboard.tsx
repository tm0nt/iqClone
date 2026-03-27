"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, BarChart3, Target, TrendingUp, Users } from "lucide-react"

export function CampaignDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Desempenho de Campanhas</h2>
          <p className="text-sm text-muted-foreground">Acompanhe o desempenho das suas campanhas de marketing.</p>
        </div>
        <Button>Nova Campanha</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,345</div>
            <div className="flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +12.5% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,678</div>
            <div className="flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +8.3% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
