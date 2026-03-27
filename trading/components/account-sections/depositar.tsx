"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useToast } from "@/components/ui/toast";
import { CreditCard, Building2, Wallet, Inbox } from "lucide-react";
import { useAccountStore } from "@/store/account-store";
import { AccountInlineSelect } from "@/components/account-inline-select";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { enUS, es as esLocale, ptBR } from "date-fns/locale";
import {
  AccountListSectionSkeleton,
  AccountProcessingSkeleton,
} from "@/components/account-loading-skeletons";
import { trackPlatformPixel } from "@/lib/tracking/pixels";

interface DepositSectionProps {
  mode?: "deposit" | "history";
}

export default function DepositSection({
  mode = "deposit",
}: DepositSectionProps) {
  const t = useTranslations("Deposit");
  const locale = useLocale();
  const dateFnsLocale = locale === "es" ? esLocale : locale === "pt" ? ptBR : enUS;

  const [depositId, setDepositId] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositValue, setDepositValue] = useState("");
  const [depositCrypto, setDepositCrypto] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ssnMaskedState, setSsnMaskedState] = useState("");
  const [method, setMethod] = useState("credit_card");
  const [cryptoType, setCryptoType] = useState("bitcoin");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const toast = useToast();
  const { name, email, cpf, syncBalances } = useAccountStore();
  const [MIN_DEPOSIT_VALUE, setMIN_DEPOSIT_VALUE] = useState(100);
  const [MIN_DEPOSIT_CRYPTO, setMIN_DEPOSIT_CRYPTO] = useState(50);
  const isHistoryMode = mode === "history";
  const hasDeposits = deposits.length > 0;

  const cryptoOptions = [
    { id: "bitcoin", label: t("bitcoin"), symbol: "BTC" },
    { id: "ethereum", label: t("ethereum"), symbol: "ETH" },
    { id: "usdt", label: t("usdt"), symbol: "USDT" },
    { id: "usdc", label: t("usdc"), symbol: "USDC" },
  ];

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config/general");
        const data = await response.json();
        if (data.valorMinimoDeposito) setMIN_DEPOSIT_VALUE(Number(data.valorMinimoDeposito));
        if (data.valorMinimoDepositoUSDT) setMIN_DEPOSIT_CRYPTO(Number(data.valorMinimoDepositoUSDT));
      } catch (error) {
        console.error("Error fetching minimum deposit values:", error);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        setIsHistoryLoading(true);
        const response = await fetch("/api/account/deposit/history");
        const data = await response.json();
        setDeposits(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching deposit history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchDeposits();
  }, []);

  useEffect(() => {
    setIsLoading(false);
    setPaymentData(null);
  }, [mode]);

  const formatCurrency = (value: string | number): string => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    if (isNaN(num)) return "$0.00";
    return num.toLocaleString(locale, { style: "currency", currency: "USD" });
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }
    return digits;
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 9);
    return digits.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
  };

  const validateName = (name: string) => {
    const nameParts = name.trim().split(/\s+/);
    return nameParts.length >= 2 && nameParts[0].length > 0 && nameParts[1].length > 0;
  };

  const isValidSSN = (ssn: string) => {
    const cleanedSSN = ssn.replace(/\D/g, "");
    if (cleanedSSN.length !== 9) return false;
    if (/^(\d)\1+$/.test(cleanedSSN)) return false;
    return true;
  };

  const isValidCardNumber = (number: string): boolean => {
    const digits = number.replace(/\D/g, "");
    return digits.length >= 13 && digits.length <= 19;
  };

  const isValidCardExpiry = (expiry: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(expiry)) return false;

    const [month, year] = expiry.split("/");
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = Number.parseInt(year);
    const expMonth = Number.parseInt(month);

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;

    return true;
  };

  const isValidCVV = (cvv: string): boolean => /^\d{3,4}$/.test(cvv);

  const isValidRoutingNumber = (routing: string): boolean => {
    const digits = routing.replace(/\D/g, "");
    return digits.length === 9;
  };

  const isValidAccountNumber = (account: string): boolean => {
    const digits = account.replace(/\D/g, "");
    return digits.length >= 4 && digits.length <= 17;
  };

  const isValidWalletAddress = (address: string): boolean => {
    return address.length >= 26 && address.length <= 42 && /^[a-zA-Z0-9]+$/.test(address);
  };

  const handleMethodChange = (selectedMethod: string) => {
    setMethod(selectedMethod);
    setDepositValue("");
    setDepositCrypto("");
    setAccountHolderName("");
    setSsnMaskedState("");
    setWalletAddress("");
    setCardNumber("");
    setCardHolder("");
    setCardExpiry("");
    setCardCVV("");
    setRoutingNumber("");
    setAccountNumber("");
    setPaymentData(null);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardExpiry(formatted);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCVV(digits);
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    setSsnMaskedState(formatted);
  };

  const handleRoutingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setRoutingNumber(digits);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 17);
    setAccountNumber(digits);
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      if (method === "credit_card") {
        const numericValue = Number.parseFloat(depositValue);
        if (isNaN(numericValue) || numericValue < MIN_DEPOSIT_VALUE) {
          toast.open({
            variant: "error",
            title: t("minimumAmountNotReached"),
            description: t("minimumDepositAmount", { amount: formatCurrency(MIN_DEPOSIT_VALUE) }),
            duration: 5000,
          });
          return;
        }

        if (!validateName(cardHolder)) {
          toast.open({
            variant: "error",
            title: t("invalidCardHolderName"),
            description: t("enterFullName"),
            duration: 5000,
          });
          return;
        }

        if (!isValidSSN(ssnMaskedState)) {
          toast.open({
            variant: "error",
            title: t("invalidSSN"),
            description: t("enterValidSSN"),
            duration: 5000,
          });
          return;
        }

        if (!isValidCardNumber(cardNumber)) {
          toast.open({
            variant: "error",
            title: t("invalidCardNumber"),
            description: t("enterValidCardNumber"),
            duration: 5000,
          });
          return;
        }

        if (!isValidCardExpiry(cardExpiry)) {
          toast.open({
            variant: "error",
            title: t("invalidExpiryDate"),
            description: t("enterValidExpiryDate"),
            duration: 5000,
          });
          return;
        }

        if (!isValidCVV(cardCVV)) {
          toast.open({
            variant: "error",
            title: t("invalidCVV"),
            description: t("enterValidCVV"),
            duration: 5000,
          });
          return;
        }

        const response = await fetch("/api/account/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "credit_card",
            name: cardHolder,
            cpf: ssnMaskedState.replace(/\D/g, ""),
            email: email || "",
            amount: numericValue,
            card: {
              number: cardNumber.replace(/\s/g, ""),
              holderName: cardHolder,
              expiry: cardExpiry,
              cvv: cardCVV,
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t("errorProcessingCreditCardDeposit"));
        }

        toast.open({
          variant: "success",
          title: t("depositSuccessful"),
          description: t("creditCardDepositProcessed"),
          duration: 5000,
        });
        trackPlatformPixel("deposit", {
          amount: numericValue,
          method: "credit_card",
        });

        syncBalances();
      } else if (method === "bank_transfer") {
        const numericValue = Number.parseFloat(depositValue);
        if (isNaN(numericValue) || numericValue < MIN_DEPOSIT_VALUE) {
          toast.open({
            variant: "error",
            title: t("minimumAmountNotReached"),
            description: t("minimumDepositAmount", { amount: formatCurrency(MIN_DEPOSIT_VALUE) }),
            duration: 5000,
          });
          return;
        }

        if (!validateName(accountHolderName)) {
          toast.open({
            variant: "error",
            title: t("invalidAccountHolderName"),
            description: t("enterFullNameAccount"),
            duration: 5000,
          });
          return;
        }

        if (!isValidSSN(ssnMaskedState)) {
          toast.open({
            variant: "error",
            title: t("invalidSSN"),
            description: t("enterValidSSN"),
            duration: 5000,
          });
          return;
        }

        if (!isValidRoutingNumber(routingNumber)) {
          toast.open({
            variant: "error",
            title: t("invalidRoutingNumber"),
            description: t("enterValid9DigitRoutingNumber"),
            duration: 5000,
          });
          return;
        }

        if (!isValidAccountNumber(accountNumber)) {
          toast.open({
            variant: "error",
            title: t("invalidAccountNumber"),
            description: t("enterValidAccountNumber"),
            duration: 5000,
          });
          return;
        }

        const response = await fetch("/api/account/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "bank_transfer",
            name: accountHolderName,
            cpf: ssnMaskedState.replace(/\D/g, ""),
            email: email || "",
            amount: numericValue,
            bankAccount: {
              routingNumber: routingNumber,
              accountNumber: accountNumber,
              holderName: accountHolderName,
            },
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t("errorProcessingBankTransferDeposit"));
        }

        toast.open({
          variant: "success",
          title: t("depositInitiated"),
          description: t("bankTransferDepositInitiated"),
          duration: 5000,
        });
        trackPlatformPixel("deposit", {
          amount: numericValue,
          method: "bank_transfer",
        });

        syncBalances();
      } else if (method === "cryptocurrency") {
        const numericCrypto = Number.parseFloat(depositCrypto);
        if (isNaN(numericCrypto) || numericCrypto < MIN_DEPOSIT_CRYPTO) {
          toast.open({
            variant: "error",
            title: t("minimumAmountNotReached"),
            description: t("minimumDepositAmountCrypto", {
              amount: MIN_DEPOSIT_CRYPTO,
              symbol: cryptoOptions.find((opt) => opt.id === cryptoType)?.symbol ?? "",
            }),
            duration: 5000,
          });
          return;
        }

        const response = await fetch("/api/account/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "cryptocurrency",
            name: name || "User",
            cpf: cpf || "000000000",
            email: email || "",
            amount: numericCrypto,
            cryptoType: cryptoType,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || t("errorProcessingCryptocurrencyDeposit"));
        }

        setPaymentData(data.data);
        toast.open({
          variant: "success",
          title: t("depositAddressGenerated"),
          description: t("sendCryptocurrency"),
          duration: 5000,
        });
        trackPlatformPixel("deposit", {
          amount: numericCrypto,
          method: "cryptocurrency",
          asset: cryptoType,
        });
      }

      // Refresh deposits list
      const depositsResponse = await fetch("/api/account/deposit/history");
      const depositsData = await depositsResponse.json();
      setDeposits(depositsData);
    } catch (error: any) {
      toast.open({
        variant: "error",
        title: t("errorProcessingDeposit"),
        description: error.message || t("errorOccurred"),
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDepositHistory = () => (
    <div>
      {isHistoryLoading ? (
        <AccountListSectionSkeleton items={4} />
      ) : (
        <>
      <h3 className="text-lg font-semibold text-platform-text mb-6">{t("depositHistory")}</h3>
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm text-platform-overlay-muted mb-2">{t("statusLabel")}</label>
          <AccountInlineSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { id: "All statuses", label: t("allStatuses") },
              { id: "completed", label: t("status.completed") },
              { id: "pending", label: t("status.pending") },
              { id: "failed", label: t("status.failed") },
            ]}
            placeholder={t("allStatuses")}
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm text-platform-overlay-muted mb-2">{t("startDate")}</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="account-native-field w-full appearance-none py-3 px-4"
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <label className="block text-sm text-platform-overlay-muted mb-2">{t("endDate")}</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="account-native-field w-full appearance-none py-3 px-4"
          />
        </div>
      </div>

      {!hasDeposits ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
            <Inbox size={24} className="text-platform-overlay-muted" />
          </div>
          <div className="text-lg font-medium mb-2 text-platform-text">{t("noDepositsFound")}</div>
          <div className="text-sm text-platform-overlay-muted">{t("depositHistoryWillAppear")}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {deposits.map((deposit) => (
            <div
              key={deposit.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-platform-text">{formatCurrency(deposit.valor ?? deposit.amount ?? 0)}</div>
                  <div className="mt-1 text-xs capitalize text-platform-overlay-muted">{deposit.tipo || deposit.method || "-"}</div>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs capitalize transition-colors duration-200 ${
                    deposit.status === "completed" || deposit.status === "concluido"
                      ? "bg-platform-positive/10 text-platform-positive"
                      : deposit.status === "pending" || deposit.status === "pendente"
                        ? "bg-platform-demo/10 text-platform-demo"
                        : "bg-platform-danger/10 text-platform-danger"
                  }`}
                >
                  {t(`status.${deposit.status}`)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="text-platform-overlay-muted">{t("id")}</div>
                <div className="text-right text-xs text-platform-overlay-muted">{deposit.id.slice(0, 8)}...</div>
                <div className="text-platform-overlay-muted">{t("method")}</div>
                <div className="text-right text-platform-text capitalize">{deposit.tipo || deposit.method || "-"}</div>
                <div className="text-platform-overlay-muted">{t("date")}</div>
                <div className="text-right text-platform-text">{format(new Date(deposit.dataCriacao || deposit.createdAt), "PPP", { locale: dateFnsLocale })}</div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );

  const renderDepositContent = () => {
    if (isLoading) {
      return <AccountProcessingSkeleton blocks={method === "cryptocurrency" ? 2 : 3} />;
    }

    if (paymentData && method === "cryptocurrency") {
      return (
        <div className="bg-white/[0.03] rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">{t("cryptocurrencyDeposit")}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-platform-overlay-muted mb-2">{t("sendToAddress")}</label>
              <div className="bg-white/[0.03] p-4 rounded-xl">
                <code className="text-platform-positive break-all">{paymentData.address}</code>
              </div>
            </div>
            <div>
              <label className="block text-sm text-platform-overlay-muted mb-2">{t("amount")}</label>
              <div className="text-platform-text font-semibold">
                {depositCrypto} {cryptoOptions.find((opt) => opt.id === cryptoType)?.symbol}
              </div>
            </div>
            <div className="bg-platform-demo/10 border border-platform-demo/20 rounded-xl p-4">
              <p className="text-platform-demo text-sm">
                <strong>{t("important")}</strong> {t("sendExactAmount")}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <div className="col-span-12">
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("depositMethod")}</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                  method === "credit_card"
                    ? "bg-white/10 text-white"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/8 hover:text-white/80"
                }`}
                onClick={() => handleMethodChange("credit_card")}
              >
                <CreditCard size={24} className="mr-3" />
                <span className="text-sm font-medium">{t("creditCard")}</span>
              </button>
              <button
                className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                  method === "cryptocurrency"
                    ? "bg-white/10 text-white"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/8 hover:text-white/80"
                }`}
                onClick={() => handleMethodChange("cryptocurrency")}
              >
                <Wallet size={24} className="mr-3" />
                <span className="text-sm font-medium">{t("cryptocurrency")}</span>
              </button>
            </div>
          </div>
        </div>

        {method === "credit_card" && (
          <>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("cardHolderName")}</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterFullNameOnCard")}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("ssn")}</label>
                <input
                  type="text"
                  value={ssnMaskedState}
                  onChange={handleSSNChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterSSN")}
                  maxLength={11}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("cardNumber")}</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder="1234 5678 9012 3456"
                  maxLength={23}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("expiryDate")}</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("cvv")}</label>
                <input
                  type="text"
                  value={cardCVV}
                  onChange={handleCVVChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-12">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("depositAmount")}</label>
                <input
                  type="text"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterAmount")}
                />
                <p className="text-xs text-platform-overlay-muted mt-2">
                  {t("minimum")}: {formatCurrency(MIN_DEPOSIT_VALUE)}
                </p>
              </div>
            </div>
          </>
        )}

        {method === "bank_transfer" && (
          <>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("accountHolderName")}</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterFullNameOnAccount")}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("ssn")}</label>
                <input
                  type="text"
                  value={ssnMaskedState}
                  onChange={handleSSNChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterSSN")}
                  maxLength={11}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("routingNumber")}</label>
                <input
                  type="text"
                  value={routingNumber}
                  onChange={handleRoutingChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enter9DigitRoutingNumber")}
                  maxLength={9}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("accountNumber")}</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={handleAccountChange}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterAccountNumber")}
                  maxLength={17}
                />
              </div>
            </div>
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-12">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("depositAmount")}</label>
                <input
                  type="text"
                  value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterAmount")}
                />
                <p className="text-xs text-platform-overlay-muted mt-2">
                  {t("minimum")}: {formatCurrency(MIN_DEPOSIT_VALUE)}
                </p>
              </div>
            </div>
          </>
        )}

        {method === "cryptocurrency" && (
          <>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("cryptocurrencyType")}</label>
                <AccountInlineSelect
                  value={cryptoType}
                  onChange={setCryptoType}
                  options={cryptoOptions.map((option) => ({
                    id: option.id,
                    label: option.label,
                  }))}
                  placeholder={t("cryptocurrencyType")}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm text-platform-overlay-muted mb-2">
                  {t("depositAmount")} ({cryptoOptions.find((opt) => opt.id === cryptoType)?.symbol})
                </label>
                <input
                  type="number"
                  value={depositCrypto}
                  onChange={(e) => setDepositCrypto(e.target.value)}
                  className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                  placeholder={t("enterAmount")}
                />
                <p className="text-xs text-platform-overlay-muted mt-2">
                  {t("minimum")}: {MIN_DEPOSIT_CRYPTO} {cryptoOptions.find((opt) => opt.id === cryptoType)?.symbol}
                </p>
              </div>
            </div>
          </>
        )}

        <button
          className="w-full bg-white text-black py-3 rounded-xl transition-all duration-200 hover:bg-white/90 disabled:opacity-50"
          onClick={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? t("processing") : t("continue")}
        </button>
      </>
    );
  };

  return (
    <div className="w-full text-platform-text">
      <div className="bg-white/[0.03] rounded-2xl p-5 sm:p-6">
        {isHistoryMode ? renderDepositHistory() : renderDepositContent()}
      </div>
    </div>
  );
}
