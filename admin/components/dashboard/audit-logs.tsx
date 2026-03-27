"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FilterBar,
  TypeBadge,
  TableEmptyRow,
  TableSkeleton,
} from "./shared"

interface AuditLog {
  id: string
  userId?: string
  userName?: string
  userEmail?: string
  entidade: string
  entidadeId: string
  acao: string
  valoresAntigos?: any
  valoresNovos?: any
  createdAt: string
}

export function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState("")
  const [entidadeFilter, setEntidadeFilter] = useState("all")
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/audit")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Erro ao buscar logs")
      setLogs(data.auditLogs || [])
    } catch (error) {
      console.error("Erro ao buscar logs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [])

  const filteredLogs = logs.filter((log) => {
    const s = searchTerm.toLowerCase()
    const matchSearch = !s ||
      log.acao.toLowerCase().includes(s) ||
      (log.userName && log.userName.toLowerCase().includes(s)) ||
      (log.userEmail && log.userEmail.toLowerCase().includes(s)) ||
      log.entidade.toLowerCase().includes(s)
    const matchEntidade = entidadeFilter === "all" || log.entidade === entidadeFilter
    return matchSearch && matchEntidade
  })

  const uniqueEntidades = [...new Set(logs.map((l) => l.entidade))]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <FilterBar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar nos logs..."
        onRefresh={fetchLogs}
        loading={loading}
        filters={
          <Select value={entidadeFilter} onValueChange={setEntidadeFilter}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniqueEntidades.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">Ação</TableHead>
              <TableHead className="text-xs">Usuário</TableHead>
              <TableHead className="text-xs">Entidade</TableHead>
              <TableHead className="text-xs">ID</TableHead>
              <TableHead className="text-xs">Valores Antigos</TableHead>
              <TableHead className="text-xs">Valores Novos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-0">
                  <TableSkeleton rows={5} columns={7} />
                </td>
              </tr>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow
                  key={log.id}
                  className={new Date(log.createdAt).toLocaleDateString("pt-BR") === new Date().toLocaleDateString("pt-BR") ? "bg-muted/20" : ""}
                >
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.acao}</TableCell>
                  <TableCell>
                    {log.userName ? (
                      <>
                        <div className="text-sm font-medium">{log.userName}</div>
                        <div className="text-xs text-muted-foreground">{log.userEmail}</div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sistema</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={log.entidade} label={log.entidade} />
                  </TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{log.entidadeId}</TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-xs text-muted-foreground truncate block" title={JSON.stringify(log.valoresAntigos)}>
                      {log.valoresAntigos ? JSON.stringify(log.valoresAntigos) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <span className="text-xs text-muted-foreground truncate block" title={JSON.stringify(log.valoresNovos)}>
                      {log.valoresNovos ? JSON.stringify(log.valoresNovos) : "—"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow colSpan={7} title="Nenhum log encontrado" description="Tente ajustar os filtros" />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
