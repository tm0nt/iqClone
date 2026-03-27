import type { Metadata } from "next"
import { PairsManagement } from "@/components/dashboard/pairs-management"

export const metadata: Metadata = {
  title: "Paridades - Dashboard",
  description: "Gerencie as paridades do trading",
}

export default function ParitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Paridades</h2>
        <p className="text-muted-foreground">
          Cadastre, remova e ajuste o payout das paridades do trading.
        </p>
      </div>

      <PairsManagement />
    </div>
  )
}
