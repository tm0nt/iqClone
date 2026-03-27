"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, DollarSign, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "../date-range-picker"
import { format } from "date-fns"
import {
  StatCard,
  FilterBar,
  AutoStatusBadge,
  TypeBadge,
  DataTablePagination,
  TableEmptyRow,
  PageSkeleton,
  DetailModal,
  DetailRow,
} from "./shared"
import { formatUsd } from "@shared/platform/branding"
import { useAdminWithdrawalsTable } from "@/hooks/use-admin-withdrawals-table"

const fmt = (v: number) =>
  formatUsd(v)

export function WithdrawalRequests() {
  const {
    currentPage,
    dateRange,
    detailOpen,
    filteredWithdrawals,
    loading,
    searchTerm,
    selected,
    statusFilter,
    totalItems,
    totalPages,
    totalPaid,
    totalPaidValue,
    totalPending,
    totalPendingValue,
    totalValue,
    typeFilter,
    fetchWithdrawals,
    handleApprove,
    handleReject,
    handleViewDetails,
    setCurrentPage,
    setDateRange,
    setDetailOpen,
    setSearchTerm,
    setSelected,
    setStatusFilter,
    setTypeFilter,
  } = useAdminWithdrawalsTable()

  if (loading && filteredWithdrawals.length === 0) return <PageSkeleton />

  return (
    <div className="space-y-6">
      <DateRangePicker dateRange={dateRange} onDateRangeChange={setDateRange} />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Saques Pagos"
          value={fmt(totalPaidValue)}
          subtitle={`${totalPaid} saques`}
          icon={<Check className="h-4 w-4" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Saques Pendentes"
          value={fmt(totalPendingValue)}
          subtitle={`${totalPending} saques`}
          icon={<CreditCard className="h-4 w-4" />}
          iconClassName="bg-warning/10 text-warning"
        />
        <StatCard
          title="Total de Saques"
          value={fmt(totalValue)}
          subtitle={`${totalItems} saques`}
          icon={<DollarSign className="h-4 w-4" />}
          iconClassName="bg-info/10 text-info"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nome, email ou chave..."
          onRefresh={() => fetchWithdrawals(currentPage)}
          loading={loading}
          filters={
            <>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[130px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="concluido">Aprovados</SelectItem>
                  <SelectItem value="cancelado">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[130px] text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="usuario">Usuários</SelectItem>
                  <SelectItem value="afiliado">Afiliados</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Chave Pix</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWithdrawals.length > 0 ? (
                filteredWithdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell><TypeBadge type={w.tipo} /></TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{fmt(w.valor)}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{w.chave}</div>
                      <div className="text-xs text-muted-foreground uppercase">{w.tipoChave}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{w.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(w.dataPedido), "dd/MM/yyyy")}</TableCell>
                    <TableCell><AutoStatusBadge status={w.status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(w)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {w.status === "pendente" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success hover:text-success hover:bg-success/5"
                              onClick={() => handleApprove(w.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                              onClick={() => handleReject(w.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={7} title="Nenhum saque encontrado" description="Tente ajustar os filtros" />
              )}
            </TableBody>
          </Table>
        </div>

        <div className="px-4 pb-4">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            showing={filteredWithdrawals.length}
            itemLabel="saques"
            onPageChange={(p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p) }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Detalhes do Saque"
        description="Informações detalhadas sobre a solicitação de saque"
        footer={
          selected?.status === "pendente" ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-destructive/20 text-destructive hover:bg-destructive/5"
                onClick={() => { handleReject(selected.id); setDetailOpen(false) }}
              >
                Rejeitar
              </Button>
              <Button
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => { handleApprove(selected.id); setDetailOpen(false) }}
              >
                Aprovar
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Fechar</Button>
          )
        }
      >
        {selected && (
          <div className="space-y-0">
            <DetailRow label="ID da Solicitação" value={selected.id} />
            <DetailRow label="Status" value={<AutoStatusBadge status={selected.status} />} />
            <DetailRow label="Nome do Cliente" value={selected.user?.nome || selected.nomeCliente} />
            <DetailRow label="ID do Cliente" value={selected.userId || selected.idCliente} />
            <DetailRow label="Tipo" value={<TypeBadge type={selected.tipo} />} />
            <DetailRow label="Valor" value={fmt(selected.valor)} />
            <DetailRow label="Chave Pix" value={selected.chave} />
            <DetailRow label="Tipo de Chave" value={selected.tipoChave?.toUpperCase()} />
            <DetailRow label="Email" value={selected.user?.email || selected.email} />
            <DetailRow label="Data da Solicitação" value={selected.dataPedido ? format(new Date(selected.dataPedido), "dd/MM/yyyy HH:mm") : null} />
            <DetailRow label="Taxa" value={formatUsd(selected.taxa)} />
            {selected.dataPagamento && (
              <DetailRow label="Data do Pagamento" value={format(new Date(selected.dataPagamento), "dd/MM/yyyy HH:mm")} />
            )}
          </div>
        )}
      </DetailModal>
    </div>
  )
}
