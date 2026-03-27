"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminsTable } from "@/components/dashboard/admins-table"
import { AdminForm } from "@/components/dashboard/admin-form"
import { PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  ASSISTANT_ADMIN = "ASSISTANT_ADMIN",
}

export interface Admin {
  id: string
  email: string
  nome: string
  telefone?: string
  dataCriacao: Date | string
  nivel: Role
}

export function AdminsManagement() {
  const { toast } = useToast()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)

  const fetchAdmins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin")
      if (!res.ok) throw new Error()
      setAdmins(await res.json())
    } catch {
      toast({ title: "Erro", description: "Não foi possível carregar os administradores.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchAdmins() }, [fetchAdmins])

  const handleDeleteAdmin = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Sucesso", description: "Administrador excluído." })
      fetchAdmins()
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir o administrador.", variant: "destructive" })
    }
  }

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin)
    setIsFormOpen(true)
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setEditingAdmin(null)
    fetchAdmins()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Lista de Administradores</h3>
        <Button
          onClick={() => { setIsFormOpen(true); setEditingAdmin(null) }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Novo Administrador
        </Button>
      </div>

      {isFormOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingAdmin ? "Editar Administrador" : "Novo Administrador"}</CardTitle>
            <CardDescription>
              {editingAdmin
                ? "Atualize as informações do administrador"
                : "Preencha os dados para cadastrar um novo administrador"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminForm
              admin={editingAdmin}
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingAdmin(null) }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <AdminsTable
              admins={admins}
              loading={loading}
              onEdit={handleEditAdmin}
              onDelete={handleDeleteAdmin}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
