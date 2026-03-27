"use client"

import { ArrowUpDown, MoreHorizontal, FileText, Download } from "lucide-react"
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
import { formatUsd } from "@shared/platform/branding"
import { useAdminPaymentsTable } from "@/hooks/use-admin-payments-table"

interface PaymentsTableProps {
  searchQuery?: string
}

export function PaymentsTable({ searchQuery = "" }: PaymentsTableProps) {
  const { filteredPayments, loading } = useAdminPaymentsTable(searchQuery)

  const getStatusBadge = (status: "paid" | "pending" | "processing" | "failed") => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success/10 text-success hover:bg-success/20">Pago</Badge>
      case "pending":
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Pendente</Badge>
      case "processing":
        return <Badge className="bg-info/10 text-info hover:bg-info/20">Processando</Badge>
      case "failed":
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Falhou</Badge>
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
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id} className="group">
                  <TableCell>
                    <div className="font-medium">{payment.reference}</div>
                  </TableCell>
                  <TableCell>{formatUsd(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>{payment.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        {payment.invoice && (
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Fatura
                          </DropdownMenuItem>
                        )}
                        {payment.status === "paid" && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Comprovante
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
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
