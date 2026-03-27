"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export type AffiliateUserStatus = "active" | "inactive" | "pending";

export interface AffiliateUser {
  id: string;
  nome: string;
  email: string;
  status: AffiliateUserStatus;
  lastActive: string;
  createdAt: string;
}

export function useAffiliateUsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState<AffiliateUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/account/affiliate/list", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data?.error || "Não foi possível carregar os usuários.");
      }

      setUsers(data.users);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os dados dos usuários.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch),
    );
  }, [searchTerm, users]);

  return {
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
  };
}
