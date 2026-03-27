import type { Metadata } from "next"
import { UserAnalytics } from "@/components/dashboard/user-analytics"

export const metadata: Metadata = {
  title: "Análise de Usuários | Dashboard",
  description: "Análise detalhada de usuários e comportamento.",
}

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análise de Usuários</h1>
          <p className="text-muted-foreground">Monitore o comportamento e crescimento dos usuários da plataforma.</p>
        </div>
      </div>
      <UserAnalytics />
    </div>
  )
}
