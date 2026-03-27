import type { Metadata } from "next"
import { PaymentsDashboard } from "@/components/dashboard/payments-dashboard"

export const metadata: Metadata = {
  title: "Pagamentos - Bincebroker Afiliados",
  description: "Gerencie e acompanhe seus pagamentos de comissões",
}

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pagamentos</h2>
        <p className="text-muted-foreground">Gerencie e acompanhe seus pagamentos de comissões</p>
      </div>
      <PaymentsDashboard />
    </div>
  )
}
