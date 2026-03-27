"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, MoreHorizontal, MessageSquare, Code } from "lucide-react"
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

interface PostbacksTableProps {
  searchQuery?: string
}

interface Postback {
  id: string
  name: string
  platform: string
  url: string
  status: "active" | "inactive"
  offer: string
  lastTriggered: string
  successRate: number
}

export function PostbacksTable({ searchQuery = "" }: PostbacksTableProps) {
  const [postbacks, setPostbacks] = useState<Postback[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPostbacks, setSelectedPostbacks] = useState<string[]>([])

  useEffect(() => {
    // Simular carregamento de dados
    const timer = setTimeout(() => {
      setPostbacks([])
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredPostbacks = postbacks.filter(
    (postback) =>
      postback.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postback.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postback.offer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const toggleSelectAll = () => {
    if (selectedPostbacks.length === filteredPostbacks.length) {
      setSelectedPostbacks([])
    } else {
      setSelectedPostbacks(filteredPostbacks.map((postback) => postback.id))
    }
  }

  const toggleSelectPostback = (postbackId: string) => {
    if (selectedPostbacks.includes(postbackId)) {
      setSelectedPostbacks(selectedPostbacks.filter((id) => id !== postbackId))
    } else {
      setSelectedPostbacks([...selectedPostbacks, postbackId])
    }
  }

  const getStatusBadge = (status: Postback["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ativo</Badge>
      case "inactive":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Inativo
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
                  checked={selectedPostbacks.length === filteredPostbacks.length && filteredPostbacks.length > 0}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead className="w-[200px]">
                <Button variant="ghost" className="p-0 font-medium">
                  Nome
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
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Oferta
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Último Disparo
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" className="p-0 font-medium">
                  Taxa de Sucesso
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPostbacks.length > 0 ? (
              filteredPostbacks.map((postback) => (
                <TableRow key={postback.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedPostbacks.includes(postback.id)}
                      onCheckedChange={() => toggleSelectPostback(postback.id)}
                      aria-label={`Selecionar ${postback.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{postback.name}</div>
                  </TableCell>
                  <TableCell>{postback.platform}</TableCell>
                  <TableCell>{getStatusBadge(postback.status)}</TableCell>
                  <TableCell>{postback.offer}</TableCell>
                  <TableCell>{postback.lastTriggered}</TableCell>
                  <TableCell>{postback.successRate}%</TableCell>
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
                          <Code className="mr-2 h-4 w-4" />
                          Ver URL
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Ver Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar Postback</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {postback.status === "active" ? (
                          <DropdownMenuItem>Desativar Postback</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Ativar Postback</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          Excluir Postback
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
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <h3 className="font-semibold">Nenhum postback encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Não há postbacks que correspondam aos seus critérios de busca.
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
