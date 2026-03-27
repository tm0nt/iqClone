"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string | null;
  birthDate: string | null;
  documentType: string | null;
  documentNumber: string | null;
  realBalance: number;
  demoBalance: number;
  commissionBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  registrationDate: string;
}

type RawClient = {
  id: string;
  nome: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  dataNascimento?: string | null;
  documentoTipo?: string | null;
  documentoNumero?: string | null;
  saldoReal?: number | null;
  saldoDemo?: number | null;
  saldoComissao?: number | null;
  totalDepositado?: number | null;
  totalSacado?: number | null;
  createdAt: string;
};

const ITEMS_PER_PAGE = 10;

const mapClient = (user: RawClient): AdminClient => ({
  id: user.id,
  name: user.nome,
  email: user.email,
  cpf: user.cpf || "",
  phone: user.telefone || "",
  birthDate: user.dataNascimento
    ? format(new Date(user.dataNascimento), "dd/MM/yyyy")
    : "",
  documentType: user.documentoTipo || "",
  documentNumber: user.documentoNumero || "",
  realBalance: user.saldoReal || 0,
  demoBalance: user.saldoDemo || 0,
  commissionBalance: user.saldoComissao || 0,
  totalDeposited: user.totalDepositado || 0,
  totalWithdrawn: user.totalSacado || 0,
  registrationDate: format(new Date(user.createdAt), "dd/MM/yyyy"),
});

export function useAdminClientsTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);
  const [editedClient, setEditedClient] = useState<Partial<AdminClient>>({});
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchClients = useCallback(async (page = currentPage) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/clients/list?page=${page}&limit=${ITEMS_PER_PAGE}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar clientes");
      }

      const data = await response.json();
      setClients((data.clients as RawClient[]).map(mapClient));
      setTotalItems(data.total);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, toast]);

  useEffect(() => {
    void fetchClients(currentPage);
  }, [currentPage, fetchClients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        client.cpf.includes(searchTerm),
    );
  }, [clients, searchTerm]);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / ITEMS_PER_PAGE),
    [totalItems],
  );

  const handleEditClient = useCallback(async (client: AdminClient) => {
    setSelectedClient(client);

    try {
      const response = await fetch(
        `/api/admin/clients/search?userId=${client.id}`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar detalhes");
      }

      const clientData = await response.json();

      setEditedClient({
        ...clientData,
        name: clientData.name,
        birthDate: clientData.birthDate
          ? format(new Date(clientData.birthDate), "yyyy-MM-dd")
          : "",
        realBalance: clientData.realBalance || 0,
        demoBalance: clientData.demoBalance || 0,
        commissionBalance: clientData.commissionBalance || 0,
        totalDeposited: clientData.totalDeposited ?? 0,
        totalWithdrawn: clientData.totalWithdrawn ?? 0,
      });
      setIsEditDialogOpen(true);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes do cliente",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSaveEdit = useCallback(async () => {
    if (!editedClient.id) {
      return;
    }

    try {
      const response = await fetch("/api/admin/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editedClient.id,
          nome: editedClient.name,
          email: editedClient.email,
          cpf: editedClient.cpf,
          telefone: editedClient.phone || "",
          dataNascimento: editedClient.birthDate,
          documentoTipo: editedClient.documentType || "",
          documentoNumero: editedClient.documentNumber || "",
          saldoReal: Number(editedClient.realBalance),
          saldoDemo: Number(editedClient.demoBalance),
          saldoComissao: Number(editedClient.commissionBalance),
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar");
      }

      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      });
      await fetchClients(currentPage);
      setIsEditDialogOpen(false);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o cliente",
        variant: "destructive",
      });
    }
  }, [currentPage, editedClient, fetchClients, toast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedClient) {
      return;
    }

    try {
      const response = await fetch("/api/admin/clients/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedClient.id }),
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar");
      }

      toast({
        title: "Sucesso",
        description: "Cliente deletado com sucesso",
      });
      await fetchClients(currentPage);
      setIsDeleteDialogOpen(false);
    } catch {
      toast({
        title: "Erro",
        description: "Não foi possível deletar o cliente",
        variant: "destructive",
      });
    }
  }, [currentPage, fetchClients, selectedClient, toast]);

  return {
    clients,
    currentPage,
    editedClient,
    filteredClients,
    isDeleteDialogOpen,
    isEditDialogOpen,
    itemsPerPage: ITEMS_PER_PAGE,
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
  };
}
