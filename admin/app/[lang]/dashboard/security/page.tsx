import type { Metadata } from "next"
import { SecuritySettings } from "@/components/dashboard/security-settings"

export const metadata: Metadata = {
  title: "Segurança - Bincebroker Afiliados",
  description: "Gerencie as configurações de segurança da sua conta",
}

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Segurança</h2>
        <p className="text-muted-foreground">Melhore a segurança da sua conta com ferramentas de proteção adicionais</p>
      </div>
      <SecuritySettings />
    </div>
  )
}
