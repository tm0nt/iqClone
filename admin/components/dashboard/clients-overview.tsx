"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, CreditCard, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatUsd } from "@shared/platform/branding"



export function ClientsOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/clients/overview");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return         <div className="flex justify-center items-center">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    <p className="ml-2 text-muted-foreground">Carregando...</p>
  </div>
  }

  if (!data) {
    return <div>Não há dados suficientes para mostrar.</div>;
  }

  return (
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {/* Card de Clientes Cadastrados */}
  <Card className="border-none shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Clientes Cadastrados</CardTitle>
      <div className="rounded-full bg-info/10 p-2 text-info transition-transform duration-300 group-hover:scale-110">
        <Users className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{data?.totalClientes ?? 0}</div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
          +{data?.novosClientes ?? 0}
        </Badge>
        <span className="ml-2">no último mês</span>
      </div>
    </CardContent>
  </Card>

  {/* Card de Valor Médio de Depósito */}
  <Card className="border-none shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Valor Médio de Depósito</CardTitle>
      <div className="rounded-full bg-success/10 p-2 text-success transition-transform duration-300 group-hover:scale-110">
        <DollarSign className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">

        {formatUsd(data?.valorMedioDeposito)}
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
          {data?.variacaoMediaDeposito ?? 0}%
        </Badge>
        <span className="ml-2">em relação ao período anterior</span>
      </div>
    </CardContent>
  </Card>

  {/* Card de Depósitos Pendentes */}
  <Card className="border-none shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Depósitos Pendentes</CardTitle>
      <div className="rounded-full bg-warning/10 p-2 text-warning transition-transform duration-300 group-hover:scale-110">
        <CreditCard className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
      {formatUsd(data?.depositoPendenteValor)}
      </div>
      <div className="flex items-center text-xs text-muted-foreground">
        <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
        {data?.totalDepositosPendentes ?? 0}
        </Badge>
        <span className="ml-2">depositos totais</span>
      </div>
    </CardContent>
  </Card>

  {/* Card de Novos Clientes */}
  <Card className="border-none shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
      <div className="rounded-full bg-accent p-2 text-accent-foreground transition-transform duration-300 group-hover:scale-110">
        <UserPlus className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{data?.novosClientes ?? 0}</div>
      <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
    </CardContent>
  </Card>
</div>

  );
}
