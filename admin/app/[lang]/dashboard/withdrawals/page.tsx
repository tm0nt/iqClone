import type { Metadata } from "next"
import { WithdrawalRequests } from "@/components/dashboard/withdrawal-requests"

export const metadata: Metadata = {
  title: "Solicitações de Saque - Dashboard",
  description: "Gerencie as solicitações de saque dos clientes",
}

export default function WithdrawalsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Solicitações de Saque</h2>
        <p className="text-muted-foreground">Gerencie as solicitações de saque dos clientes e afiliados</p>
      </div>

      <WithdrawalRequests />
    </div>
  )
}
