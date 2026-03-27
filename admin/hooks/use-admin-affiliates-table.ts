"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [affiliates, setAffiliates] = useState<AdminAffiliateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAffiliates(MOCK_AFFILIATES);
      setLoading(false);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, []);

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
    if (selectedAffiliates.includes(affiliateId)) {
      setSelectedAffiliates(selectedAffiliates.filter((id) => id !== affiliateId));
      return;
    }

    setSelectedAffiliates([...selectedAffiliates, affiliateId]);
  };

  return {
    filteredAffiliates,
    loading,
    selectedAffiliates,
    toggleSelectAffiliate,
    toggleSelectAll,
  };
}
