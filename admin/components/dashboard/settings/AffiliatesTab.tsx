"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function AffiliatesTab() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [settings, setSettings] = useState({
    minCpa: 0,
    cpaValue: 0,
    fakeRevshare: 0,
    realRevshare: 0,
    isNegativeRevshare: false,
    negativeRevshareValue: 0,
  })

  useEffect(() => {
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) =>
        setSettings({
          minCpa: data.cpaMin || 0,
          cpaValue: data.cpaValor || 0,
          fakeRevshare: data.revShareFalsoValue || 0,
          realRevshare: data.revShareValue || 0,
          isNegativeRevshare: data.revShareNegativo !== null,
          negativeRevshareValue: data.revShareNegativo || 0,
        })
      )
      .catch(() =>
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações de afiliados.",
          variant: "destructive",
        })
      )
  }, [])

  const handleSave = async () => {
    setIsLoading(true)

    const payload = {
      cpaMin: settings.minCpa,
      cpaValor: settings.cpaValue,
      revShareFalsoValue: settings.fakeRevshare,
      revShareValue: settings.realRevshare,
      revShareNegativo: settings.isNegativeRevshare ? settings.negativeRevshareValue : null,
    }

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error()

      toast({
        title: "Sucesso",
        description: "Configurações de afiliados salvas com sucesso!",
      })
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações de afiliados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>CPA Mínimo</Label>
          <Input
            type="number"
            min={0}
            step={1}
            value={settings.minCpa}
            onChange={(e) => setSettings({ ...settings, minCpa: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Valor CPA</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={settings.cpaValue}
            onChange={(e) => setSettings({ ...settings, cpaValue: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Revshare (%)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={settings.realRevshare}
            onChange={(e) => setSettings({ ...settings, realRevshare: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>Revshare Falso (%)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={settings.fakeRevshare}
            onChange={(e) => setSettings({ ...settings, fakeRevshare: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Label htmlFor="revshare-negativo" className="whitespace-nowrap">
          Revshare Negativo?
        </Label>
        <Switch
          id="revshare-negativo"
          checked={settings.isNegativeRevshare}
          onCheckedChange={(checked) => setSettings({ ...settings, isNegativeRevshare: checked })}
        />
      </div>

      {settings.isNegativeRevshare && (
        <div className="max-w-sm space-y-2">
          <Label>Valor do Revshare Negativo (%)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={settings.negativeRevshareValue}
            onChange={(e) => setSettings({ ...settings, negativeRevshareValue: Number(e.target.value) })}
          />
        </div>
      )}

      <Button onClick={handleSave} disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </div>
  )
}