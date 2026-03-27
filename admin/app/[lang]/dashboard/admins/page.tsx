import type { Metadata } from "next"
import { AdminsManagement } from "@/components/dashboard/admins-management"

export const metadata: Metadata = {
  title: "Gerenciamento de Administradores",
  description: "Cadastre e gerencie administradores do sistema",
}

export default function AdminsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administradores</h2>
        <p className="text-muted-foreground">Gerencie os administradores do sistema e seus níveis de acesso</p>
      </div>

      <AdminsManagement />
    </div>
  )
}
