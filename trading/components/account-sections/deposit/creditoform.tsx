import React from "react";
import { useCpfMask } from "@/hooks/use-cpf-mask";
import { Check, AlertCircle } from "lucide-react";
import { formatUsd } from "@shared/platform/branding";

interface CreditoFormProps {
  depositValue: string;
  setDepositValue: (value: string) => void;
  cardNumber: string;
  setCardNumber: (value: string) => void;
  cardHolder: string;
  setCardHolder: (value: string) => void;
  cardExpiry: string;
  setCardExpiry: (value: string) => void;
  cardCVV: string;
  setCardCVV: (value: string) => void;
  cpfMaskedState: string;
  setCpfMaskedState: (value: string) => void;
  MIN_DEPOSIT_VALUE: number;
}

const CreditoForm: React.FC<CreditoFormProps> = ({
  depositValue,
  setDepositValue,
  cardNumber,
  setCardNumber,
  cardHolder,
  setCardHolder,
  cardExpiry,
  setCardExpiry,
  cardCVV,
  setCardCVV,
  cpfMaskedState,
  setCpfMaskedState,
  MIN_DEPOSIT_VALUE,
}) => {
  const { handleChange, isValid: isCpfValid } = useCpfMask();

  const isValidCardNumber = (number: string): boolean => number.replace(/\D/g, "").length === 16;
  const isValidCardExpiry = (expiry: string): boolean => {
    const [month, year] = expiry.replace(/\D/g, "").match(/(\d{2})(\d{2})/)?.slice(1) || [];
    if (!month || !year) return false;
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(`20${year}`, 10);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return monthNum >= 1 && monthNum <= 12 && yearNum >= currentYear && (yearNum > currentYear || monthNum >= currentMonth);
  };
  const isValidCVV = (cvv: string): boolean => cvv.replace(/\D/g, "").length === 3;
  const validateNome = (nome: string) => {
    const nameParts = nome.trim().split(/\s+/);
    return nameParts.length >= 2 && nameParts[0].length > 0 && nameParts[1].length > 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 4 && value.length <= 8) value = `${value.slice(0, 4)} ${value.slice(4)}`;
    else if (value.length > 8 && value.length <= 12) value = `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8)}`;
    else if (value.length > 12) value = `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8, 12)} ${value.slice(12, 16)}`;
    setCardNumber(value);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
    setCardExpiry(value);
  };

  const handleCardCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCVV(value);
  };

  const handleDepositValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setDepositValue(value);
  };

  const handlePresetValueClick = (value: number) => setDepositValue(value.toString());

  const renderValidationIndicator = (value: string, isValid: boolean, lengthCheck: number) => {
    if (!value) return null;
    if (isValid) return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-positive"><Check size={16} /></div>;
    if (value.length >= lengthCheck) return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-negative"><AlertCircle size={16} /></div>;
    return null;
  };

  return (
    <div className="bg-transparent rounded-xl p-4 mb-6">
      <h4 className="font-medium mb-4 text-sm">Detalhes do depósito</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {[60, 100, 200, 500].map((value) => (
          <button
            key={value}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              parseFloat(depositValue) === value
                ? "bg-gradient-to-r from-platform-primary-hover to-[var(--platform-primary-gradient-to)] text-white"
                : "bg-transparent border border-platform-input-border text-white hover:bg-platform-input-bg"
            }`}
            onClick={() => handlePresetValueClick(value)}
          >
            {formatUsd(value, "en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-platform-input-label mb-2">Nome do titular</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                cardHolder ? (validateNome(cardHolder) ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="Digite o nome completo"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
            />
            {cardHolder && !validateNome(cardHolder) && <div className="text-xs text-platform-negative mt-1">Informe nome e sobrenome</div>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-platform-input-label mb-2">Número do cartão</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                cardNumber.length >= 19 ? (isValidCardNumber(cardNumber) ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="1234 5678 9012 3456"
              value={cardNumber}
              onChange={handleCardNumberChange}
            />
            {renderValidationIndicator(cardNumber, isValidCardNumber(cardNumber), 19)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm text-platform-input-label mb-2">CPF do titular</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                cpfMaskedState.length >= 14 ? (isCpfValid ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="Digite o CPF"
              value={cpfMaskedState}
              onChange={(e) => {
                setCpfMaskedState(e.target.value);
                handleChange(e.target.value);
              }}
            />
            {renderValidationIndicator(cpfMaskedState, isCpfValid, 14)}
          </div>
        </div>
        <div>
          <label className="block text-sm text-platform-input-label mb-2">Validade</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                cardExpiry.length >= 5 ? (isValidCardExpiry(cardExpiry) ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={handleCardExpiryChange}
            />
            {renderValidationIndicator(cardExpiry, isValidCardExpiry(cardExpiry), 5)}
          </div>
        </div>
        <div>
          <label className="block text-sm text-platform-input-label mb-2">CVV</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                cardCVV.length >= 3 ? (isValidCVV(cardCVV) ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="123"
              value={cardCVV}
              onChange={handleCardCVVChange}
            />
            {renderValidationIndicator(cardCVV, isValidCVV(cardCVV), 3)}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm text-platform-input-label mb-2">Valor</label>
        <input
          type="text"
          className="w-full bg-transparent border border-platform-input-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300"
          placeholder="Digite o valor"
          value={depositValue}
          onChange={handleDepositValueChange}
        />
        <div className="text-xs text-platform-input-label mt-1">
          Valor mínimo: {formatUsd(MIN_DEPOSIT_VALUE, "en-US")}
        </div>
      </div>
    </div>
  );
};

export default CreditoForm;
