import type { Metadata } from "next"
import { SettingsTabs }  from "@/components/dashboard/settings-tabs"

export const metadata: Metadata = {
  title: "Configurações - Dashboard",
  description: "Gerencie as configurações da plataforma",
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações da plataforma</p>
      </div>

      <SettingsTabs />
    </div>
  )
}
