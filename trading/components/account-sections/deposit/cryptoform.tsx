import React from "react";

interface CryptoFormProps {
  depositUSDT: string;
  setDepositUSDT: (value: string) => void;
  walletAddress: string;
  setWalletAddress: (value: string) => void;
  MIN_DEPOSIT_USDT: number;
}

const CryptoForm: React.FC<CryptoFormProps> = ({
  depositUSDT,
  setDepositUSDT,
  walletAddress,
  setWalletAddress,
  MIN_DEPOSIT_USDT,
}) => {
  const isValidWalletAddress = (address: string): boolean => address.length >= 26 && address.length <= 42 && /^[a-zA-Z0-9]+$/.test(address);

  const handleDepositUSDTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setDepositUSDT(value);
  };

  const handlePresetValueClick = (value: number) => setDepositUSDT(value.toString());

  return (
    <div className="bg-transparent rounded-xl p-4 mb-6">
      <h4 className="font-medium mb-4 text-sm">Detalhes do depósito</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        {[50, 100, 200, 500].map((value) => (
          <button
            key={value}
            className={`px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
              parseFloat(depositUSDT) === value
                ? "bg-gradient-to-r from-platform-primary-hover to-[var(--platform-primary-gradient-to)] text-white"
                : "bg-transparent border border-platform-input-border text-white hover:bg-platform-input-bg"
            }`}
            onClick={() => handlePresetValueClick(value)}
          >
            ${value}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-platform-input-label mb-2">Amount (USD)</label>
          <input
            type="number"
            className="w-full bg-transparent border border-platform-input-border rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-platform-positive transition-colors duration-300"
            placeholder="Digite o valor em USDT"
            value={depositUSDT}
            onChange={handleDepositUSDTChange}
          />
          <div className="text-xs text-platform-input-label mt-1">Minimum amount: ${MIN_DEPOSIT_USDT}</div>
        </div>
        <div>
        </div>
      </div>
    </div>
  );
};

export default CryptoForm;
