"use client"

import { ArrowUpDown, Download, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatUsd } from "@shared/platform/branding"
import { useAffiliateStatisticsTable } from "@/hooks/use-affiliate-statistics-table"

export function StatisticsTable() {
  const {
    currentPage,
    loading,
    paginatedRows,
    setEndDate,
    setStartDate,
    totalPages,
    nextPage,
    prevPage,
  } = useAffiliateStatisticsTable()

  return (
    <div>
      <div className="flex items-center justify-between bg-white p-4">
        <DateRangePicker
          onStartDateChange={(start) => setStartDate(start)}
          onEndDateChange={(end) => setEndDate(end)}
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DropdownMenuTrigger>
          </DropdownMenu>
        </div>
      </div>
      <div className="border-t">
        {loading ? (
          <div className="p-4 text-center">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[100px]">
                  <Button variant="ghost" className="p-0 font-medium">
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium">
                    País
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium">
                    Plataforma
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 font-medium">
                    Visitantes Únicos
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 font-medium">
                    Registros
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 font-medium">
                    Primeiros Depósitos
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 font-medium">
                    Receita
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>Brasil</TableCell>
                    <TableCell>Desconhecido</TableCell>
                    <TableCell className="text-right">{row.uniqueVisitors}</TableCell>
                    <TableCell className="text-right">{row.registrations}</TableCell>
                    <TableCell className="text-right">{row.firstDeposits}</TableCell>
                    <TableCell className="text-right">{formatUsd(row.revenue)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-96 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full border bg-muted/50 p-6">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">Nenhum dado disponível</h3>
                      <p className="text-sm text-muted-foreground">
                        Não há dados que correspondam aos seus filtros atuais.
                        <br />
                        Tente alterar seus filtros ou selecionar um intervalo de datas diferente.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {!loading && (
          <div className="flex justify-between p-4">
            <Button onClick={prevPage} disabled={currentPage === 1}>
              Anterior
            </Button>
            <span>Pagina {currentPage} de {totalPages}</span>
            <Button onClick={nextPage} disabled={currentPage === totalPages}>
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
