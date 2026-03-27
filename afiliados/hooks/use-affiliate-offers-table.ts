"use client";

import { useMemo, useState } from "react";
import { useAsync } from "@/hooks/use-async";
import { offersService } from "@/lib/services/offers.service";
import type { AffiliateOfferRow } from "@/lib/types/account.types";

export type { AffiliateOfferRow };

export function useAffiliateOffersTable(searchQuery = "", refreshKey = false) {
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);

  const { data, loading } = useAsync(
    () => offersService.list(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  );

  const offers = data?.offers ?? [];
  const tipoComissao = data?.tipoComissao ?? null;

  const filteredOffers = useMemo(() => {
    const normalizedSearch = searchQuery.toLowerCase();
    return offers.filter(
      (offer) =>
        offer.name.toLowerCase().includes(normalizedSearch) ||
        offer.category.toLowerCase().includes(normalizedSearch),
    );
  }, [offers, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedOffers.length === filteredOffers.length) {
      setSelectedOffers([]);
      return;
    }
    setSelectedOffers(filteredOffers.map((offer) => offer.id));
  };

  const toggleSelectOffer = (offerId: string) => {
    setSelectedOffers((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId],
    );
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return {
    filteredOffers,
    loading,
    offers,
    selectedOffers,
    tipoComissao,
    copyToClipboard,
    toggleSelectAll,
    toggleSelectOffer,
  };
}
