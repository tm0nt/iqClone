import type { Metadata } from "next"
import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatisticsTable } from "@/components/dashboard/statistics-table"
import { StatisticsTableUser } from "@/components/dashboard/statistics-table-user"


export const metadata: Metadata = {
  title: "Estatísticas - Bincebroker Afiliados",
  description: "Estatísticas e análises detalhadas",
}

export default function StatisticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Estatísticas</h2>
          <p className="text-muted-foreground">Monitore suas campanhas com dados em tempo real</p>
        </div>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between bg-muted/50">
          <div>
            <CardTitle>Estatísticas Gerais</CardTitle>
            <CardDescription>Monitore suas campanhas com os dados mais precisos em tempo real</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="general" className="w-full">
            <div className="border-b px-4">
              <TabsList className="w-full justify-start rounded-none border-b-0 p-0">
                <TabsTrigger
                  value="general"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Geral
                </TabsTrigger>
                <TabsTrigger
                  value="by-user"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Por Usuário
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="general" className="p-0">
              <StatisticsTable />
            </TabsContent>
            <TabsContent value="by-user" className="p-0">
              <StatisticsTableUser/>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
