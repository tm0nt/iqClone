"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, DollarSign, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentsTable } from "@/components/dashboard/payments-table"
import { PaymentsChart } from "@/components/dashboard/payments-chart"
import { useAccountStore } from "@/store/account-store" 
import { formatUsd } from "@shared/platform/branding"
import { AffiliateWithdrawRequestModal } from "@/components/dashboard/affiliate-withdraw-request-modal"
import { useAffiliateWithdrawRequest } from "@/hooks/use-affiliate-withdraw-request"

export function PaymentsDashboard() {
  const { saldoComissao, pagamentosPendentes, totalRecebido, taxa } = useAccountStore()
  const { toast } = useToast()
  const withdrawRequest = useAffiliateWithdrawRequest({
    availableBalance: saldoComissao,
    fee: taxa,
    toast,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button onClick={withdrawRequest.open}>
            Solicitar Pagamento
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(saldoComissao)}</div>
            <p className="text-xs text-muted-foreground">Disponível para saque</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(pagamentosPendentes)}</div>
            <p className="text-xs text-muted-foreground">Em processamento</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(totalRecebido)}</div>
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
        </TabsList>

        <TabsContent value="history" className="space-y-4 animate-fade-in">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <CardDescription>Acompanhe todos os seus pagamentos recebidos e pendentes</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PaymentsTable />
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
      </Tabs>

      <AffiliateWithdrawRequestModal
        amount={withdrawRequest.amount}
        availableBalance={withdrawRequest.availableBalance}
        document={withdrawRequest.document}
        fee={withdrawRequest.fee}
        isOpen={withdrawRequest.isOpen}
        isSubmitting={withdrawRequest.isSubmitting}
        pixKey={withdrawRequest.pixKey}
        pixKeyType={withdrawRequest.pixKeyType}
        onAmountChange={withdrawRequest.setAmount}
        onClose={withdrawRequest.close}
        onDocumentChange={withdrawRequest.setDocument}
        onPixKeyChange={withdrawRequest.setPixKey}
        onPixKeyTypeChange={withdrawRequest.setPixKeyType}
        onSubmit={() => {
          void withdrawRequest.submit()
        }}
      />
    </div>
  )
}
