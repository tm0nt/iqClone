import type { Metadata } from "next"
import { PromotionsManagement } from "@/components/dashboard/promotions-management"

export const metadata: Metadata = {
  title: "Promoções - Dashboard",
  description: "Gerencie promoções da plataforma",
}

export default function PromotionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Promoções</h2>
        <p className="text-muted-foreground">
          Crie campanhas dinâmicas de bônus de depósito e multiplicador de revenue.
        </p>
      </div>

      <PromotionsManagement />
    </div>
  )
}
