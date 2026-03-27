"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowRightLeft,
  Building2,
  CandlestickChart,
  Pencil,
  Plus,
  RefreshCcw,
  Server,
  Trash2,
} from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

type ProviderType = "crypto" | "forex"

type MarketProviderItem = {
  id: number
  slug: string
  name: string
  type: ProviderType
  restBaseUrl: string
  wsBaseUrl: string | null
  authType: string
  authHeaderName: string | null
  authQueryParam: string | null
  authToken: string | null
  isActive: boolean
  sortOrder: number
  pairsCount: number
  activePairsCount: number
}

type TradingPairItem = {
  id: string
  symbol: string
  name: string
  type: ProviderType
  provider: string
  providerId: number | null
  priceSource: string
  priceSymbol: string | null
  payoutRate: number
  isActive: boolean
  favorite: boolean
  displayOrder: number
  imageUrl: string | null
  color: string | null
  logo: string | null
  description: string | null
  providerSlug: string | null
  providerName: string | null
}

type ProviderFormState = {
  slug: string
  name: string
  type: ProviderType
  restBaseUrl: string
  wsBaseUrl: string
  authType: string
  authHeaderName: string
  authQueryParam: string
  authToken: string
  sortOrder: number
  isActive: boolean
}

type PairFormState = {
  symbol: string
  name: string
  priceSymbol: string
  payoutRatePercent: number
  displayOrder: number
  imageUrl: string
  color: string
  logo: string
  description: string
  isActive: boolean
  favorite: boolean
}

const emptyProviderForm: ProviderFormState = {
  slug: "",
  name: "",
  type: "crypto",
  restBaseUrl: "",
  wsBaseUrl: "",
  authType: "none",
  authHeaderName: "",
  authQueryParam: "",
  authToken: "",
  sortOrder: 0,
  isActive: true,
}

const emptyPairForm: PairFormState = {
  symbol: "",
  name: "",
  priceSymbol: "",
  payoutRatePercent: 90,
  displayOrder: 0,
  imageUrl: "",
  color: "",
  logo: "",
  description: "",
  isActive: true,
  favorite: false,
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function PairsManagement() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("providers")
  const [providers, setProviders] = useState<MarketProviderItem[]>([])
  const [pairs, setPairs] = useState<TradingPairItem[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [loadingPairs, setLoadingPairs] = useState(false)
  const [savingProvider, setSavingProvider] = useState(false)
  const [savingPair, setSavingPair] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<number | null>(null)
  const [editingPairId, setEditingPairId] = useState<string | null>(null)
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null)
  const [providerForm, setProviderForm] = useState<ProviderFormState>(emptyProviderForm)
  const [pairForm, setPairForm] = useState<PairFormState>(emptyPairForm)

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProviderId) ?? null,
    [providers, selectedProviderId],
  )

  const activeProviders = useMemo(
    () => providers.filter((provider) => provider.isActive),
    [providers],
  )

  const loadProviders = async () => {
    setLoadingProviders(true)
    try {
      const response = await fetch("/api/admin/market-providers", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar provedores")
      }

      const nextProviders = (await response.json()) as MarketProviderItem[]
      setProviders(nextProviders)

      setSelectedProviderId((current) => {
        if (current && nextProviders.some((provider) => provider.id === current)) {
          return current
        }

        return nextProviders[0]?.id ?? null
      })
    } catch (error) {
      console.error(error)
      setProviders([])
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar os provedores.",
        variant: "destructive",
      })
    } finally {
      setLoadingProviders(false)
    }
  }

  const loadPairs = async (providerId: number | null) => {
    if (!providerId) {
      setPairs([])
      return
    }

    setLoadingPairs(true)
    try {
      const response = await fetch(`/api/admin/pairs?providerId=${providerId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar ativos do provedor")
      }

      setPairs((await response.json()) as TradingPairItem[])
    } catch (error) {
      console.error(error)
      setPairs([])
      toast({
        title: "Erro",
        description: "Nao foi possivel carregar os ativos do provedor.",
        variant: "destructive",
      })
    } finally {
      setLoadingPairs(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  useEffect(() => {
    loadPairs(selectedProviderId)
  }, [selectedProviderId])

  const resetProviderForm = () => {
    setEditingProviderId(null)
    setProviderForm(emptyProviderForm)
  }

  const resetPairForm = () => {
    setEditingPairId(null)
    setPairForm(emptyPairForm)
  }

  const handleProviderSubmit = async () => {
    setSavingProvider(true)

    try {
      const payload = {
        slug: normalizeSlug(providerForm.slug || providerForm.name),
        name: providerForm.name.trim(),
        type: providerForm.type,
        restBaseUrl: providerForm.restBaseUrl.trim(),
        wsBaseUrl: providerForm.wsBaseUrl.trim() || null,
        authType: providerForm.authType,
        authHeaderName: providerForm.authHeaderName.trim() || null,
        authQueryParam: providerForm.authQueryParam.trim() || null,
        authToken: providerForm.authToken.trim() || null,
        sortOrder: Number(providerForm.sortOrder),
        isActive: providerForm.isActive,
      }

      const response = await fetch(
        editingProviderId
          ? `/api/admin/market-providers/${editingProviderId}`
          : "/api/admin/market-providers",
        {
          method: editingProviderId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Falha ao salvar provedor")
      }

      await loadProviders()
      resetProviderForm()
      setActiveTab("providers")
      toast({
        title: "Sucesso",
        description: editingProviderId
          ? "Provedor atualizado com sucesso."
          : "Provedor criado com sucesso.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao salvar provedor.",
        variant: "destructive",
      })
    } finally {
      setSavingProvider(false)
    }
  }

  const handlePairSubmit = async () => {
    if (!selectedProviderId) {
      return
    }

    setSavingPair(true)

    try {
      const payload = {
        providerId: selectedProviderId,
        symbol: pairForm.symbol.trim().toUpperCase(),
        name: pairForm.name.trim(),
        priceSymbol: pairForm.priceSymbol.trim().toUpperCase() || null,
        payoutRate: Number(pairForm.payoutRatePercent) / 100,
        displayOrder: Number(pairForm.displayOrder),
        imageUrl: pairForm.imageUrl.trim() || null,
        color: pairForm.color.trim() || null,
        logo: pairForm.logo.trim() || null,
        description: pairForm.description.trim() || null,
        isActive: pairForm.isActive,
        favorite: pairForm.favorite,
      }

      const response = await fetch(
        editingPairId ? `/api/admin/pairs/${editingPairId}` : "/api/admin/pairs",
        {
          method: editingPairId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Falha ao salvar ativo")
      }

      await Promise.all([loadProviders(), loadPairs(selectedProviderId)])
      resetPairForm()
      toast({
        title: "Sucesso",
        description: editingPairId
          ? "Ativo atualizado com sucesso."
          : "Ativo criado com sucesso.",
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao salvar ativo.",
        variant: "destructive",
      })
    } finally {
      setSavingPair(false)
    }
  }

  const handleEditProvider = (provider: MarketProviderItem) => {
    setEditingProviderId(provider.id)
    setProviderForm({
      slug: provider.slug,
      name: provider.name,
      type: provider.type,
      restBaseUrl: provider.restBaseUrl,
      wsBaseUrl: provider.wsBaseUrl || "",
      authType: provider.authType,
      authHeaderName: provider.authHeaderName || "",
      authQueryParam: provider.authQueryParam || "",
      authToken: provider.authToken || "",
      sortOrder: provider.sortOrder,
      isActive: provider.isActive,
    })
    setActiveTab("provider-form")
  }

  const handleEditPair = (pair: TradingPairItem) => {
    setEditingPairId(pair.id)
    setPairForm({
      symbol: pair.symbol,
      name: pair.name,
      priceSymbol: pair.priceSymbol || "",
      payoutRatePercent: pair.payoutRate * 100,
      displayOrder: pair.displayOrder,
      imageUrl: pair.imageUrl || "",
      color: pair.color || "",
      logo: pair.logo || "",
      description: pair.description || "",
      isActive: pair.isActive,
      favorite: pair.favorite,
    })
  }

  const toggleProviderStatus = async (provider: MarketProviderItem) => {
    try {
      const response = await fetch(`/api/admin/market-providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !provider.isActive }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do provedor")
      }

      await loadProviders()
    } catch (error) {
      console.error(error)
    }
  }

  const togglePairStatus = async (pair: TradingPairItem) => {
    try {
      const response = await fetch(`/api/admin/pairs/${pair.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pair.isActive }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do ativo")
      }

      await Promise.all([loadProviders(), loadPairs(selectedProviderId)])
    } catch (error) {
      console.error(error)
    }
  }

  const removeProvider = async (providerId: number) => {
    try {
      const response = await fetch(`/api/admin/market-providers/${providerId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || "Falha ao remover provedor")
      }

      await loadProviders()
    } catch (error) {
      console.error(error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao remover provedor.",
        variant: "destructive",
      })
    }
  }

  const removePair = async (pairId: string) => {
    try {
      const response = await fetch(`/api/admin/pairs/${pairId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao remover ativo")
      }

      await Promise.all([loadProviders(), loadPairs(selectedProviderId)])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:w-auto md:grid-cols-3">
          <TabsTrigger value="providers" className="rounded-lg border">
            Provedores ativos
          </TabsTrigger>
          <TabsTrigger value="provider-form" className="rounded-lg border">
            Criar novo provedor
          </TabsTrigger>
          <TabsTrigger value="provider-assets" className="rounded-lg border">
            Ativos do provedor
          </TabsTrigger>
        </TabsList>

        <Button variant="outline" onClick={() => {
          loadProviders()
          loadPairs(selectedProviderId)
        }}>
          <RefreshCcw className="h-4 w-4" />
          Atualizar dados
        </Button>
      </div>

      <TabsContent value="providers" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Provedores ativos</CardDescription>
              <CardTitle className="text-3xl">{activeProviders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de provedores</CardDescription>
              <CardTitle className="text-3xl">{providers.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Ativos vinculados</CardDescription>
              <CardTitle className="text-3xl">
                {providers.reduce((total, provider) => total + provider.pairsCount, 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {loadingProviders ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Carregando provedores...
              </CardContent>
            </Card>
          ) : providers.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Nenhum provedor cadastrado.
              </CardContent>
            </Card>
          ) : (
            providers.map((provider) => (
              <Card key={provider.id} className="border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-xl">{provider.name}</CardTitle>
                        <Badge variant={provider.isActive ? "default" : "secondary"}>
                          {provider.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Badge variant="outline">{provider.type}</Badge>
                      </div>
                      <CardDescription>
                        `{provider.slug}` • REST {provider.restBaseUrl}
                      </CardDescription>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Server className="h-4 w-4" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/60 p-3">
                      <p className="text-xs text-muted-foreground">Ativos</p>
                      <p className="mt-1 text-lg font-semibold">{provider.pairsCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                      <p className="text-xs text-muted-foreground">Ativos ativos</p>
                      <p className="mt-1 text-lg font-semibold">{provider.activePairsCount}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                      <p className="text-xs text-muted-foreground">Auth</p>
                      <p className="mt-1 text-lg font-semibold">{provider.authType}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedProviderId(provider.id)
                        resetPairForm()
                        setActiveTab("provider-assets")
                      }}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Ver ativos desse provedor
                    </Button>
                    <Button variant="outline" onClick={() => handleEditProvider(provider)}>
                      <Pencil className="h-4 w-4" />
                      Editar provedor
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleProviderStatus(provider)}
                    >
                      {provider.isActive ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => removeProvider(provider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="provider-form">
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProviderId ? "Editar provedor" : "Novo provedor"}
            </CardTitle>
            <CardDescription>
              Cadastre provedores de mercado dinamicos e deixe o admin controlar REST, WebSocket e autenticacao.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={providerForm.name}
                  onChange={(e) =>
                    setProviderForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={providerForm.slug}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      slug: normalizeSlug(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={providerForm.type}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      type: e.target.value as ProviderType,
                    }))
                  }
                >
                  <option value="crypto">Crypto</option>
                  <option value="forex">Forex</option>
                </select>
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label>REST base URL</Label>
                <Input
                  value={providerForm.restBaseUrl}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      restBaseUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>WebSocket base URL</Label>
                <Input
                  value={providerForm.wsBaseUrl}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      wsBaseUrl: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Autenticacao</Label>
                <select
                  className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={providerForm.authType}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      authType: e.target.value,
                    }))
                  }
                >
                  <option value="none">Nenhuma</option>
                  <option value="header">Header</option>
                  <option value="query">Query</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Header auth</Label>
                <Input
                  value={providerForm.authHeaderName}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      authHeaderName: e.target.value,
                    }))
                  }
                  placeholder="Authorization"
                />
              </div>
              <div className="space-y-2">
                <Label>Query auth</Label>
                <Input
                  value={providerForm.authQueryParam}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      authQueryParam: e.target.value,
                    }))
                  }
                  placeholder="token"
                />
              </div>
              <div className="space-y-2 xl:col-span-2">
                <Label>Token</Label>
                <Input
                  value={providerForm.authToken}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      authToken: e.target.value,
                    }))
                  }
                  placeholder="Token salvo no banco para esse provedor"
                />
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={providerForm.sortOrder}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={providerForm.isActive}
                  onChange={(e) =>
                    setProviderForm((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                />
                Provedor ativo
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button disabled={savingProvider} onClick={handleProviderSubmit}>
                <Plus className="h-4 w-4" />
                {savingProvider
                  ? "Salvando..."
                  : editingProviderId
                    ? "Atualizar provedor"
                    : "Cadastrar provedor"}
              </Button>
              <Button variant="outline" onClick={resetProviderForm}>
                Limpar formulario
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="provider-assets" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ativos por provedor</CardTitle>
            <CardDescription>
              Selecione um provedor para ver, criar e editar os ativos vinculados a ele.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {providers.map((provider) => (
                <Button
                  key={provider.id}
                  variant={provider.id === selectedProviderId ? "default" : "outline"}
                  onClick={() => {
                    setSelectedProviderId(provider.id)
                    resetPairForm()
                  }}
                >
                  <Building2 className="h-4 w-4" />
                  {provider.name}
                </Button>
              ))}
            </div>

            {selectedProvider ? (
              <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold">{selectedProvider.name}</h3>
                  <Badge variant={selectedProvider.isActive ? "default" : "secondary"}>
                    {selectedProvider.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">{selectedProvider.type}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedProvider.pairsCount} ativos cadastrados, {selectedProvider.activePairsCount} ativos ativos.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Selecione um provedor para continuar.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedProvider ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingPairId ? "Editar ativo do provedor" : "Novo ativo do provedor"}
                </CardTitle>
                <CardDescription>
                  Os ativos criados aqui ficam vinculados ao provider {selectedProvider.name} e usam o slug {selectedProvider.slug} como source.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Simbolo</Label>
                    <Input
                      value={pairForm.symbol}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          symbol: e.target.value.toUpperCase(),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={pairForm.name}
                      onChange={(e) =>
                        setPairForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price symbol</Label>
                    <Input
                      value={pairForm.priceSymbol}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          priceSymbol: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Opcional se o symbol da API for diferente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo do ativo</Label>
                    <Input value={selectedProvider.type} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Payout (%)</Label>
                    <Input
                      type="number"
                      value={pairForm.payoutRatePercent}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          payoutRatePercent: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      value={pairForm.displayOrder}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          displayOrder: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      value={pairForm.imageUrl}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          imageUrl: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Input
                      value={pairForm.color}
                      onChange={(e) =>
                        setPairForm((prev) => ({ ...prev, color: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <Input
                      value={pairForm.logo}
                      onChange={(e) =>
                        setPairForm((prev) => ({ ...prev, logo: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 xl:col-span-3">
                    <Label>Descricao</Label>
                    <Textarea
                      value={pairForm.description}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={pairForm.isActive}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                    Ativo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={pairForm.favorite}
                      onChange={(e) =>
                        setPairForm((prev) => ({
                          ...prev,
                          favorite: e.target.checked,
                        }))
                      }
                    />
                    Favorito
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button disabled={savingPair} onClick={handlePairSubmit}>
                    <CandlestickChart className="h-4 w-4" />
                    {savingPair
                      ? "Salvando..."
                      : editingPairId
                        ? "Atualizar ativo"
                        : "Cadastrar ativo"}
                  </Button>
                  <Button variant="outline" onClick={resetPairForm}>
                    Limpar formulario
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ativos do provedor</CardTitle>
                <CardDescription>
                  Lista de ativos vinculados ao provider selecionado.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingPairs ? (
                  <p className="text-sm text-muted-foreground">
                    Carregando ativos...
                  </p>
                ) : pairs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum ativo cadastrado para esse provedor.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-left">
                        <tr>
                          <th className="px-4 py-3 font-medium">Simbolo</th>
                          <th className="px-4 py-3 font-medium">Nome</th>
                          <th className="px-4 py-3 font-medium">Tipo</th>
                          <th className="px-4 py-3 font-medium">Payout</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Acoes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pairs.map((pair) => (
                          <tr key={pair.id} className="border-t">
                            <td className="px-4 py-4 font-medium">{pair.symbol}</td>
                            <td className="px-4 py-4">{pair.name}</td>
                            <td className="px-4 py-4">{pair.type}</td>
                            <td className="px-4 py-4">
                              {(pair.payoutRate * 100).toFixed(2)}%
                            </td>
                            <td className="px-4 py-4">
                              <Button
                                size="sm"
                                variant={pair.isActive ? "default" : "secondary"}
                                onClick={() => togglePairStatus(pair)}
                              >
                                {pair.isActive ? "Ativo" : "Inativo"}
                              </Button>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditPair(pair)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removePair(pair.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
