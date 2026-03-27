"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatUsd } from "@shared/platform/branding"

interface OffersGridProps {
  searchQuery?: string
}

interface Offer {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "pending"
  category: string
  commission: number
  commissionType: "fixed" | "percentage"
  conversions: number
  epc: number
  approvalRate: number
  image: string
}

export function OffersGrid({ searchQuery = "" }: OffersGridProps) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setOffers([
        {
          id: "1",
          name: "Curso de Marketing Digital",
          description: "Curso completo de marketing digital para iniciantes e profissionais.",
          status: "active",
          category: "Educação",
          commission: 50,
          commissionType: "percentage",
          conversions: 245,
          epc: 2.8,
          approvalRate: 95,
          image: "/placeholder.svg?key=lfru2",
        },
        {
          id: "2",
          name: "Assinatura Premium",
          description: "Assinatura premium para acesso a conteúdo exclusivo.",
          status: "active",
          category: "SaaS",
          commission: 30,
          commissionType: "fixed",
          conversions: 180,
          epc: 3.2,
          approvalRate: 92,
          image: "/placeholder.svg?key=1wgxr",
        },
        {
          id: "3",
          name: "E-book Finanças Pessoais",
          description: "Guia completo para organizar suas finanças pessoais.",
          status: "inactive",
          category: "Educação",
          commission: 40,
          commissionType: "percentage",
          conversions: 120,
          epc: 1.8,
          approvalRate: 88,
          image: "/placeholder.svg?key=v9n6g",
        },
        {
          id: "4",
          name: "Plataforma de Investimentos",
          description: "Plataforma completa para investimentos em ações e fundos.",
          status: "active",
          category: "Finanças",
          commission: 100,
          commissionType: "fixed",
          conversions: 320,
          epc: 4.5,
          approvalRate: 94,
          image: "/placeholder.svg?key=k2he7",
        },
        {
          id: "5",
          name: "Programa de Emagrecimento",
          description: "Programa completo para emagrecimento saudável.",
          status: "pending",
          category: "Saúde",
          commission: 45,
          commissionType: "percentage",
          conversions: 210,
          epc: 2.4,
          approvalRate: 90,
          image: "/placeholder.svg?key=h31ld",
        },
        {
          id: "6",
          name: "Software de Gestão Empresarial",
          description: "Software completo para gestão de pequenas e médias empresas.",
          status: "active",
          category: "SaaS",
          commission: 60,
          commissionType: "fixed",
          conversions: 150,
          epc: 3.8,
          approvalRate: 93,
          image: "/placeholder.svg?key=ruawd",
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredOffers = offers.filter((offer) => offer.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativa</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Inativa
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredOffers.length > 0 ? (
        filteredOffers.map((offer) => (
          <Card
            key={offer.id}
            className="group overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <CardHeader className="p-0">
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={offer.image || "/placeholder.svg"}
                  alt={offer.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute right-2 top-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                      >
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
                      ) : offer.status === "inactive" || offer.status === "pending" ? (
                        <DropdownMenuItem>Ativar Oferta</DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        Excluir Oferta
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute left-2 top-2">{getStatusBadge(offer.status)}</div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                  <CardTitle className="text-lg">{offer.name}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{offer.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Comissão</p>
                  <p className="text-muted-foreground">
                    {offer.commissionType === "fixed"
                      ? formatUsd(offer.commission, "en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })
                      : `${offer.commission}%`}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Categoria</p>
                  <p className="text-muted-foreground">{offer.category}</p>
                </div>
                <div>
                  <p className="font-medium">Conversões</p>
                  <p className="text-muted-foreground">{offer.conversions.toLocaleString("pt-BR")}</p>
                </div>
                <div>
                  <p className="font-medium">EPC</p>
                  <p className="text-muted-foreground">{formatUsd(offer.epc)}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
                <p className="font-medium">{offer.approvalRate}%</p>
              </div>
              <Button size="sm">Promover</Button>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full flex h-96 items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Tag className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-semibold">Nenhuma oferta encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Não há ofertas que correspondam aos seus critérios de busca.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
