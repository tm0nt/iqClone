"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserTable } from "@/components/dashboard/user-table"
import { ArrowUpRight, Users, UserPlus, UserCheck, UserMinus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // Para notificações
import { useAffiliateUserAnalytics } from "@/hooks/use-affiliate-user-analytics"

export function UserAnalytics() {
  const { toast } = useToast()
  const { metrics, error } = useAffiliateUserAnalytics()

  useEffect(() => {
    if (!error) return

    toast({
      variant: "destructive",
      title: "Erro",
      description: error,
    })
  }, [error, toast])

  const totalAffiliates = metrics?.totalAffiliates ?? 0
  const newAffiliates = metrics?.newAffiliates ?? 0
  const activeUsers = metrics?.activeUsers ?? 0
  const churnRate = metrics?.churnRate ?? 0
  const percentageChangeTotalAffiliates =
    metrics?.percentageChangeTotalAffiliates ?? 0
  const percentageChangeNewAffiliates =
    metrics?.percentageChangeNewAffiliates ?? 0
  const percentageChangeChurnRate =
    metrics?.percentageChangeChurnRate ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAffiliates}</div>
            <p className="text-xs text-muted-foreground">
              {percentageChangeTotalAffiliates > 0
                ? `+${percentageChangeTotalAffiliates}% em relação ao mês anterior`
                : `${percentageChangeTotalAffiliates}% em relação ao mês anterior`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Usuários</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newAffiliates}</div>
            <div className="flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{percentageChangeNewAffiliates}% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <div className="flex items-center text-xs text-emerald-500">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +{percentageChangeNewAffiliates}% em relação ao mês anterior
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <UserMinus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate}%</div>
            <p className="text-xs text-muted-foreground">
              {percentageChangeChurnRate > 0
                ? `+${percentageChangeChurnRate}% em relação ao mês anterior`
                : `${percentageChangeChurnRate}% em relação ao mês anterior`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Lista de Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="space-y-4">
          <UserTable />
        </TabsContent>
      </Tabs>
    </div>
  )
}
