"use client"

import { useState } from "react"
import { Card, CardHeader, CardDescription, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { GeneralTab } from "@/components/dashboard/settings/GeneralTab"
import { FinancialTab } from "@/components/dashboard/settings/FinancialTab"
import { AffiliatesTab } from "@/components/dashboard/settings/AffiliatesTab"
import { PaymentTab } from "@/components/dashboard/settings/PaymentTab"

export function SettingsTabs() {
  return (
    <Card className="border border-border/60 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Configurações da Plataforma</CardTitle>
        <CardDescription className="text-xs">Gerencie todas as configurações da plataforma</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="h-9 rounded-lg bg-muted/60 p-1 gap-1">
            <TabsTrigger
              value="general"
              className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Geral
            </TabsTrigger>
            <TabsTrigger
              value="financial"
              className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Financeiro
            </TabsTrigger>
            <TabsTrigger
              value="affiliates"
              className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Afiliados
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              Pagamento
            </TabsTrigger>
          </TabsList>

          {/* forceMount preserva os componentes montados ao trocar de aba,
              evitando que os forms percam estado e refaçam fetch desnecessário. */}
          <div className="mt-6">
            <TabsContent value="general" forceMount className="data-[state=inactive]:hidden">
              <GeneralTab />
            </TabsContent>

            <TabsContent value="financial" forceMount className="data-[state=inactive]:hidden">
              <FinancialTab />
            </TabsContent>

            <TabsContent value="affiliates" forceMount className="data-[state=inactive]:hidden">
              <AffiliatesTab />
            </TabsContent>

            <TabsContent value="payment" forceMount className="data-[state=inactive]:hidden">
              <PaymentTab />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
