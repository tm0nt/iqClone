import type { Metadata } from "next"
import { TransactionsTable } from "@/components/dashboard/transactions-table"

export const metadata: Metadata = {
  title: "Transações - Dashboard",
  description: "Visualize e gerencie todas as transações da plataforma",
}

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <p className="text-muted-foreground">Visualize e gerencie todas as transações da plataforma</p>
      </div>

      <TransactionsTable />
    </div>
  )
}
