"use client"

import { ArrowUpDown, MoreHorizontal, Users, UserPlus } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatUsd } from "@shared/platform/branding"
import { useAffiliateAffiliatesTable } from "@/hooks/use-affiliate-affiliates-table"

interface AffiliatesTableProps {
  searchQuery?: string
}

export function AffiliatesTable({ searchQuery = "" }: AffiliatesTableProps) {
  const { filteredAffiliates, loading, selectedAffiliates, toggleSelectAffiliate, toggleSelectAll } =
    useAffiliateAffiliatesTable(searchQuery)

  const getStatusBadge = (status: "active" | "inactive" | "pending") => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativo</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Inativo
          </Badge>
        )
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
                  checked={selectedAffiliates.length === filteredAffiliates.length && filteredAffiliates.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="w-[250px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Afiliado
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
                  Data de Entrada
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Conversões
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Ganhos
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Comissão
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffiliates.length > 0 ? (
              filteredAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedAffiliates.includes(affiliate.id)}
                      onCheckedChange={() => toggleSelectAffiliate(affiliate.id)}
                      aria-label={`Selecionar ${affiliate.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={affiliate.avatar || "/placeholder.svg"} alt={affiliate.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {affiliate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{affiliate.name}</div>
                        <div className="text-xs text-muted-foreground">{affiliate.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                  <TableCell>{affiliate.joinDate}</TableCell>
                  <TableCell>{affiliate.conversions}</TableCell>
                  <TableCell>{formatUsd(affiliate.earnings)}</TableCell>
                  <TableCell>{affiliate.commissionRate}%</TableCell>
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
                          <Users className="mr-2 h-4 w-4" />
                          Ver Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Comissão</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {affiliate.status === "active" ? (
                          <DropdownMenuItem>Desativar Afiliado</DropdownMenuItem>
                        ) : affiliate.status === "inactive" || affiliate.status === "pending" ? (
                          <DropdownMenuItem>Ativar Afiliado</DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Remover Afiliado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-96 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserPlus className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Nenhum afiliado encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há afiliados que correspondam aos seus critérios de busca.
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
