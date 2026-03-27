"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useAccountStore } from "@/store/account-store";
import PaymentConfirmationScreen from "./PaymentConfirmationScreen";

interface PixQRCodeScreenProps {
  amount: string;
  pixCode: string;
  onBack: () => void;
  id: string | null;
}

export default function PixQRCodeScreen({ amount, onBack, pixCode, id }: PixQRCodeScreenProps) {
  const { syncBalances } = useAccountStore();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (timeLeft <= 0 || paymentConfirmed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, paymentConfirmed]);

  useEffect(() => {
    if (!id || paymentConfirmed) return;
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/account/deposit/${id}`);
        const data = await response.json();
        if (data.status === true) {
          syncBalances();
          setPaymentConfirmed(true);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error);
      }
    };
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [id, paymentConfirmed, syncBalances]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.open({
      variant: "success",
      title: "Código copiado!",
      description: "O código PIX foi copiado para a área de transferência.",
      duration: 2000,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage = (timeLeft / 600) * 100;

  if (paymentConfirmed) {
    return <PaymentConfirmationScreen amount={amount} />;
  }

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
        <div className="text-sm text-platform-input-label">Depósito via PIX</div>
      </div>

      <div className="mb-6">
        <div className="text-center text-xl font-medium mb-2">{formatTime()}</div>
        <div className="w-full bg-platform-input-border rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-platform-primary-hover to-platform-positive"
            style={{ width: `${progressPercentage}%`, transition: "width 1s linear" }}
          ></div>
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Escaneie o QR Code</h3>
        <p className="text-sm text-platform-input-label mb-4">
          Escaneie o QR Code com o aplicativo do seu banco ou copie o código PIX
        </p>
        <div className="text-platform-positive text-xl font-bold mb-4">{amount}</div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="rounded-xl bg-white p-4 w-64 h-64 flex items-center justify-center">
          <img src={`https://quickchart.io/qr?text=${pixCode}`} width="200" alt="QR Code Pix" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-platform-input-label mb-2">Código PIX Copia e Cola</label>
        <div className="relative">
          <input
            type="text"
            value={pixCode}
            readOnly
            className="w-full bg-transparent border border-platform-input-border rounded-xl py-3 px-4 text-white text-sm font-mono overflow-hidden text-ellipsis pr-10"
          />
        </div>
      </div>

      <button
        onClick={handleCopyCode}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 ${
          copied
            ? "bg-platform-positive/20 text-platform-positive border border-platform-positive"
            : "bg-gradient-to-r from-platform-primary-hover via-platform-primary to-platform-positive text-white hover:shadow-lg hover:-translate-y-1"
        }`}
      >
        {copied ? (
          <>
            <Check size={18} />
            <span>Código copiado!</span>
          </>
        ) : (
          <>
            <Copy size={18} />
            <span>Copiar código PIX</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-platform-input-label">
        <p>O pagamento será confirmado automaticamente em até 5 minutos.</p>
        <p className="mt-2">Este QR Code é válido por até 10 minutos.</p>
      </div>
    </div>
  );
}