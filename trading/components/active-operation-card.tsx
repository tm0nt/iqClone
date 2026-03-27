"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import type { Operation } from "@/store/account-store";
import { useAccountStore } from "@/store/account-store";
import { useTranslations } from "next-intl";
import {
  subscribeToPriceUpdates,
  unsubscribeFromPriceUpdates,
} from "@/lib/price-provider";

interface ActiveOperationCardProps {
  operation: Operation;
  onExpire: (id: string) => void;
  payoutRate?: number;
}

export default function ActiveOperationCard({
  operation,
  onExpire,
  payoutRate = 0.9,
}: ActiveOperationCardProps) {
  const t = useTranslations("ActiveOperationCard");
  const [progress, setProgress] = useState(100);
  const [timeLeft, setTimeLeft] = useState(operation.expiryTime - Date.now());
  const [status, setStatus] = useState<"pendente" | "aberto">("pendente");
  const [displayTime, setDisplayTime] = useState("00:00");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isWinning, setIsWinning] = useState<boolean | null>(null);

  // Referência para armazenar o tempo total da operação
  const totalDurationRef = useRef(
    operation.expiryTime - operation.openedAt,
  );

  // Obter o preço atual do store
  const { currentPrices, updateCurrentPrice } = useAccountStore();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formatar o tempo restante para exibição
  const formatTimeDisplay = (milliseconds: number) => {
    if (milliseconds <= 0) return "00:00";

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  // Calcular o valor potencial (ganho ou perda)
  const calculatePotentialValue = () => {
    if (isWinning === null) return formatCurrency(operation.value);

    if (isWinning) {
      const profit = operation.expectedProfit || operation.value * payoutRate;
      return formatCurrency(operation.value + profit);
    } else {
      // Perda: valor apostado negativo
      return `-${formatCurrency(operation.value)}`;
    }
  };

  // Atualizar o status de ganho/perda com base no preço atual
  useEffect(() => {
    if (currentPrice === null) return;

    if (operation.type === "buy") {
      // Se comprou, está ganhando se o preço atual > preço de entrada
      setIsWinning(currentPrice > operation.entryPrice);
    } else {
      // Se vendeu, está ganhando se o preço atual < preço de entrada
      setIsWinning(currentPrice < operation.entryPrice);
    }
  }, [currentPrice, operation.type, operation.entryPrice]);

  // Subscrever para atualizações de preço
  useEffect(() => {
    const handlePriceUpdate = (price: number) => {
      // Evite atualizar o estado se o preço não mudou
      setCurrentPrice((prevPrice) => {
        if (prevPrice === price) return prevPrice;
        return price;
      });

      // Use uma referência para o símbolo atual para evitar problemas de closure
      updateCurrentPrice(operation.asset, price);
    };

    // Verificar se já temos o preço no store, mas evite atualizar o estado se não for necessário
    if (
      currentPrices[operation.asset] &&
      currentPrice !== currentPrices[operation.asset]
    ) {
      setCurrentPrice(currentPrices[operation.asset]);
    }

    // Subscrever para atualizações de preço
    subscribeToPriceUpdates(operation.asset, handlePriceUpdate);

    // Limpar subscrição quando o componente for desmontado
    return () => {
      unsubscribeFromPriceUpdates(operation.asset, handlePriceUpdate);
    };
  }, [operation.asset, updateCurrentPrice]); // Remova currentPrices das dependências

  // Mudar status de "pendente" para "aberto" após 1 segundo
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("aberto");
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Atualizar o progresso da barra com base no tempo restante
  useEffect(() => {
    // Calcular a duração total uma vez
    const totalDuration = totalDurationRef.current;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = operation.expiryTime - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setProgress(0);
        setDisplayTime("00:00");
        onExpire(operation.id);
        return;
      }

      // Atualizar o tempo restante
      setTimeLeft(remaining);
      setDisplayTime(formatTimeDisplay(remaining));

      // Calcular o progresso como porcentagem do tempo restante
      const progressPercentage = (remaining / totalDuration) * 100;
      setProgress(Math.max(0, progressPercentage));
    }, 100); // Atualizar mais frequentemente para animação mais suave

    return () => clearInterval(interval);
  }, [operation.expiryTime, operation.id, onExpire]);

  // Determinar a cor com base no status
  const statusColor = status === "pendente" ? "var(--platform-warning-color)" : "var(--platform-positive-color)";

  // Determinar a cor do valor com base no status de ganho/perda
  const valueColor =
    isWinning === null
      ? statusColor
      : isWinning
        ? "var(--platform-positive-color)"
        : "var(--platform-negative-color)";

  // Atualizar a barra de progresso para que se comporte como o timer principal
  return (
    <div className="border-b border-platform-overlay-border py-3 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-platform-overlay-hover overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear"
          style={{
            width: `${progress}%`, // Usar diretamente a porcentagem do progresso
            backgroundColor: statusColor,
          }}
        ></div>
      </div>

      {/* Resto do componente permanece igual */}
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          <button className="mr-2 text-platform-overlay-muted">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="font-medium">
            {operation.asset}
            {currentPrice && (
              <span className="ml-2 text-xs text-platform-overlay-muted">
                {currentPrice.toFixed(4)}
              </span>
            )}
          </div>
        </div>
        <div className="font-medium" style={{ color: valueColor }}>
          {calculatePotentialValue()}
        </div>
      </div>

      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center text-xs text-platform-overlay-muted">
          {operation.entryTime.split(" ")[1]} / {operation.timeframe}
        </div>
        <div className="flex items-center text-xs text-platform-overlay-muted">
          {t("entryPrice")}: {operation.entryPrice?.toFixed(6)}
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center mr-1 ${
                operation.type === "buy"
                  ? "bg-platform-positive/20"
                  : "bg-platform-negative/20"
              }`}
            >
              <BarChart2
                size={12}
                className={
                  operation.type === "buy"
                    ? "text-platform-positive"
                    : "text-platform-negative"
                }
              />
            </div>
            {operation.type === "buy" ? (
              <TrendingUp size={14} className="text-platform-positive" />
            ) : (
              <TrendingDown size={14} className="text-platform-negative" />
            )}
          </div>
          <div className="text-xs" style={{ color: statusColor }}>
            {status === "pendente" ? t("pending") : t("open")}
          </div>
        </div>
      </div>

      {/* Tempo restante acima da barra de progresso */}
      <div className="flex justify-end mt-1">
        <div className="text-xs" style={{ color: statusColor }}>
          {displayTime}
        </div>
      </div>
    </div>
  );
}
