"use client";

import { useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { usersService } from "@/lib/services/users.service";
import type { AffiliateUser, AffiliateUserStatus } from "@/lib/types/account.types";

export type { AffiliateUser, AffiliateUserStatus };

export function useAffiliateUsersTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, loading, error } = useAsync(
    () => usersService.list(),
    [],
  );

  const users = data ?? [];

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.nome.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch),
    );
  }, [searchTerm, users]);

  return {
    error,
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
  };
}
