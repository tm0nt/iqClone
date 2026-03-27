"use client";

import { useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import type { AffiliateAffiliateRow } from "@/lib/types/account.types";

export type { AffiliateAffiliateRow };

// TODO: substituir por endpoint real quando disponível
const MOCK_AFFILIATES: AffiliateAffiliateRow[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@example.com",
    status: "active",
    joinDate: "15/01/2023",
    conversions: 45,
    earnings: 2250.0,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    status: "active",
    joinDate: "22/03/2023",
    conversions: 32,
    earnings: 1600.0,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "Pedro Santos",
    email: "pedro.santos@example.com",
    status: "inactive",
    joinDate: "10/05/2023",
    conversions: 12,
    earnings: 600.0,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
  {
    id: "4",
    name: "Ana Costa",
    email: "ana.costa@example.com",
    status: "active",
    joinDate: "05/02/2023",
    conversions: 58,
    earnings: 2900.0,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
  {
    id: "5",
    name: "Lucas Ferreira",
    email: "lucas.ferreira@example.com",
    status: "pending",
    joinDate: "18/04/2023",
    conversions: 0,
    earnings: 0,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
];

export function useAffiliateAffiliatesTable(searchQuery = "") {
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);

  const { data, loading } = useAsync(
    () => Promise.resolve(MOCK_AFFILIATES),
    [],
  );

  const affiliates = data ?? [];

  const filteredAffiliates = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return affiliates.filter(
      (affiliate) =>
        affiliate.name.toLowerCase().includes(normalizedSearch) ||
        affiliate.email.toLowerCase().includes(normalizedSearch),
    );
  }, [affiliates, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedAffiliates.length === filteredAffiliates.length) {
      setSelectedAffiliates([]);
      return;
    }
    setSelectedAffiliates(filteredAffiliates.map((affiliate) => affiliate.id));
  };

  const toggleSelectAffiliate = (affiliateId: string) => {
    setSelectedAffiliates((prev) =>
      prev.includes(affiliateId)
        ? prev.filter((id) => id !== affiliateId)
        : [...prev, affiliateId],
    );
  };

  return {
    filteredAffiliates,
    loading,
    selectedAffiliates,
    toggleSelectAffiliate,
    toggleSelectAll,
  };
}
