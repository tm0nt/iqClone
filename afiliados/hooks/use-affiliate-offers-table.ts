"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface AffiliateOfferRow {
  id: string;
  name: string;
  status: "active" | "inactive" | "pending";
  category: string;
  tipoComissao: string | null;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareValue?: number;
  cliques: number;
  offerLink: string;
}

interface OfferApiPayload {
  tipoComissao: string | null;
  cpaMin?: number;
  cpaValor?: number;
  revShareFalsoValue?: number;
  revShareValue?: number;
  cliques: number;
  offerLink: string;
}

export function useAffiliateOffersTable(searchQuery = "", refreshKey = false) {
  const [offers, setOffers] = useState<AffiliateOfferRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [tipoComissao, setTipoComissao] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/account/offer/list", { cache: "no-store" });
      const data: OfferApiPayload = await response.json();

      if (response.ok) {
        const nextOffers: AffiliateOfferRow[] = [
          {
            id: "1",
            name: data.tipoComissao ?? "Nenhuma",
            status: "active",
            category: "Indicação",
            tipoComissao: data.tipoComissao,
            cpaMin: data.cpaMin,
            cpaValor: data.cpaValor,
            revShareFalsoValue: data.revShareFalsoValue,
            revShareValue: data.revShareValue,
            cliques: data.cliques,
            offerLink: data.offerLink,
          },
        ];

        setOffers(nextOffers);
        setTipoComissao(data.tipoComissao);
      }
    } catch {
      setOffers([]);
      setTipoComissao(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers, refreshKey]);

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
    if (selectedOffers.includes(offerId)) {
      setSelectedOffers(selectedOffers.filter((id) => id !== offerId));
      return;
    }

    setSelectedOffers([...selectedOffers, offerId]);
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
