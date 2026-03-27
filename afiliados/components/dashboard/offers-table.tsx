"use client"

import { ArrowUpDown, MoreHorizontal, Tag, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useAffiliateOffersTable } from "@/hooks/use-affiliate-offers-table"

interface OffersTableProps {
  searchQuery?: string
  refresh: boolean
}

export function OffersTable({ searchQuery = "", refresh }: OffersTableProps) {
  const {
    filteredOffers,
    loading,
    offers,
    selectedOffers,
    tipoComissao,
    copyToClipboard,
    toggleSelectAll,
    toggleSelectOffer,
  } = useAffiliateOffersTable(searchQuery, refresh)

  const getStatusBadge = (status: "active" | "inactive" | "pending") => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativa</Badge>
      case "inactive":
        return <Badge variant="outline" className="text-muted-foreground">Inativa</Badge>
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pendente</Badge>
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
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedOffers.length === filteredOffers.length && filteredOffers.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todas"
                />
              </TableHead>
              <TableHead className="w-[250px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Oferta
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
                  Categoria
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Depósito Mínimo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Comissão
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Cliques
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tipoComissao === null ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  Nenhuma comissão configurada
                </TableCell>
              </TableRow>
            ) : filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <TableRow key={offer.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedOffers.includes(offer.id)}
                      onCheckedChange={() => toggleSelectOffer(offer.id)}
                      aria-label={`Selecionar ${offer.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{offer.name}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>{offer.category}</TableCell>
                  <TableCell>
                    {offer.tipoComissao === "cpa"
                      ? formatUsd(offer.cpaMin || 0, "en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : "Nenhum"}
                  </TableCell>
                  <TableCell>
                    {offer.tipoComissao === "cpa"
                      ? formatUsd(offer.cpaValor || 0, "en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : `${offer.revShareFalsoValue ?? offer.revShareValue ?? 0}%`}
                  </TableCell>
                  <TableCell>{offer.cliques.toLocaleString("pt-BR")}</TableCell>
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
                        <DropdownMenuItem>
                          <Tag className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Oferta</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {offer.status === "active" ? (
                          <DropdownMenuItem>Desativar Oferta</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Ativar Oferta</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Excluir Oferta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-96 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Tag className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Nenhuma oferta encontrada</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há ofertas que correspondam aos seus critérios de busca.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {tipoComissao !== null && offers[0]?.offerLink && (
        <div className="mt-4 flex items-center">
          <input
            type="text"
            value={offers[0].offerLink}
            className="w-full rounded-md border p-2"
            readOnly
          />
          <Button
            variant="outline"
            onClick={() => { void copyToClipboard(offers[0].offerLink) }}
            className="ml-2"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copiar
          </Button>
        </div>
      )}
    </div>
  )
}
