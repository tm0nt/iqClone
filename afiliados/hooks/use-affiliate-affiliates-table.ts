"use client";

import { useEffect, useMemo, useState } from "react";

export interface AffiliateAffiliateRow {
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
  const [affiliates, setAffiliates] = useState<AffiliateAffiliateRow[]>([]);
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
