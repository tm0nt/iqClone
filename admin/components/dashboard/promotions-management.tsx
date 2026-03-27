"use client"

import { useEffect, useMemo, useState } from "react"
import { Gift, Megaphone, Pencil, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type PromotionType = "deposit_bonus" | "revenue_multiplier"

type PromotionItem = {
  id: string
  slug: string
  title: string
  description: string | null
  rulesText: string | null
  type: PromotionType
  bonusPercent: number | null
  bonusFixedAmount: number | null
  maxBonusAmount: number | null
  revenueMultiplier: number | null
  minDepositAmount: number | null
  maxClaimsTotal: number | null
  validFrom: string | null
  validUntil: string | null
  isActive: boolean
  claimsCount: number
}

type PromotionFormState = {
  title: string
  slug: string
  description: string
  rulesText: string
  type: PromotionType
  bonusPercent: string
  bonusFixedAmount: string
  maxBonusAmount: string
  revenueMultiplier: string
  minDepositAmount: string
  maxClaimsTotal: string
  validFrom: string
  validUntil: string
  isActive: boolean
}

const emptyForm: PromotionFormState = {
  title: "",
  slug: "",
  description: "",
  rulesText: "",
  type: "deposit_bonus",
  bonusPercent: "",
  bonusFixedAmount: "",
  maxBonusAmount: "",
  revenueMultiplier: "1.2",
  minDepositAmount: "",
  maxClaimsTotal: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
}

function toDatetimeLocal(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

export function PromotionsManagement() {
  const { toast } = useToast()
  const [items, setItems] = useState<PromotionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PromotionFormState>(emptyForm)

  const activeCount = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items],
  )

  const loadPromotions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/promotions", {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Falha ao carregar promoções")
      setItems(await response.json())
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar as promoções.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPromotions()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o nome da promoção.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const payload = {
        ...form,
        title: form.title.trim(),
        slug: form.slug.trim() || form.title.trim(),
      }

      const response = await fetch(
        editingId ? `/api/admin/promotions/${editingId}` : "/api/admin/promotions",
        {
          method: editingId ? "PATCH" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Falha ao salvar promoção")
      }

      toast({
        title: editingId ? "Promoção atualizada" : "Promoção criada",
        description: "As regras já estão disponíveis para a plataforma.",
        variant: "success",
      })

      resetForm()
      await loadPromotions()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Nao foi possivel salvar a promoção.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: PromotionItem) => {
    setEditingId(item.id)
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description ?? "",
      rulesText: item.rulesText ?? "",
      type: item.type,
      bonusPercent: item.bonusPercent?.toString() ?? "",
      bonusFixedAmount: item.bonusFixedAmount?.toString() ?? "",
      maxBonusAmount: item.maxBonusAmount?.toString() ?? "",
      revenueMultiplier: item.revenueMultiplier?.toString() ?? "1.2",
      minDepositAmount: item.minDepositAmount?.toString() ?? "",
      maxClaimsTotal: item.maxClaimsTotal?.toString() ?? "",
      validFrom: toDatetimeLocal(item.validFrom),
      validUntil: toDatetimeLocal(item.validUntil),
      isActive: item.isActive,
    })
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/promotions/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Falha ao remover promoção")
      toast({
        title: "Promoção removida",
        description: "A promoção foi excluída com sucesso.",
        variant: "success",
      })
      if (editingId === id) {
        resetForm()
      }
      await loadPromotions()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: "Nao foi possivel remover a promoção.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px,1fr]">
      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Gift className="h-4 w-4" />
            {editingId ? "Editar promoção" : "Nova promoção"}
          </CardTitle>
          <CardDescription className="text-xs">
            Configure bônus de depósito ou multiplicador de revenue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Ex.: Bônus USD 50"
            />
          </div>

          <div className="space-y-2">
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, slug: event.target.value }))
              }
              placeholder="bonus-usd-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={form.type === "deposit_bonus" ? "default" : "outline"}
                onClick={() =>
                  setForm((prev) => ({ ...prev, type: "deposit_bonus" }))
                }
              >
                Bônus de depósito
              </Button>
              <Button
                type="button"
                variant={
                  form.type === "revenue_multiplier" ? "default" : "outline"
                }
                onClick={() =>
                  setForm((prev) => ({ ...prev, type: "revenue_multiplier" }))
                }
              >
                Revenue multiplier
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Regras e limites</Label>
            <Textarea
              value={form.rulesText}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, rulesText: event.target.value }))
              }
              rows={4}
            />
          </div>

          {form.type === "deposit_bonus" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bônus %</Label>
                <Input
                  value={form.bonusPercent}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      bonusPercent: event.target.value,
                    }))
                  }
                  placeholder="20"
                />
              </div>
              <div className="space-y-2">
                <Label>Bônus fixo (USD)</Label>
                <Input
                  value={form.bonusFixedAmount}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      bonusFixedAmount: event.target.value,
                    }))
                  }
                  placeholder="25"
                />
              </div>
              <div className="space-y-2">
                <Label>Depósito mínimo (USD)</Label>
                <Input
                  value={form.minDepositAmount}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      minDepositAmount: event.target.value,
                    }))
                  }
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Teto do bônus (USD)</Label>
                <Input
                  value={form.maxBonusAmount}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      maxBonusAmount: event.target.value,
                    }))
                  }
                  placeholder="150"
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Multiplicador</Label>
                <Input
                  value={form.revenueMultiplier}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      revenueMultiplier: event.target.value,
                    }))
                  }
                  placeholder="1.2"
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Limite total de resgates</Label>
              <Input
                value={form.maxClaimsTotal}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    maxClaimsTotal: event.target.value,
                  }))
                }
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Ativa</Label>
              <div className="flex h-10 items-center rounded-md border border-border px-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isActive: checked }))
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Início</Label>
              <Input
                type="datetime-local"
                value={form.validFrom}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, validFrom: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Validade</Label>
              <Input
                type="datetime-local"
                value={form.validUntil}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, validUntil: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={saving}>
              <Plus className="mr-2 h-4 w-4" />
              {editingId ? "Salvar alterações" : "Criar promoção"}
            </Button>
            {editingId ? (
              <Button variant="outline" onClick={resetForm}>
                Cancelar edição
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Megaphone className="h-4 w-4" />
            Promoções cadastradas
          </CardTitle>
          <CardDescription className="text-xs">
            {activeCount} ativas de {items.length} cadastradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-sm text-muted-foreground">Carregando promoções...</div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nenhuma promoção cadastrada ainda.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-medium text-foreground">{item.title}</div>
                      <Badge variant={item.isActive ? "default" : "outline"}>
                        {item.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                      <Badge variant="outline">
                        {item.type === "deposit_bonus"
                          ? "Bônus de depósito"
                          : "Revenue multiplier"}
                      </Badge>
                    </div>
                    {item.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Slug: {item.slug}</span>
                      <span>Resgates: {item.claimsCount}</span>
                      {item.validUntil ? <span>Válida até: {new Date(item.validUntil).toLocaleString("pt-BR")}</span> : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {item.type === "deposit_bonus" ? (
                        <>
                          {item.bonusPercent != null ? <Badge variant="secondary">{item.bonusPercent}% bônus</Badge> : null}
                          {item.bonusFixedAmount != null ? <Badge variant="secondary">+USD {item.bonusFixedAmount.toFixed(2)}</Badge> : null}
                          {item.minDepositAmount != null ? <Badge variant="secondary">Depósito mínimo USD {item.minDepositAmount.toFixed(2)}</Badge> : null}
                        </>
                      ) : (
                        <Badge variant="secondary">
                          x{(item.revenueMultiplier ?? 1).toFixed(2)} revenue
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.rulesText ? (
                  <div className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    {item.rulesText}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
