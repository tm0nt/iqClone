"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, MoreHorizontal, Search, Trash2 } from "lucide-react"
import { Admin, Role } from "./admins-management"

interface AdminsTableProps {
  admins: Admin[]
  loading?: boolean
  onEdit: (admin: Admin) => void
  onDelete: (id: string) => void
}

export function AdminsTable({ admins, loading = false, onEdit, onDelete }: AdminsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null)

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const confirmDelete = (id: string) => {
    setAdminToDelete(id)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (adminToDelete) {
      onDelete(adminToDelete)
      setDeleteConfirmOpen(false)
      setAdminToDelete(null)
    }
  }

  const renderRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return <Badge className="bg-destructive hover:bg-destructive/90">Super Admin</Badge>
      case Role.ADMIN:
        return <Badge className="bg-info hover:bg-info/90">Admin</Badge>
      case Role.ASSISTANT_ADMIN:
        return <Badge className="bg-success hover:bg-success/90">Assistente</Badge>
      default:
        return <Badge>Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar administradores..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhum administrador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.nome}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.telefone || "—"}</TableCell>
                  <TableCell>{renderRoleBadge(admin.nivel)}</TableCell>
                  <TableCell>{new Date(admin.dataCriacao).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(admin)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(admin.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este administrador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
