"use client"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Download, Filter, Plus, Search, Users, UserPlus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { AffiliatesTable } from "@/components/dashboard/affiliates-table"
import { AffiliatesChart } from "@/components/dashboard/affiliates-chart"

export function AffiliatesDashboard() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar afiliado..."
              className="w-full pl-8 sm:w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Convidar Afiliado
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Afiliados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+12 em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Afiliados Ativos</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">182</div>
            <p className="text-xs text-muted-foreground">74.3% do total</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Comissões Pagas</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,450.00</div>
            <p className="text-xs text-muted-foreground">+15.2% em relação ao mês passado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.2%</div>
            <p className="text-xs text-muted-foreground">+1.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 tab-highlight-animation">
          <TabsTrigger value="overview" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Afiliados
          </TabsTrigger>
          <TabsTrigger value="recruitment" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Recrutamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Desempenho dos Afiliados</CardTitle>
              <CardDescription>Análise de crescimento e desempenho da sua rede de afiliados</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <AffiliatesChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliates" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Lista de Afiliados</CardTitle>
                <CardDescription>Gerencie e analise seus afiliados ativos</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <AffiliatesTable searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Programa de Recrutamento</CardTitle>
              <CardDescription>Ferramentas para expandir sua rede de afiliados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Link de Convite</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Compartilhe este link para convidar novos afiliados para o seu programa
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input value="https://bincebroker.com/affiliate/invite/YOUR_ID" readOnly className="bg-muted/50" />
                    <Button variant="outline" size="sm">
                      Copiar
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Materiais Promocionais</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Banners e materiais para ajudar seus afiliados a promover seus produtos
                  </p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="overflow-hidden rounded-lg border">
                      <img
                        src="/placeholder.svg?key=ii9s8"
                        alt="Banner promocional"
                        className="h-24 w-full object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm font-medium">Banner 300x100</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">PNG</p>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <Download className="mr-1 h-3 w-3" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border">
                      <img
                        src="/placeholder.svg?key=v386o"
                        alt="Banner quadrado"
                        className="h-24 w-full object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm font-medium">Banner 250x250</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">PNG</p>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <Download className="mr-1 h-3 w-3" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-lg border">
                      <img
                        src="/placeholder.svg?key=rqpwk"
                        alt="Banner leaderboard"
                        className="h-24 w-full object-cover"
                      />
                      <div className="p-2">
                        <p className="text-sm font-medium">Banner 728x90</p>
                        <div className="mt-1 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">PNG</p>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <Download className="mr-1 h-3 w-3" />
                            Baixar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium">Programa de Indicação</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ganhe comissões extras ao indicar novos afiliados para o programa
                  </p>
                  <div className="mt-3">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Comissão por Indicação</p>
                          <p className="text-sm text-muted-foreground">5% das comissões do afiliado indicado</p>
                        </div>
                        <Button size="sm">Ver Detalhes</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
