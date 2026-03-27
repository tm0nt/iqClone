import type { Metadata } from "next"
import { KycManagement } from "@/components/dashboard/kyc-management"

export const metadata: Metadata = {
  title: "KYC - Dashboard",
  description: "Gerencie documentos KYC dos clientes",
}

export default function KycPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">KYC</h2>
        <p className="text-muted-foreground">
          Aprove, rejeite e acompanhe as verificacoes documentais.
        </p>
      </div>

      <KycManagement />
    </div>
  )
}
