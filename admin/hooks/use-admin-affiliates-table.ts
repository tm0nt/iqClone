"use client";

import { useMemo, useState } from "react";

export interface AdminAffiliateRow {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  joinDate: string;
  conversions: number;
  earnings: number;
  commissionRate: number;
  avatar?: string;
}

// TODO: substituir por endpoint real quando disponível
const MOCK_AFFILIATES: AdminAffiliateRow[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@example.com",
    status: "active",
    joinDate: "15/01/2023",
    conversions: 45,
    earnings: 2250,
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
    earnings: 1600,
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
    earnings: 600,
    commissionRate: 10,
    avatar: "/placeholder.svg",
  },
];

export function useAdminAffiliatesTable(searchQuery = "") {
  const [loading] = useState(false);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);

  const filteredAffiliates = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return MOCK_AFFILIATES.filter(
      (affiliate) =>
        affiliate.name.toLowerCase().includes(normalizedSearch) ||
        affiliate.email.toLowerCase().includes(normalizedSearch),
    );
  }, [searchQuery]);

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
