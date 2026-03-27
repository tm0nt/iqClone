"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAsync } from "@/hooks/use-async";
import { clientsService } from "@/lib/services/clients.service";
import type { AdminClient } from "@/lib/types/clients.types";

export type { AdminClient };

const ITEMS_PER_PAGE = 10;

export function useAdminClientsTable() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(
    null,
  );
  const [editedClient, setEditedClient] = useState<Partial<AdminClient>>({});

  const { data, loading, refetch } = useAsync(
    () => clientsService.list(currentPage, ITEMS_PER_PAGE),
    [currentPage],
  );

  const clients = data?.clients ?? [];
  const totalItems = data?.total ?? 0;
  const totalPages = useMemo(
    () => Math.ceil(totalItems / ITEMS_PER_PAGE),
    [totalItems],
  );

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(normalizedSearch) ||
        client.email.toLowerCase().includes(normalizedSearch) ||
        client.cpf.includes(searchTerm),
    );
  }, [clients, searchTerm]);

  const handleEditClient = useCallback(
    async (client: AdminClient) => {
      setSelectedClient(client);
      try {
        const clientData = await clientsService.getById(client.id);
        setEditedClient(clientData);
        setIsEditDialogOpen(true);
      } catch (e) {
        toast({
          title: "Erro",
          description:
            e instanceof Error
              ? e.message
              : "Não foi possível carregar os detalhes do cliente",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const handleSaveEdit = useCallback(async () => {
    if (!editedClient.id) return;
    try {
      await clientsService.update(editedClient);
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso" });
      await refetch();
      setIsEditDialogOpen(false);
    } catch (e) {
      toast({
        title: "Erro",
        description:
          e instanceof Error
            ? e.message
            : "Não foi possível atualizar o cliente",
        variant: "destructive",
      });
    }
  }, [editedClient, refetch, toast]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedClient) return;
    try {
      await clientsService.delete(selectedClient.id);
      toast({ title: "Sucesso", description: "Cliente deletado com sucesso" });
      await refetch();
      setIsDeleteDialogOpen(false);
    } catch (e) {
      toast({
        title: "Erro",
        description:
          e instanceof Error
            ? e.message
            : "Não foi possível deletar o cliente",
        variant: "destructive",
      });
    }
  }, [refetch, selectedClient, toast]);

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
    fetchClients: refetch,
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
