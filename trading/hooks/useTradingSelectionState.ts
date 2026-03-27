"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ForexPair,
  initialForexPairs,
  normalizeTradingPair,
} from "@/lib/forex-data";

const LAST_TRADING_PAIR_STORAGE_KEY = "lastTradingPair";

function getRandomPair(
  pairs: ForexPair[],
  excludedSymbol?: string,
): ForexPair | undefined {
  const eligiblePairs = excludedSymbol
    ? pairs.filter((pair) => pair.symbol !== excludedSymbol)
    : pairs;

  if (eligiblePairs.length === 0) {
    return pairs[0];
  }

  return eligiblePairs[Math.floor(Math.random() * eligiblePairs.length)];
}

function persistSelectedPair(symbol: string) {
  if (typeof window !== "undefined" && symbol) {
    localStorage.setItem(LAST_TRADING_PAIR_STORAGE_KEY, symbol);
  }
}

async function getPreferredPendingSymbol(): Promise<string | null> {
  try {
    const response = await fetch("/api/account/operations/pending", {
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    const pendingOperations = await response.json();
    if (!Array.isArray(pendingOperations)) {
      return null;
    }

    const pendingOperation = pendingOperations
      .filter(
        (operation) =>
          operation &&
          operation.resultado === "pendente" &&
          typeof operation.ativo === "string",
      )
      .sort((a, b) => {
        const aExpiry = a?.expiresAt
          ? new Date(a.expiresAt).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bExpiry = b?.expiresAt
          ? new Date(b.expiresAt).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aExpiry - bExpiry;
      })[0];

    return typeof pendingOperation?.ativo === "string"
      ? pendingOperation.ativo.toUpperCase()
      : null;
  } catch {
    return null;
  }
}

export function useTradingSelectionState() {
  const [cryptos, setCryptos] = useState<ForexPair[]>(initialForexPairs);
  const [selectedCrypto, setSelectedCrypto] = useState<ForexPair | undefined>(
    undefined,
  );
  const [openCharts, setOpenCharts] = useState<string[]>([]);
  const [currentChart, setCurrentChart] = useState("");
  const [tradingPair, setTradingPair] = useState("");
  const [pairsLoaded, setPairsLoaded] = useState(false);

  const clearSelection = useCallback(() => {
    setCryptos([]);
    setSelectedCrypto(undefined);
    setTradingPair("");
    setCurrentChart("");
    setOpenCharts([]);
  }, []);

  const handleCryptoSelect = useCallback(
    (crypto: ForexPair, _addOnly: boolean) => {
      setSelectedCrypto(crypto);
      setOpenCharts((prev) =>
        prev.includes(crypto.symbol) ? prev : [...prev, crypto.symbol],
      );
      setCurrentChart(crypto.symbol);
      setTradingPair(crypto.symbol);
      persistSelectedPair(crypto.symbol);
    },
    [],
  );

  const handleChangeChart = useCallback(
    (symbol: string) => {
      setCurrentChart(symbol);
      setTradingPair(symbol);

      const crypto = cryptos.find((item) => item.symbol === symbol);
      if (crypto) {
        setSelectedCrypto(crypto);
      }

      persistSelectedPair(symbol);
    },
    [cryptos],
  );

  const removeChart = useCallback(
    (symbol: string) => {
      setOpenCharts((prev) => {
        const remaining = prev.filter((item) => item !== symbol);

        if (currentChart === symbol) {
          const fallbackPair =
            remaining.length > 0
              ? cryptos.find((pair) => pair.symbol === remaining[0])
              : getRandomPair(cryptos, symbol);
          const nextCurrentSymbol = fallbackPair?.symbol ?? "";

          setCurrentChart(nextCurrentSymbol);
          setTradingPair(nextCurrentSymbol);
          setSelectedCrypto(fallbackPair);
          persistSelectedPair(nextCurrentSymbol);

          if (remaining.length === 0) {
            return nextCurrentSymbol ? [nextCurrentSymbol] : [];
          }
        }

        return remaining;
      });
    },
    [cryptos, currentChart],
  );

  const handleToggleFavorite = useCallback((crypto: ForexPair) => {
    setCryptos((prev) => {
      const updatedCryptos = prev.map((item) =>
        item.symbol === crypto.symbol
          ? { ...item, favorite: !item.favorite }
          : item,
      );

      const updatedSelected = updatedCryptos.find(
        (item) => item.symbol === crypto.symbol,
      );
      if (updatedSelected) {
        setSelectedCrypto((current) =>
          current?.symbol === updatedSelected.symbol
            ? updatedSelected
            : current,
        );
      }

      return updatedCryptos;
    });
  }, []);

  const handleUpdateCryptos = useCallback(
    (updatedCryptos: ForexPair[]) => {
      setCryptos(updatedCryptos);

      const updatedSelected = updatedCryptos.find(
        (item) => item.symbol === selectedCrypto?.symbol,
      );
      if (updatedSelected) {
        setSelectedCrypto(updatedSelected);
      }
    },
    [selectedCrypto?.symbol],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPairs() {
      const savedSymbol =
        typeof window !== "undefined"
          ? localStorage.getItem(LAST_TRADING_PAIR_STORAGE_KEY)
          : null;
      const preferredActiveSymbol = await getPreferredPendingSymbol();

      try {
        const response = await fetch("/api/config/pairs", {
          credentials: "include",
        });

        if (!response.ok) {
          if (!cancelled) {
            clearSelection();
            setPairsLoaded(true);
          }
          return;
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0 || cancelled) {
          if (!cancelled) {
            clearSelection();
            setPairsLoaded(true);
          }
          return;
        }

        const pairs = data.map((pair) => normalizeTradingPair(pair));
        const resolvedInitialPair =
          pairs.find((pair) => pair.symbol === preferredActiveSymbol) ??
          pairs.find((pair) => pair.symbol === savedSymbol) ??
          getRandomPair(pairs);

        if (!resolvedInitialPair) {
          return;
        }

        setCryptos(pairs);
        setSelectedCrypto(resolvedInitialPair);
        setTradingPair(resolvedInitialPair.symbol);
        setCurrentChart(resolvedInitialPair.symbol);
        setOpenCharts([resolvedInitialPair.symbol]);
        persistSelectedPair(resolvedInitialPair.symbol);
        setPairsLoaded(true);
      } catch (error) {
        if (!cancelled) {
          clearSelection();
          setPairsLoaded(true);
        }

        if (process.env.NODE_ENV !== "production") {
          console.error("Erro ao carregar paridades:", error);
        }
      }
    }

    void loadPairs();

    return () => {
      cancelled = true;
    };
  }, [clearSelection]);

  return {
    cryptos,
    selectedCrypto,
    openCharts,
    currentChart,
    tradingPair,
    setTradingPair,
    handleCryptoSelect,
    handleChangeChart,
    removeChart,
    handleToggleFavorite,
    handleUpdateCryptos,
    pairsLoaded,
    hasAvailablePairs: cryptos.length > 0,
  };
}
