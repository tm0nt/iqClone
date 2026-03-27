import type { Metadata } from "next"
import { OffersDashboard } from "@/components/dashboard/offers-dashboard"

export const metadata: Metadata = {
  title: "Ofertas - Bincebroker Afiliados",
  description: "Gerencie e monitore suas ofertas de afiliados",
}

export default function OffersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ofertas</h2>
        <p className="text-muted-foreground">Gerencie e monitore suas ofertas de afiliados</p>
      </div>
      <OffersDashboard />
    </div>
  )
}
