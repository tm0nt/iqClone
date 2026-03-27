"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "../date-range-picker"
import { Eye, Check, CreditCard, DollarSign } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useAdminTransactionsTable } from "@/hooks/use-admin-transactions-table"

const depositTypeMap: Record<string, string> = {
  pix: "Pix",
  boleto: "Boleto",
  ted: "TED",
  cartao: "Cartão",
}

const withdrawalTypeMap: Record<string, string> = {
  usuario: "Usuário",
  afiliado: "Afiliado",
}

const fmt = (v: number) =>
  formatUsd(v)

export function TransactionsTable() {
  const {
    currentPage,
    data,
    dateRange,
    detailOpen,
    filteredTransactions,
    loading,
    searchTerm,
    selected,
    statusFilter,
    totalItems,
    totalPages,
    typeFilter,
    fetchTransactions,
    setCurrentPage,
    setDateRange,
    setDetailOpen,
    setSearchTerm,
    setSelected,
    setStatusFilter,
    setTypeFilter,
  } = useAdminTransactionsTable()

  if (loading && !data) return <PageSkeleton />

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground mb-4">Não foi possível carregar as transações</p>
        <Button onClick={() => fetchTransactions(1)}>Tentar novamente</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DateRangePicker
        dateRange={dateRange}
        onDateRangeChange={(range) => { setDateRange(range); fetchTransactions() }}
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <StatCard
          title="Depósitos Concluídos"
          value={fmt(data.totals?.deposits?.totalCompletedValue || 0)}
          subtitle={`${data.totals?.deposits?.totalCompleted || 0} transações`}
          icon={<Check className="h-4 w-4" />}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Saques Concluídos"
          value={fmt(data.totals?.withdrawals?.totalCompletedValue || 0)}
          subtitle={`${data.totals?.withdrawals?.totalCompleted || 0} transações`}
          icon={<CreditCard className="h-4 w-4" />}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Total Geral"
          value={fmt((data.totals?.deposits?.totalValue || 0) + (data.totals?.withdrawals?.totalValue || 0))}
          subtitle={`${totalItems} transações`}
          icon={<DollarSign className="h-4 w-4" />}
          iconClassName="bg-accent text-accent-foreground"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por ID, nome, email ou chave..."
          onRefresh={() => fetchTransactions(currentPage)}
          loading={loading}
          filters={
            <>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[130px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="concluido">Concluídos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                  <SelectItem value="cancelado">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-9 w-[130px] text-sm">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="deposit">Depósitos</SelectItem>
                  <SelectItem value="withdrawal">Saques</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">ID</TableHead>
                <TableHead className="text-xs">Usuário</TableHead>
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Método</TableHead>
                <TableHead className="text-xs">Valor</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-xs font-mono">{tx.id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{tx.nomeCliente}</div>
                      <div className="text-xs text-muted-foreground">{tx.email}</div>
                    </TableCell>
                    <TableCell><TypeBadge type={tx.type} /></TableCell>
                    <TableCell className="text-sm">
                      {tx.type === "deposit"
                        ? depositTypeMap[tx.tipo] || tx.tipo
                        : withdrawalTypeMap[tx.tipo] || tx.tipo}
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{fmt(tx.valor)}</TableCell>
                    <TableCell><AutoStatusBadge status={tx.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(tx.data), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelected(tx); setDetailOpen(true) }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={8} title="Nenhuma transação encontrada" description="Tente ajustar os filtros" />
              )}
            </TableBody>
          </Table>
        </div>

        <div className="px-4 pb-4">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            showing={filteredTransactions.length}
            itemLabel="transações"
            onPageChange={(p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p) }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Detalhes da Transação"
        description="Informações detalhadas sobre a transação"
        size="lg"
        footer={<Button variant="outline" onClick={() => setDetailOpen(false)}>Fechar</Button>}
      >
        {selected && (
          <div className="space-y-0">
            <DetailRow label="ID da Transação" value={selected.id} />
            <DetailRow label="Status" value={<AutoStatusBadge status={selected.status} />} />
            <DetailRow label="Tipo" value={<TypeBadge type={selected.type} />} />
            <DetailRow
              label="Método"
              value={selected.type === "deposit"
                ? depositTypeMap[selected.tipo] || selected.tipo
                : withdrawalTypeMap[selected.tipo] || selected.tipo}
            />
            <DetailRow label="Valor" value={fmt(selected.valor)} />
            <DetailRow label="Nome do Cliente" value={selected.nomeCliente} />
            <DetailRow label="ID do Cliente" value={selected.idCliente} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Data" value={format(new Date(selected.data), "dd/MM/yyyy HH:mm")} />
            <DetailRow
              label="Data de Pagamento"
              value={selected.dataPagamento ? format(new Date(selected.dataPagamento), "dd/MM/yyyy HH:mm") : null}
            />
            {selected.chave && <DetailRow label="Chave Pix" value={selected.chave} />}
            {selected.tipoChave && <DetailRow label="Tipo de Chave" value={selected.tipoChave.toUpperCase()} />}
          </div>
        )}
      </DetailModal>
    </div>
  )
}
