"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function FinancialTab() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [settings, setSettings] = useState({
    minWithdrawal: 0,
    minDeposit: 0,
    withdrawalFee: 0,
  })

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) =>
        setSettings({
          minWithdrawal: data.valorMinimoSaque || 0,
          minDeposit: data.valorMinimoDeposito || 0,
          withdrawalFee: data.taxa || 0,
        })
      )
      .catch(() =>
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações financeiras.",
          variant: "destructive",
        })
      )
  }, [])

  const handleSave = async () => {
    setIsLoading(true)

    const payload = {
      valorMinimoSaque: settings.minWithdrawal,
      valorMinimoDeposito: settings.minDeposit,
      taxa: settings.withdrawalFee,
    }

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error()
      }

      toast({
        title: "Sucesso",
        description: "Configurações financeiras salvas com sucesso!",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações financeiras.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Valor Mínimo de Saque</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={settings.minWithdrawal}
          onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <Label>Valor Mínimo de Depósito</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={settings.minDeposit}
          onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-2">
        <Label>Taxa de Saque (%)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={settings.withdrawalFee}
          onChange={(e) => setSettings({ ...settings, withdrawalFee: Number(e.target.value) })}
        />
      </div>
      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  )
}