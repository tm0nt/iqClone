import type { Metadata } from "next"
import { ClientsTable } from "@/components/dashboard/clients-table"
import { ClientsOverview } from "@/components/dashboard/clients-overview"

export const metadata: Metadata = {
  title: "Clientes - Dashboard",
  description: "Gerenciamento de clientes cadastrados na plataforma",
}

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <p className="text-muted-foreground">Gerencie os clientes cadastrados na plataforma</p>
      </div>

      <ClientsOverview />
      <ClientsTable />
    </div>
  )
}
