"use client"

import { useEffect, useState, useCallback } from "react"
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowDownToLine,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAccountStore } from "@/store/account-store"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { formatUsd } from "@shared/platform/branding"

interface Withdrawal {
  id: string
  valor: number
  taxa: number
  tipoChave: string
  chave: string
  status: string
  dataPedido: string
  dataPagamento?: string
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: <Clock className="h-3.5 w-3.5" /> },
  concluido: { label: "Concluído", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: <XCircle className="h-3.5 w-3.5" /> },
  processando: { label: "Processando", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: <Loader2 className="h-3.5 w-3.5 animate-spin" /> },
}

export default function WithdrawalsPage() {
  const { toast } = useToast()
  const { saldoComissao, taxa, fetchAffiliate } = useAccountStore()

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Form state
  const [amount, setAmount] = useState("")
  const [pixKeyType, setPixKeyType] = useState("")
  const [pixKey, setPixKey] = useState("")

  // Config
  const [minWithdrawal, setMinWithdrawal] = useState(100)
  const [withdrawalFee, setWithdrawalFee] = useState(10)

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch("/api/account/withdraw")
      if (res.ok) {
        const data = await res.json()
        setWithdrawals(data.withdrawals || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/account/offer/list")
      if (res.ok) {
        const data = await res.json()
        if (data.valorMinimoSaque) setMinWithdrawal(data.valorMinimoSaque)
        if (data.taxa) setWithdrawalFee(data.taxa)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchAffiliate()
    fetchWithdrawals()
    fetchConfig()
  }, [fetchAffiliate, fetchWithdrawals, fetchConfig])

  const handleSubmit = async () => {
    const valor = parseFloat(amount)
    if (!valor || valor < minWithdrawal) {
      toast({ variant: "destructive", title: "Erro", description: `O valor mínimo para saque é $${minWithdrawal.toFixed(2)}` })
      return
    }
    if (valor + withdrawalFee > saldoComissao) {
      toast({ variant: "destructive", title: "Erro", description: "Saldo insuficiente para o saque (valor + taxa)" })
      return
    }
    if (!pixKeyType || !pixKey) {
      toast({ variant: "destructive", title: "Erro", description: "Preencha o tipo e a chave PIX" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valor, tipoChave: pixKeyType, chave: pixKey, tipo: "afiliado" }),
      })
      const data = await res.json()
      if (res.ok) {
        toast({ variant: "success", title: "Sucesso", description: "Saque solicitado com sucesso!" })
        setDialogOpen(false)
        setAmount("")
        setPixKey("")
        setPixKeyType("")
        fetchWithdrawals()
        fetchAffiliate()
      } else {
        toast({ variant: "destructive", title: "Erro", description: data.error || "Erro ao solicitar saque" })
      }
    } catch {
      toast({ variant: "destructive", title: "Erro", description: "Erro de conexão" })
    } finally {
      setSubmitting(false)
    }
  }

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "concluido")
    .reduce((sum, w) => sum + w.valor, 0)

  const pendingAmount = withdrawals
    .filter((w) => w.status === "pendente" || w.status === "processando")
    .reduce((sum, w) => sum + w.valor, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Saques</h2>
          <p className="text-muted-foreground text-sm">Solicite e acompanhe seus saques de comissão</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Solicitar Saque
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Solicitar Saque</DialogTitle>
              <DialogDescription>
                Saldo disponível: {formatUsd(saldoComissao)} | Taxa: {formatUsd(withdrawalFee)} | Mínimo: {formatUsd(minWithdrawal)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor do Saque (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min={minWithdrawal}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de Chave PIX</Label>
                <Select value={pixKeyType} onValueChange={setPixKeyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pixKey">Chave PIX</Label>
                <Input
                  id="pixKey"
                  placeholder="Digite sua chave PIX"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor solicitado</span>
                    <span>{formatUsd(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa</span>
                    <span className="text-destructive">- {formatUsd(withdrawalFee)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1">
                    <span>Valor líquido</span>
                    <span className="text-primary">{formatUsd(Math.max(0, parseFloat(amount) - withdrawalFee))}</span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Solicitar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatUsd(saldoComissao)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sacado</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUsd(totalWithdrawn)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUsd(pendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Saque</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatUsd(withdrawalFee)}
            </div>
            <p className="text-xs text-muted-foreground">Mín: {formatUsd(minWithdrawal)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal history */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
          <CardDescription>Acompanhe o status dos seus saques</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Nenhum saque encontrado</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Solicite seu primeiro saque usando o botão acima</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Data</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Taxa</th>
                    <th className="pb-3 pr-4">Líquido</th>
                    <th className="pb-3 pr-4">Chave PIX</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {withdrawals.map((w) => {
                    const status = statusConfig[w.status] || statusConfig.pendente
                    return (
                      <tr key={w.id} className="text-sm">
                        <td className="py-3 pr-4 whitespace-nowrap">
                          {format(new Date(w.dataPedido), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </td>
                        <td className="py-3 pr-4 font-medium">
                          {formatUsd(w.valor)}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatUsd(w.taxa)}
                        </td>
                        <td className="py-3 pr-4 font-medium text-primary">
                          {formatUsd(w.valor - w.taxa)}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          <span className="uppercase font-medium">{w.tipoChave}</span>: {w.chave}
                        </td>
                        <td className="py-3">
                          <Badge variant="outline" className={cn("gap-1 font-medium", status.color)}>
                            {status.icon}
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
