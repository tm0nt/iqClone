import type { Metadata } from "next"
import { ProfileSettings } from "@/components/dashboard/profile-settings"

export const metadata: Metadata = {
  title: "Perfil - Bincebroker Afiliados",
  description: "Gerencie suas informações de perfil",
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Informações do Perfil</h2>
        <p className="text-muted-foreground">Edite seus dados pessoais e informações de contato</p>
      </div>
      <ProfileSettings />
    </div>
  )
}
