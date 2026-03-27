"use client";

import { Check } from "lucide-react";

interface PaymentConfirmationScreenProps {
  amount: string;
  usdtAmount?: string;
}

export default function PaymentConfirmationScreen({
  amount,
  usdtAmount,
}: PaymentConfirmationScreenProps) {
  return (
    <div className="bg-transparent  rounded-xl p-6 animate-in fade-in duration-300">
      <div className="text-center">
        <div className="w-20 h-20 bg-platform-positive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-platform-positive" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Pagamento Confirmado!</h3>
        <p className="text-sm text-platform-input-label mb-6">
          Seu depósito foi processado com sucesso e o valor já foi creditado em sua conta.
        </p>
        <div className="text-platform-positive text-xl font-bold mb-8">{amount}</div>
        {usdtAmount ? (
          <div className="text-sm text-platform-input-label">
            Valor em cripto: {usdtAmount}
          </div>
        ) : null}
      </div>
    </div>
  );
}
