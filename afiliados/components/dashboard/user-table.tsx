"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { formatDate } from "@/utils/formatters"
import { useAffiliateUsersTable } from "@/hooks/use-affiliate-users-table"

export function UserTable() {
  const { filteredUsers, loading, searchTerm, setSearchTerm } = useAffiliateUsersTable()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>Lista de todos os usuários registrados na plataforma.</CardDescription>
        <div className="mt-2 flex w-full max-w-sm items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuários..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Carregando usuários...
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead>Data de Cadastro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium capitalize">{user.nome}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active"
                          ? "default"
                          : user.status === "inactive"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {user.status === "active" ? "Ativo" : user.status === "inactive" ? "Inativo" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell>Desconhecido</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
