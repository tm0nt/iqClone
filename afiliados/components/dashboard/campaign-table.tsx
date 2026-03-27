"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, MoreHorizontal, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatUsd } from "@shared/platform/branding"
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
import { Progress } from "@/components/ui/progress"

interface CampaignTableProps {
  searchQuery?: string
}

interface Campaign {
  id: string
  name: string
  status: "active" | "paused" | "completed"
  platform: string
  budget: number
  spent: number
  clicks: number
  conversions: number
  ctr: number
  roi: number
}

export function CampaignTable({ searchQuery = "" }: CampaignTableProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setCampaigns([
        {
          id: "1",
          name: "Campanha Facebook - Verão 2023",
          status: "active",
          platform: "Facebook",
          budget: 5000,
          spent: 3200,
          clicks: 12500,
          conversions: 350,
          ctr: 2.8,
          roi: 180,
        },
        {
          id: "2",
          name: "Google Ads - Palavras-chave",
          status: "active",
          platform: "Google",
          budget: 3500,
          spent: 2800,
          clicks: 8200,
          conversions: 210,
          ctr: 2.56,
          roi: 165,
        },
        {
          id: "3",
          name: "Instagram Stories - Promoção",
          status: "paused",
          platform: "Instagram",
          budget: 2000,
          spent: 1200,
          clicks: 5400,
          conversions: 120,
          ctr: 2.22,
          roi: 140,
        },
        {
          id: "4",
          name: "TikTok - Vídeos Promocionais",
          status: "active",
          platform: "TikTok",
          budget: 4000,
          spent: 3600,
          clicks: 18500,
          conversions: 420,
          ctr: 2.27,
          roi: 210,
        },
        {
          id: "5",
          name: "Email Marketing - Clientes Antigos",
          status: "completed",
          platform: "Email",
          budget: 1500,
          spent: 1500,
          clicks: 3200,
          conversions: 180,
          ctr: 5.63,
          roi: 250,
        },
      ])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([])
    } else {
      setSelectedCampaigns(filteredCampaigns.map((campaign) => campaign.id))
    }
  }

  const toggleSelectCampaign = (campaignId: string) => {
    if (selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns(selectedCampaigns.filter((id) => id !== campaignId))
    } else {
      setSelectedCampaigns([...selectedCampaigns, campaignId])
    }
  }

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativa</Badge>
      case "paused":
        return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pausada</Badge>
      case "completed":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Concluída
          </Badge>
        )
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
                  checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todas"
                />
              </TableHead>
              <TableHead className="w-[250px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Campanha
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
                  Plataforma
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Orçamento
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Cliques
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
                  ROI
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedCampaigns.includes(campaign.id)}
                      onCheckedChange={() => toggleSelectCampaign(campaign.id)}
                      aria-label={`Selecionar ${campaign.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{campaign.name}</div>
                    <div className="mt-1">
                      <Progress value={(campaign.spent / campaign.budget) * 100} className="h-2 w-full" />
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>{formatUsd(campaign.spent, "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                        <span>{formatUsd(campaign.budget, "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                  <TableCell>{campaign.platform}</TableCell>
                  <TableCell>{formatUsd(campaign.budget, "en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                  <TableCell>{campaign.clicks.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{campaign.conversions.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>{campaign.roi}%</TableCell>
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
                          <LineChart className="mr-2 h-4 w-4" />
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Campanha</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {campaign.status === "active" ? (
                          <DropdownMenuItem>Pausar Campanha</DropdownMenuItem>
                        ) : campaign.status === "paused" ? (
                          <DropdownMenuItem>Ativar Campanha</DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Excluir Campanha
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
                    <LineChart className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Nenhuma campanha encontrada</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há campanhas que correspondam aos seus critérios de busca.
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
