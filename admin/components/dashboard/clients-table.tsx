"use client"

import { formatCurrencyBRL } from "@/utils/formatters"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Trash2, MoreHorizontal, DollarSign, CreditCard, Wallet } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import {
  StatCard,
  FilterBar,
  DataTablePagination,
  TableEmptyRow,
  PageSkeleton,
  DetailModal,
} from "./shared"
import { useAdminClientsTable } from "@/hooks/use-admin-clients-table"

export function ClientsTable() {
  const {
    currentPage,
    editedClient,
    filteredClients,
    isDeleteDialogOpen,
    isEditDialogOpen,
    loading,
    searchTerm,
    selectedClient,
    totalItems,
    totalPages,
    fetchClients,
    handleConfirmDelete,
    handleEditClient,
    handleSaveEdit,
    setCurrentPage,
    setEditedClient,
    setIsDeleteDialogOpen,
    setIsEditDialogOpen,
    setSearchTerm,
    setSelectedClient,
  } = useAdminClientsTable()

  if (loading && filteredClients.length === 0) return <PageSkeleton />

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm">
        <FilterBar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Buscar por nome, email ou CPF..."
          onRefresh={() => fetchClients(currentPage)}
          loading={loading}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Nome</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">CPF</TableHead>
                <TableHead className="text-xs">Saldo Real</TableHead>
                <TableHead className="text-xs">Saldo Demo</TableHead>
                <TableHead className="text-xs">Comissão</TableHead>
                <TableHead className="text-xs text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="text-sm font-medium capitalize">{client.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{client.cpf || "—"}</TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">{formatCurrencyBRL(client.realBalance)}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{formatCurrencyBRL(client.demoBalance)}</TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">{formatCurrencyBRL(client.commissionBalance)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => { setSelectedClient(client); setIsDeleteDialogOpen(true) }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={7} title="Nenhum cliente encontrado" description="Tente ajustar a busca" />
              )}
            </TableBody>
          </Table>
        </div>

        <div className="px-4 pb-4">
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            showing={filteredClients.length}
            itemLabel="clientes"
            onPageChange={(p) => { if (p >= 1 && p <= totalPages) setCurrentPage(p) }}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <DetailModal
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Editar Cliente"
        description="Edite as informações do cliente"
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
          </div>
        }
      >
        {/* Stats inside modal */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-6">
          <StatCard
            title="Total Depositado"
            value={formatCurrencyBRL(editedClient.totalDeposited ?? 0)}
            icon={<DollarSign className="h-4 w-4" />}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="Total Sacado"
            value={formatCurrencyBRL(editedClient.totalWithdrawn ?? 0)}
            icon={<CreditCard className="h-4 w-4" />}
            iconClassName="bg-info/10 text-info"
          />
          <StatCard
            title="Saldo Disponível"
            value={formatCurrencyBRL((editedClient.realBalance ?? 0) + (editedClient.demoBalance ?? 0))}
            icon={<Wallet className="h-4 w-4" />}
            iconClassName="bg-success/10 text-success"
          />
        </div>

        {/* Form fields */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs">Nome</Label>
            <Input id="name" value={editedClient.name || ""} onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" value={editedClient.email || ""} onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpf" className="text-xs">CPF</Label>
            <Input id="cpf" value={editedClient.cpf || ""} onChange={(e) => setEditedClient({ ...editedClient, cpf: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs">Telefone</Label>
            <Input id="phone" value={editedClient.phone || ""} onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="birthDate" className="text-xs">Data de Nascimento</Label>
            <Input id="birthDate" type="date" value={editedClient.birthDate || ""} onChange={(e) => setEditedClient({ ...editedClient, birthDate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="documentType" className="text-xs">Tipo de Documento</Label>
            <Select value={editedClient.documentType || ""} onValueChange={(v) => setEditedClient({ ...editedClient, documentType: v })}>
              <SelectTrigger id="documentType"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RG">RG</SelectItem>
                <SelectItem value="CNH">CNH</SelectItem>
                <SelectItem value="Passaporte">Passaporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="documentNumber" className="text-xs">Número do Documento</Label>
            <Input id="documentNumber" value={editedClient.documentNumber || ""} onChange={(e) => setEditedClient({ ...editedClient, documentNumber: e.target.value })} />
          </div>
        </div>

        {/* Balance fields */}
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-3">Saldos</h4>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="realBalance" className="text-xs">Saldo Real (USD)</Label>
              <Input id="realBalance" type="number" step="0.01" value={editedClient.realBalance || 0} onChange={(e) => setEditedClient({ ...editedClient, realBalance: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="demoBalance" className="text-xs">Saldo Demo (USD)</Label>
              <Input id="demoBalance" type="number" step="0.01" value={editedClient.demoBalance || 0} onChange={(e) => setEditedClient({ ...editedClient, demoBalance: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="commissionBalance" className="text-xs">Saldo Comissão (USD)</Label>
              <Input id="commissionBalance" type="number" step="0.01" value={editedClient.commissionBalance || 0} onChange={(e) => setEditedClient({ ...editedClient, commissionBalance: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </DetailModal>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente{" "}
              <span className="font-medium">{selectedClient?.name}</span> e removerá seus dados do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
