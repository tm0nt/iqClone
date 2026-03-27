import type { Metadata } from "next"
import { AuditLogs } from "@/components/dashboard/audit-logs"

export const metadata: Metadata = {
  title: "Auditoria - Dashboard",
  description: "Visualize os logs de auditoria da plataforma",
}

export default function AuditPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Auditoria</h2>
        <p className="text-muted-foreground">Visualize os logs de todas as atividades da plataforma</p>
      </div>

      <AuditLogs />
    </div>
  )
}
