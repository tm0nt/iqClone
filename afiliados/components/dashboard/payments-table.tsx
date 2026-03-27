"use client"

import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpDown, FileText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import { formatUsd } from "@shared/platform/branding"
import { useAffiliatePaymentsTable } from "@/hooks/use-affiliate-payments-table"

interface PaymentsTableProps {
  searchQuery?: string
}

export function PaymentsTable({ searchQuery = "" }: PaymentsTableProps) {
  const {
    filteredPayments,
    loading,
    searchQuery: searchValue,
    setEndDate,
    setFilteredStatus,
    setSearchQuery,
    setStartDate,
    handleExport,
  } = useAffiliatePaymentsTable(searchQuery)

  const getStatusBadge = (status: "concluido" | "pendente" | "cancelado") => {
    switch (status) {
      case "concluido":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Pago</Badge>
      case "pendente":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pendente</Badge>
      case "cancelado":
        return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Falhou</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b">
        <div className="mb-4 mt-4 flex items-center justify-between">
          <DateRangePicker
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pagamento..."
            className="w-full pl-8 sm:w-[240px]"
            value={searchValue}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filtro de Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilteredStatus("concluido")}>Concluído</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredStatus("pendente")}>Pendente</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilteredStatus("cancelado")}>Cancelado</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilteredStatus("")}>Limpar Filtro</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[150px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Referência
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Valor
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Método
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Data
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button variant="outline" onClick={handleExport}>Exportar</Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="group">
                  <TableCell>
                    <div className="font-medium">{payment.id}</div>
                  </TableCell>
                  <TableCell>{formatUsd(payment.valor)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>PIX</TableCell>
                  <TableCell>
                    {payment.dataPedido
                      ? format(new Date(payment.dataPedido), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      : "Data inválida"}
                  </TableCell>
                  <TableCell />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-96 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Nenhum pagamento encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há pagamentos que correspondam aos seus critérios de busca.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
