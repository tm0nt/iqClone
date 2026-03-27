"use client";

import { useState, useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAccountStore } from "@/store/account-store";
import { useToast } from "@/components/ui/toast";
import { AccountInlineSelect } from "@/components/account-inline-select";
import { ChevronDown, Coins, Building2, Inbox } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import {
  AccountListSectionSkeleton,
  AccountProcessingSkeleton,
} from "@/components/account-loading-skeletons";
import { trackPlatformPixel } from "@/lib/tracking/pixels";

const isValidSSN = (ssn: string): boolean => {
  ssn = ssn.replace(/[^\d]+/g, "");
  if (ssn.length !== 9) return false;
  if (/^(\d)\1+$/.test(ssn)) return false;
  return true;
};

const isValidPhone = (phone: string): boolean => {
  phone = phone.replace(/[^\d]+/g, "");
  return phone.length === 10;
};

const isValidWalletAddress = (address: string): boolean => {
  return address.length >= 26 && address.length <= 42 && /^[a-zA-Z0-9]+$/.test(address);
};

const isValidRoutingNumber = (routing: string): boolean => {
  routing = routing.replace(/[^\d]+/g, "");
  return routing.length === 9;
};

const isValidAccountNumber = (account: string): boolean => {
  account = account.replace(/[^\d]+/g, "");
  return account.length >= 4 && account.length <= 17;
};

const formatCurrency = (value: any, locale: string) => {
  if (value === null || value === undefined) return "$0.00";
  const numericValue = typeof value === "string" ? Number(value.replace(/\D/g, "")) : Number(value);
  return numericValue.toLocaleString(locale, {
    style: "currency",
    currency: "USD",
  });
};

function formatDateExtended(dateISO: string): string {
  const date = new Date(dateISO);
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  const day = date.getDate();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

interface WithdrawSectionProps {
  mode?: "withdraw" | "history";
}

export default function WithdrawSection({
  mode = "withdraw",
}: WithdrawSectionProps) {
  const t = useTranslations("Withdraw");
  const locale = useLocale();
  const toast = useToast();
  const [method, setMethod] = useState("bank_transfer");
  const [bankAccountType, setBankAccountType] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [MIN_WITHDRAW_VALUE, setMIN_WITHDRAW_VALUE] = useState(100);
  const [MIN_WITHDRAW_USDT, setMIN_WITHDRAW_USDT] = useState(50);
  const [withdrawValue, setWithdrawValue] = useState("");
  const [withdrawUSDT, setWithdrawUSDT] = useState("");
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState<{ id: string } | null>(null);
  const [withdraw, setWithdraw] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const { realBalance, syncBalances } = useAccountStore();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isBankAccountTypeOpen, setIsBankAccountTypeOpen] = useState(false);
  const bankAccountTypeRef = useRef<HTMLDivElement>(null);
  const isHistoryMode = mode === "history";
  const hasWithdrawals = withdraw.length > 0;

  const bankAccountTypeOptions = [
    { id: "checking", label: t("checkingAccount") },
    { id: "savings", label: t("savingsAccount") },
  ];

  useEffect(() => {
    const fetchMinWithdrawValue = async () => {
      try {
        const response = await fetch("/api/config/general");
        if (!response.ok) throw new Error("Failed to fetch config");
        const config = await response.json();
        if (config.valorMinimoSaque) {
          setMIN_WITHDRAW_VALUE(Number(config.valorMinimoSaque));
        }
        if (config.valorMinimoSaqueUSDT) {
          setMIN_WITHDRAW_USDT(Number(config.valorMinimoSaqueUSDT));
        }
      } catch (error) {
        console.error("Error fetching minimum withdraw value:", error);
      }
    };
    fetchMinWithdrawValue();
  }, []);

  useEffect(() => {
    const fetchWithdrawHistory = async () => {
      try {
        setIsHistoryLoading(true);
        const response = await fetch("/api/account/withdraw/history");
        const data = await response.json();
        setWithdraw(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching withdraw history:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchWithdrawHistory();
  }, []);

  useEffect(() => {
    setLoadingWithdraw(false);
  }, [mode]);

  const handleRoutingNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let routing = e.target.value.replace(/\D/g, "");
    if (routing.length > 9) {
      routing = routing.slice(0, 9);
    }
    setRoutingNumber(routing);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let account = e.target.value.replace(/\D/g, "");
    if (account.length > 17) {
      account = account.slice(0, 17);
    }
    setAccountNumber(account);
  };

  const handleWithdraw = async () => {
    const accountState = useAccountStore.getState();
    if (!accountState?.cpf || accountState.cpf.trim() === "") {
      toast.open({
        variant: "error",
        title: t("ssnNotRegistered"),
        description: t("addSSN"),
        duration: 5000,
      });
      return;
    }

    if (method === "bank_transfer") {
      const numericValue = Number(withdrawValue.replace(/\D/g, ""));

      if (!bankAccountType) {
        toast.open({
          variant: "error",
          title: t("invalidAccountType"),
          description: t("selectAccountType"),
          duration: 5000,
        });
        return;
      }

      if (!routingNumber) {
        toast.open({
          variant: "error",
          title: t("invalidRoutingNumber"),
          description: t("enterValidRoutingNumber"),
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

      if (!accountNumber) {
        toast.open({
          variant: "error",
          title: t("invalidAccountNumber"),
          description: t("enterValidAccountNumber"),
          duration: 5000,
        });
        return;
      }

      if (!isValidAccountNumber(accountNumber)) {
        toast.open({
          variant: "error",
          title: t("invalidAccountNumber"),
          description: t("enterValidAccountNumberDesc"),
          duration: 5000,
        });
        return;
      }

      if (!accountHolderName.trim()) {
        toast.open({
          variant: "error",
          title: t("invalidAccountHolderName"),
          description: t("enterAccountHolderName"),
          duration: 5000,
        });
        return;
      }

      if (numericValue < MIN_WITHDRAW_VALUE) {
        toast.open({
          variant: "error",
          title: t("minimumAmountNotReached"),
          description: t("minimumWithdrawalAmount", { amount: formatCurrency(MIN_WITHDRAW_VALUE, locale) }),
          duration: 5000,
        });
        return;
      }

      if (numericValue > realBalance) {
        toast.open({
          variant: "error",
          title: t("insufficientBalance"),
          description: t("availableBalance", { balance: formatCurrency(realBalance, locale) }),
          duration: 5000,
        });
        return;
      }

      setLoadingWithdraw(true);
      try {
        const response = await fetch("/api/account/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: numericValue,
            accountType: bankAccountType,
            routingNumber: routingNumber,
            accountNumber: accountNumber,
            accountHolderName: accountHolderName,
            method: "bank_transfer",
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const result = await response.json();
        setWithdrawSuccess({ id: result.id });
        setWithdrawValue("");
        setRoutingNumber("");
        setAccountNumber("");
        setAccountHolderName("");
        setBankAccountType("");
        syncBalances();

        const historyData1 = await fetch("/api/account/withdraw/history").then(r => r.json());
        setWithdraw(Array.isArray(historyData1) ? historyData1 : []);

        toast.open({
          variant: "success",
          title: t("withdrawalRequestedSuccessfully"),
          description: t("transactionId", { id: result.withdrawal.id }),
          duration: 5000,
        });
        trackPlatformPixel("withdraw", {
          amount: numericValue,
          method: "bank_transfer",
        });
      } catch (error) {
        toast.open({
          variant: "error",
          title: t("errorProcessingWithdrawal"),
          description: error instanceof Error ? error.message : t("tryAgainLater"),
          duration: 5000,
        });
      } finally {
        setLoadingWithdraw(false);
      }
    } else {
      const numericUSDT = Number(withdrawUSDT);

      if (!walletAddress) {
        toast.open({
          variant: "error",
          title: t("invalidWallet"),
          description: t("enterValidUSDTWalletAddress"),
          duration: 5000,
        });
        return;
      }

      if (!isValidWalletAddress(walletAddress)) {
        toast.open({
          variant: "error",
          title: t("invalidWalletAddress"),
          description: t("enterValidUSDTWalletAddress"),
          duration: 5000,
        });
        return;
      }

      if (numericUSDT < MIN_WITHDRAW_USDT) {
        toast.open({
          variant: "error",
          title: t("minimumAmountNotReached"),
          description: t("minimumWithdrawalAmountUSDT", { amount: MIN_WITHDRAW_USDT }),
          duration: 5000,
        });
        return;
      }

      setLoadingWithdraw(true);
      try {
        const response = await fetch("/api/account/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            valor: numericUSDT,
            walletAddress,
            method: "usdt",
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const result = await response.json();
        setWithdrawSuccess({ id: result.id });
        setWithdrawUSDT("");
        setWalletAddress("");
        syncBalances();

        const historyData2 = await fetch("/api/account/withdraw/history").then(r => r.json());
        setWithdraw(Array.isArray(historyData2) ? historyData2 : []);

        toast.open({
          variant: "success",
          title: t("withdrawalRequestedSuccessfully"),
          description: t("transactionId", { id: result.withdrawal.id }),
          duration: 5000,
        });
        trackPlatformPixel("withdraw", {
          amount: numericUSDT,
          method: "usdt",
        });
      } catch (error) {
        toast.open({
          variant: "error",
          title: t("errorProcessingWithdrawal"),
          description: error instanceof Error ? error.message : t("tryAgainLater"),
          duration: 5000,
        });
      } finally {
        setLoadingWithdraw(false);
      }
    }
  };

  const renderMobileWithdrawal = (withdrawal: any) => (
    <div
      key={withdrawal.id}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-200 hover:bg-white/[0.04]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-platform-text">
            {withdrawal.method === "usdt" ? `${withdrawal.valor} USDT` : formatCurrency(withdrawal.valor, locale)}
          </div>
          <div className="mt-1 text-xs uppercase text-platform-overlay-muted">
            {withdrawal.method === "usdt" ? "USDT" : t(`accountType.${withdrawal.accountType}`)}
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize transition-colors duration-200 ${
            withdrawal.status === "completed"
              ? "bg-platform-positive/10 text-platform-positive"
              : withdrawal.status === "pending"
                ? "bg-platform-demo/10 text-platform-demo"
                : "bg-platform-danger/10 text-platform-danger"
          }`}
        >
          {t(`status.${withdrawal.status}`)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="text-platform-overlay-muted">{t("id")}</div>
        <div className="text-right text-xs text-platform-overlay-muted">{withdrawal.id.slice(0, 8)}...</div>
        <div className="text-platform-overlay-muted">{t("requestDate")}</div>
        <div className="text-right text-platform-text">{formatDateExtended(withdrawal.dataPedido)}</div>
        <div className="text-platform-overlay-muted">{t("paymentDate")}</div>
        <div className="text-right text-platform-text">
          {withdrawal.dataPagamento ? formatDateExtended(withdrawal.dataPagamento) : "-"}
        </div>
        <div className="text-platform-overlay-muted">{withdrawal.method === "usdt" ? t("wallet") : t("account")}</div>
        <div className="text-right text-platform-text">
          {withdrawal.method === "usdt" ? withdrawal.walletAddress : `****${withdrawal.accountNumber?.slice(-4)}`}
        </div>
        <div className="text-platform-overlay-muted">{t("fee")}</div>
        <div className="text-right text-platform-text">
          {withdrawal.method === "usdt" ? `${withdrawal.taxa} USDT` : formatCurrency(withdrawal.taxa, locale)}
        </div>
      </div>
    </div>
  );

  const renderDesktopWithdrawal = (withdrawal: any) => (
    <tr key={withdrawal.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all duration-200">
      <td className="py-4 px-4 text-sm text-platform-text">{withdrawal.id.slice(0, 8)}...</td>
      <td className="py-4 px-4 text-sm text-platform-text">{formatDateExtended(withdrawal.dataPedido)}</td>
      <td className="py-4 px-4 text-sm text-platform-text">
        {withdrawal.dataPagamento ? formatDateExtended(withdrawal.dataPagamento) : "-"}
      </td>
      <td className="py-4 px-4 text-sm text-platform-text uppercase">
        {withdrawal.method === "usdt" ? "USDT" : t(`accountType.${withdrawal.accountType}`)}
      </td>
      <td className="py-4 px-4 text-sm text-platform-text">
        {withdrawal.method === "usdt" ? withdrawal.walletAddress : `****${withdrawal.accountNumber?.slice(-4)}`}
      </td>
      <td className="py-4 px-4 text-sm">
        <span
          className={`px-2 py-1 rounded-full text-xs capitalize transition-colors duration-200 ${
            withdrawal.status === "completed"
              ? "bg-platform-positive/10 text-platform-positive"
              : withdrawal.status === "pending"
                ? "bg-platform-demo/10 text-platform-demo"
                : "bg-platform-danger/10 text-platform-danger"
          }`}
        >
          {t(`status.${withdrawal.status}`)}
        </span>
      </td>
      <td className="py-4 px-4 text-sm text-platform-text">
        {withdrawal.method === "usdt" ? `${withdrawal.valor} USDT` : formatCurrency(withdrawal.valor, locale)}
      </td>
      <td className="py-4 px-4 text-sm text-platform-text">
        {withdrawal.method === "usdt" ? `${withdrawal.taxa} USDT` : formatCurrency(withdrawal.taxa, locale)}
      </td>
    </tr>
  );

  const handleMethodChange = (selectedMethod: string) => {
    setMethod(selectedMethod);
    setRoutingNumber("");
    setAccountNumber("");
    setAccountHolderName("");
    setBankAccountType("");
    setWalletAddress("");
    setWithdrawValue("");
    setWithdrawUSDT("");
  };

  return (
    <div className="w-full text-platform-text">
      <div className="bg-white/[0.03] rounded-2xl p-5 sm:p-6">
        {!isHistoryMode ? (
          loadingWithdraw ? (
            <AccountProcessingSkeleton blocks={method === "usdt" ? 2 : 3} />
          ) : (
          <>
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-12">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("withdrawalMethod")}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                      method === "bank_transfer"
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/8 hover:text-white/80"
                    }`}
                    onClick={() => handleMethodChange("bank_transfer")}
                  >
                    <Building2 size={24} className="mr-3" />
                    <span className="text-sm font-medium">{t("bankTransfer")}</span>
                  </button>
                  <button
                    className={`flex items-center p-4 rounded-xl transition-all duration-300 ${
                      method === "usdt"
                        ? "bg-white/10 text-white"
                        : "bg-white/[0.03] text-white/50 hover:bg-white/8 hover:text-white/80"
                    }`}
                    onClick={() => handleMethodChange("usdt")}
                  >
                    <Coins size={24} className="mr-3" />
                    <span className="text-sm font-medium">{t("cryptocurrencyPayment")}</span>
                  </button>
                </div>
              </div>
            </div>

            {method === "bank_transfer" ? (
              <>
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-12 md:col-span-6 relative" ref={bankAccountTypeRef}>
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("accountType")}</label>
                    <button
                      className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      onClick={() => setIsBankAccountTypeOpen(!isBankAccountTypeOpen)}
                    >
                      <span className={`text-sm ${bankAccountType ? "text-white" : "text-white/40"}`}>
                        {bankAccountTypeOptions.find((opt) => opt.id === bankAccountType)?.label || t("select")}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-white/40 transition-transform ${isBankAccountTypeOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isBankAccountTypeOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 shadow-2xl">
                        {bankAccountTypeOptions.map((option) => (
                          <button
                            key={option.id}
                            className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                              option.id === bankAccountType
                                ? "bg-white/10 text-white"
                                : "hover:bg-white/5 text-white/60 hover:text-white"
                            }`}
                            onClick={() => {
                              setBankAccountType(option.id);
                              setIsBankAccountTypeOpen(false);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("accountHolderName")}</label>
                    <input
                      type="text"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterAccountHolderName")}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("routingNumber")}</label>
                    <input
                      type="text"
                      value={routingNumber}
                      onChange={handleRoutingNumberChange}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterRoutingNumber")}
                      maxLength={9}
                    />
                    {routingNumber && !isValidRoutingNumber(routingNumber) && (
                      <p className="text-platform-danger text-xs mt-1">{t("invalidRoutingNumberDesc")}</p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("accountNumber")}</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={handleAccountNumberChange}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterAccountNumber")}
                      maxLength={17}
                    />
                    {accountNumber && !isValidAccountNumber(accountNumber) && (
                      <p className="text-platform-danger text-xs mt-1">{t("invalidAccountNumberDesc")}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4 mb-6">
                  <div className="col-span-12">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("withdrawalAmount")}</label>
                    <input
                      type="text"
                      value={withdrawValue}
                      onChange={(e) => setWithdrawValue(e.target.value)}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterAmount")}
                    />
                    <p className="text-xs text-platform-overlay-muted mt-2">
                      {t("minimum")}: {formatCurrency(MIN_WITHDRAW_VALUE, locale)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-4 mb-4">
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("usdtWalletAddress")}</label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterUSDTWalletAddress")}
                    />
                    {walletAddress && !isValidWalletAddress(walletAddress) && (
                      <p className="text-platform-danger text-xs mt-1">{t("invalidWalletAddressDesc")}</p>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-sm text-platform-overlay-muted mb-2">{t("withdrawalAmountUSDT")}</label>
                    <input
                      type="number"
                      value={withdrawUSDT}
                      onChange={(e) => setWithdrawUSDT(e.target.value)}
                      className="w-full bg-white/5 text-white rounded-xl py-3 px-4 appearance-none focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                      placeholder={t("enterAmountInUSDT")}
                    />
                    <p className="text-xs text-platform-overlay-muted mt-2">
                      {t("minimum")}: {MIN_WITHDRAW_USDT} USDT
                    </p>
                  </div>
                </div>
              </>
            )}

            <button
              className="w-full bg-white text-black py-3 rounded-xl transition-all duration-200 hover:bg-white/90 disabled:opacity-50"
              disabled={loadingWithdraw}
              onClick={handleWithdraw}
            >
              {t("requestWithdrawal")}
            </button>
          </>
          )
        ) : (
          isHistoryLoading ? (
            <AccountListSectionSkeleton items={4} />
          ) : (
          <>
            <h3 className="text-lg font-semibold text-platform-text mb-6">{t("withdrawalHistory")}</h3>
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
                    { id: "cancelled", label: t("status.cancelled") },
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
                  placeholder={t("startDate")}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label className="block text-sm text-platform-overlay-muted mb-2">{t("endDate")}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="account-native-field w-full appearance-none py-3 px-4"
                  placeholder={t("endDate")}
                />
              </div>
            </div>

            {!hasWithdrawals ? (
              <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
                  <Inbox size={24} className="text-platform-overlay-muted" />
                </div>
                <div className="mb-2 text-lg font-medium text-platform-text">{t("emptyTitle")}</div>
                <div className="text-sm text-platform-overlay-muted">{t("emptyDescription")}</div>
              </div>
            ) : (
              <>
                {!isMobile && (
                  <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-sm text-platform-overlay-muted">
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("id")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("requestDate")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("paymentDate")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("method")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("accountWallet")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("statusLabel")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("amount")}</th>
                          <th className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4">{t("fee")}</th>
                        </tr>
                      </thead>
                      <tbody>{withdraw.map(renderDesktopWithdrawal)}</tbody>
                    </table>
                  </div>
                )}

                {isMobile && <div className="space-y-3">{withdraw.map(renderMobileWithdrawal)}</div>}
              </>
            )}
          </>
          )
        )}
      </div>
    </div>
  );
}
