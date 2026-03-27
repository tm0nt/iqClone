"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatUsd } from "@shared/platform/branding";

export function StatisticsTableUser() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Total de itens
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/account/metrics/user?page=${currentPage}&limit=${itemsPerPage}`);
      const result = await response.json();

      if (result) {
        // Considerando que todos os dados estão no result
        setData(result);
        setTotalItems(result.length); // Calcula o total de itens pela quantidade de registros retornados
      } else {
        console.error('Erro ao buscar dados:', result.error || 'Resposta inválida');
      }
    } catch (error) {
      console.error('Erro ao fazer a requisição:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(totalItems / itemsPerPage); // Calcula o total de páginas com base no total de itens

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  return (
    <div>
      <div className="flex items-center justify-between p-4 bg-white">
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
          <div className="text-center p-4">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[100px]">
                  <Button variant="ghost" className="p-0 font-medium">
                    ID do Usuário
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium">
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="p-0 font-medium">
                    Email
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="p-0 font-medium">
                    Primeiro Depósito
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
              {data.length > 0 ? (
                data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.userId}</TableCell>
                    <TableCell className="capitalize">{row.nome}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="text-right">
                      {row.firstDeposit ? formatUsd(row.firstDeposit) : formatUsd(0)}
                    </TableCell>
                    <TableCell className="text-right">{formatUsd(row.revenue)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-96 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full border p-6 bg-muted/50">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold">Nenhum dado disponível</h3>
                      <p className="text-sm text-muted-foreground">
                        Não há dados que correspondam aos seus filtros atuais.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Paginação */}
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
  );
}
