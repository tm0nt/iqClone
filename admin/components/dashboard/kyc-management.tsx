"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
import {
  FilterBar,
  AutoStatusBadge,
  TableEmptyRow,
  TableSkeleton,
  StatusBadge,
} from "./shared"

type KycStatus = "APPROVED" | "PENDING" | "REJECT"

interface KycItem {
  id: string
  status: KycStatus
  type: string
  paths: Record<string, string>
  createdAt: string
  updatedAt: string
  user: {
    id: string
    nome: string
    email: string
    cpf: string | null
    telefone: string | null
    kyc: KycStatus | null
  }
}

export function KycManagement() {
  const [items, setItems] = useState<KycItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const loadItems = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/kyc", { credentials: "include" })
      if (!response.ok) throw new Error("Falha ao carregar KYC")
      setItems(await response.json())
    } catch (error) {
      console.error(error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  const updateStatus = async (id: string, status: KycStatus) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`/api/admin/kyc/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Falha ao atualizar KYC")
      await loadItems()
    } catch (error) {
      console.error(error)
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredItems = items.filter((item) => {
    const s = searchTerm.toLowerCase()
    const matchSearch = !s ||
      item.user.nome.toLowerCase().includes(s) ||
      item.user.email.toLowerCase().includes(s) ||
      (item.user.cpf && item.user.cpf.includes(searchTerm))
    const matchStatus = statusFilter === "all" || item.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome, email ou CPF..."
        onRefresh={loadItems}
        loading={loading}
        filters={
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendente</SelectItem>
              <SelectItem value="APPROVED">Aprovado</SelectItem>
              <SelectItem value="REJECT">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Cliente</TableHead>
              <TableHead className="text-xs">Documento</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Arquivos</TableHead>
              <TableHead className="text-xs">Atualizado</TableHead>
              <TableHead className="text-xs text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-0">
                  <TableSkeleton rows={4} columns={6} />
                </td>
              </tr>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="text-sm font-medium">{item.user.nome}</div>
                    <div className="text-xs text-muted-foreground">{item.user.email}</div>
                    <div className="text-xs text-muted-foreground">{item.user.cpf || "Sem CPF"}</div>
                  </TableCell>
                  <TableCell className="text-sm">{item.type}</TableCell>
                  <TableCell><AutoStatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {Object.entries(item.paths || {}).map(([label, url]) => (
                        <a
                          key={label}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {label}
                        </a>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(item.updatedAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-success/20 text-success hover:bg-success/5 hover:text-success"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "APPROVED")}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-warning/20 text-warning hover:bg-warning/5 hover:text-warning"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "PENDING")}
                      >
                        Reanalisar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                        disabled={updatingId === item.id}
                        onClick={() => updateStatus(item.id, "REJECT")}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow colSpan={6} title="Nenhuma solicitação encontrada" description="Nenhum documento de KYC para revisar" />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
