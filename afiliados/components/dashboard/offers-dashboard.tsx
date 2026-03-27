"use client"

import { useState, useEffect } from "react"
import { Copy, Check, Globe, DollarSign, Percent, MousePointerClick, Link2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAccountStore } from "@/store/account-store"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { formatUsd } from "@shared/platform/branding"

interface OfferData {
  tipoComissao: "cpa" | "revShare" | null
  taxa: number
  valorMinimoSaque: number
  valorMinimoDeposito: number
  cpaMin?: number
  cpaValor?: number
  revShareFalsoValue?: number
  revShareValue?: number
  cliques: number
  offerLink: string
}

export function OffersDashboard() {
  const { toast } = useToast()
  const { tipoComissao } = useAccountStore()
  const [data, setData] = useState<OfferData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchOffer() {
      try {
        const res = await fetch("/api/account/offer/list", { credentials: "include" })
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchOffer()
  }, [])

  const handleCopyLink = () => {
    if (!data?.offerLink) return
    navigator.clipboard.writeText(data.offerLink)
    setCopied(true)
    toast({ variant: "success", title: "Link copiado!", description: "O link foi copiado para a área de transferência." })
    setTimeout(() => setCopied(false), 2000)
  }

  const commissionType = data?.tipoComissao || tipoComissao

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Commission type banner */}
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Seu Modelo de Comissão</CardTitle>
              <CardDescription>Configuração atual da sua oferta de afiliado</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm px-3 py-1 font-semibold",
                commissionType === "cpa"
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
              )}
            >
              {commissionType === "cpa" ? "CPA" : "RevShare"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Commission details based on type */}
            {commissionType === "cpa" ? (
              <>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Valor CPA
                  </div>
                  <p className="text-2xl font-bold">{formatUsd(data?.cpaValor ?? 0)}</p>
                  <p className="text-xs text-muted-foreground mt-1">por depósito qualificado</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Globe className="h-4 w-4" />
                    Mín. Depósitos
                  </div>
                  <p className="text-2xl font-bold">{data?.cpaMin ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">depósitos mínimos necessários</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Percent className="h-4 w-4" />
                    RevShare
                  </div>
                  <p className="text-2xl font-bold">{data?.revShareFalsoValue ?? data?.revShareValue ?? 0}%</p>
                  <p className="text-xs text-muted-foreground mt-1">das operações dos indicados</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Receita compartilhada
                  </div>
                  <p className="text-lg font-bold">Contínua</p>
                  <p className="text-xs text-muted-foreground mt-1">enquanto o usuário operar</p>
                </div>
              </>
            )}

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <MousePointerClick className="h-4 w-4" />
                Cliques
              </div>
              <p className="text-2xl font-bold">{data?.cliques ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">no seu link de afiliado</p>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                Saque Mínimo
              </div>
              <p className="text-2xl font-bold">{formatUsd(data?.valorMinimoSaque ?? 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">taxa: {formatUsd(data?.taxa ?? 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate link */}
      {data?.offerLink && (
        <Card className="border-none shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Seu Link de Afiliado</CardTitle>
            </div>
            <CardDescription>Compartilhe este link para ganhar comissões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border bg-muted/30 px-4 py-3 text-sm font-mono break-all">
                {data.offerLink}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 h-12 w-12"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Commission model explanation */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={cn("border shadow-sm transition-all", commissionType === "cpa" ? "border-primary/30 ring-1 ring-primary/10" : "")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">CPA (Custo por Ação)</CardTitle>
              {commissionType === "cpa" && <Badge className="bg-primary text-primary-foreground">Ativo</Badge>}
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Receba um valor fixo por cada depósito qualificado feito por um usuário referido.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pagamento fixo por conversão</li>
              <li>Ideal para alto volume de tráfego</li>
              <li>Ganho imediato após qualificação</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={cn("border shadow-sm transition-all", commissionType === "revShare" ? "border-primary/30 ring-1 ring-primary/10" : "")}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">RevShare (Receita Compartilhada)</CardTitle>
              {commissionType === "revShare" && <Badge className="bg-primary text-primary-foreground">Ativo</Badge>}
            </div>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Receba uma porcentagem contínua das operações realizadas pelos seus indicados.</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Receita recorrente e passiva</li>
              <li>Percentual das operações dos indicados</li>
              <li>Ideal para relacionamentos de longo prazo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
