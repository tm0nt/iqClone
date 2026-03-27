"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Download, Filter, Plus, Search, CreditCard, DollarSign, Calendar, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { PaymentsChart } from "@/components/dashboard/payments-chart"

export function PaymentsDashboard() {
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
              placeholder="Buscar pagamento..."
              className="w-full pl-8 sm:w-[240px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Solicitar Pagamento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,250.00</div>
            <p className="text-xs text-muted-foreground">Disponível para saque</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,850.00</div>
            <p className="text-xs text-muted-foreground">Em processamento</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido (2023)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28,450.00</div>
            <p className="text-xs text-muted-foreground">+15.2% em relação ao ano passado</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximo Pagamento</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,150.00</div>
            <p className="text-xs text-muted-foreground">Previsto para 15/05/2023</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 tab-highlight-animation">
          <TabsTrigger value="history" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Histórico
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Análise
          </TabsTrigger>
          <TabsTrigger value="methods" className="rounded-sm px-3 py-1.5 text-sm font-medium transition-all">
            Métodos de Pagamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Acompanhe todos os seus pagamentos recebidos e pendentes</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <PaymentsTable searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Análise de Pagamentos</CardTitle>
              <CardDescription>Visualize a evolução dos seus pagamentos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <PaymentsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Gerencie seus métodos de pagamento para receber comissões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-primary"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Banco do Brasil</p>
                        <p className="text-sm text-muted-foreground">Conta: **** 1234</p>
                      </div>
                    </div>
                    <Badge className="bg-success/10 text-success hover:bg-success/20">Padrão</Badge>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-info"
                        >
                          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                          <path d="M9.5 9a2.5 2.5 0 0 1 5 0v6a2.5 2.5 0 0 1-5 0V9z" />
                          <path d="M6.5 10H5a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1.5" />
                          <path d="M17.5 10H19a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">email@example.com</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Definir como Padrão
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-accent-foreground"
                        >
                          <rect width="20" height="12" x="2" y="6" rx="2" />
                          <circle cx="12" cy="12" r="2" />
                          <path d="M6 12h.01M18 12h.01" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Pix</p>
                        <p className="text-sm text-muted-foreground">CPF: ***.123.456-**</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Definir como Padrão
                    </Button>
                  </div>
                </div>

                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Novo Método
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
