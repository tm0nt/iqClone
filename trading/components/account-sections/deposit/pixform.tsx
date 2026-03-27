import React, { useState } from "react";
import { useCpfMask } from "@/hooks/use-cpf-mask";
import { Check, AlertCircle } from "lucide-react";
import { formatUsd } from "@shared/platform/branding";

interface PixFormProps {
  depositValue: string;
  setDepositValue: (value: string) => void;
  devedorNome: string;
  setDevedorNome: (value: string) => void;
  cpfMaskedState: string;
  setCpfMaskedState: (value: string) => void;
  MIN_DEPOSIT_VALUE: number;
}

const PixForm: React.FC<PixFormProps> = ({
  depositValue,
  setDepositValue,
  devedorNome,
  setDevedorNome,
  cpfMaskedState,
  setCpfMaskedState,
  MIN_DEPOSIT_VALUE,
}) => {
  const { handleChange, isValid: isCpfValid } = useCpfMask();
  const [isNomeValid, setIsNomeValid] = useState(false);

  const validateNome = (nome: string) => {
    const nameParts = nome.trim().split(/\s+/);
    return nameParts.length >= 2 && nameParts[0].length > 0 && nameParts[1].length > 0;
  };

  const handleDepositValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setDepositValue(value);
  };

  const handlePresetValueClick = (value: number) => {
    setDepositValue(value.toString());
  };

  const renderCpfValidationIndicator = () => {
    if (!cpfMaskedState) return null;
    if (isCpfValid) {
      return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-positive"><Check size={16} /></div>;
    } else if (cpfMaskedState.length >= 14) {
      return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-negative"><AlertCircle size={16} /></div>;
    }
    return null;
  };

  const renderNomeValidationIndicator = () => {
    if (!devedorNome) return null;
    if (isNomeValid) {
      return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-positive"><Check size={16} /></div>;
    }
    return <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-negative"><AlertCircle size={16} /></div>;
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
          <label className="block text-sm text-platform-input-label mb-2">Nome do devedor</label>
          <div className="relative">
            <input
              type="text"
              className={`w-full bg-transparent border ${
                devedorNome ? (isNomeValid ? "border-platform-positive" : "border-platform-negative") : "border-platform-input-border"
              } rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300 pr-10`}
              placeholder="Digite o nome completo"
              value={devedorNome}
              onChange={(e) => {
                const newValue = e.target.value;
                setDevedorNome(newValue);
                setIsNomeValid(validateNome(newValue));
              }}
            />
            {renderNomeValidationIndicator()}
          </div>
          {devedorNome && !isNomeValid && <div className="text-xs text-platform-negative mt-1">Informe nome e sobrenome</div>}
        </div>
        <div>
          <label className="block text-sm text-platform-input-label mb-2">CPF do devedor</label>
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
            {renderCpfValidationIndicator()}
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

export default PixForm;
