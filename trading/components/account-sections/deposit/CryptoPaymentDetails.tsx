"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAccountStore } from "@/store/account-store";
import PaymentConfirmationScreen from "./PaymentConfirmationScreen";
import { formatUsd } from "@shared/platform/branding";

interface CryptoPaymentDetailsProps {
  paymentData: {
    payment_id: string;
    payment_status: string;
    pay_address: string;
    price_amount: number;
    price_currency: string | null;
    pay_amount: number;
    pay_currency: string | null;
    order_id: string;
    order_description: string;
    created_at: string;
    expiration_estimate_date: string;
  };
  onBack: () => void;
}

export default function CryptoPaymentDetails({ paymentData, onBack }: CryptoPaymentDetailsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const { syncBalances } = useAccountStore();
  const toast = useToast();

  // Initialize timer based on expiration_estimate_date
  useEffect(() => {
    if (!paymentData.expiration_estimate_date || paymentConfirmed) return;
    const expiration = new Date(paymentData.expiration_estimate_date).getTime();
    const now = new Date().getTime();
    const secondsLeft = Math.max(0, Math.floor((expiration - now) / 1000));
    setTimeLeft(secondsLeft);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData.expiration_estimate_date, paymentConfirmed]);

  // Poll payment status
  useEffect(() => {
    if (!paymentData.payment_id || paymentConfirmed) return;

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/account/deposit/${paymentData.payment_id}`);
        const data = await response.json();
        if (data.status === "finished" || data.status === "confirmed") {
          syncBalances();
          setPaymentConfirmed(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
      }
    };

    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [paymentData.payment_id, paymentConfirmed, syncBalances]);

  const formatCurrency = (amount: number | null | undefined, currency: string | null): string => {
    if (amount == null || isNaN(amount)) return "N/A";
    if (!currency) return amount.toString();
    if (currency.toLowerCase() === "brl" || currency.toLowerCase() === "usd") {
      return formatUsd(amount);
    } else if (currency.toLowerCase() === "usdttrc20") {
      return `${amount.toFixed(6)} USDT`;
    }
    return amount.toString();
  };

  const formatTime = () => {
    if (timeLeft === null) return "00:00";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCopyAddress = () => {
    if (!paymentData.pay_address) {
      toast.open({
        variant: "error",
        title: "Erro ao copiar",
        description: "Endereço de pagamento não disponível.",
        duration: 3000,
      });
      return;
    }
    navigator.clipboard.writeText(paymentData.pay_address).then(() => {
      setIsCopied(true);
      toast.open({
        variant: "success",
        title: "Endereço copiado!",
        description: "O endereço de pagamento foi copiado para a área de transferência.",
        duration: 3000,
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      toast.open({
        variant: "error",
        title: "Erro ao copiar",
        description: "Não foi possível copiar o endereço. Tente novamente.",
        duration: 3000,
      });
    });
  };

  if (paymentConfirmed) {
    return (
      <PaymentConfirmationScreen
        amount={formatCurrency(paymentData.price_amount, paymentData.price_currency)}
        usdtAmount={formatCurrency(paymentData.pay_amount, paymentData.pay_currency)}
      />
    );
  }

  const progressPercentage = timeLeft !== null ? (timeLeft / 1200) * 100 : 0; // 20 minutes = 1200 seconds

  return (
    <div className="bg-transparent rounded-xl p-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-platform-input-label hover:text-white transition-colors duration-300"
        >
          <ArrowLeft size={16} className="mr-2" />
          <span>Voltar</span>
        </button>
        <div className="text-sm text-platform-input-label">Depósito via Criptomoeda (USDT)</div>
      </div>

      <div className="mb-6">
        <div className="text-center text-xl font-medium mb-2">{formatTime()}</div>
        <div className="w-full bg-platform-input-border rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-platform-primary-hover to-[var(--platform-primary-gradient-to)]"
            style={{ width: `${progressPercentage}%`, transition: "width 1s linear" }}
          ></div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
        <p className="text-sm text-platform-input-label mb-4">
          Escaneie o QR Code com sua carteira USDT (rede TRC20) ou copie o endereço
        </p>
        <div className="text-platform-positive text-xl font-bold mb-4">
          {formatCurrency(paymentData.pay_amount, paymentData.pay_currency)}
        </div>
        <div className="text-sm text-platform-input-label mb-4">
          Equivalente a {formatCurrency(paymentData.price_amount, paymentData.price_currency)}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="rounded-xl bg-white p-4 w-64 h-64 flex items-center justify-center">
          <img
            src={`https://quickchart.io/qr?text=${paymentData.pay_address || ""}`}
            width="200"
            alt="QR Code USDT Address"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-platform-input-label mb-2">Endereço USDT (TRC20)</label>
        <div className="relative">
          <input
            type="text"
            value={paymentData.pay_address || ""}
            readOnly
            className="w-full bg-transparent border border-platform-input-border rounded-xl py-3 px-4 text-white text-sm font-mono overflow-hidden text-ellipsis pr-10"
          />
        </div>
      </div>

      <button
        onClick={handleCopyAddress}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
          isCopied
            ? "bg-platform-positive/20 text-platform-positive border border-platform-positive"
            : "bg-gradient-to-r from-platform-primary-hover via-platform-primary to-[var(--platform-primary-gradient-to)] text-white hover:shadow-[0_8px_25px_rgba(11,114,80,0.3)] hover:-translate-y-1"
        }`}
      >
        {isCopied ? (
          <>
            <Check size={18} />
            <span>Endereço copiado!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copiar endereço USDT</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-platform-input-label">
        <p>O pagamento será confirmado automaticamente em até 5 minutos.</p>
        <p className="mt-2">
          Este endereço é válido até{" "}
          {paymentData.expiration_estimate_date ? formatDate(paymentData.expiration_estimate_date) : "N/A"}.
        </p>
      </div>
    </div>
  );

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
