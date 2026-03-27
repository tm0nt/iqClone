"use client";

import { useRef, useEffect, useState } from "react";
import { Eye, EyeOff, X, Wallet, Shield, Banknote } from "lucide-react";
import { useAccountStore } from "@/store/account-store";
import { accountService } from "@/lib/services/account-service";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AccountDropdownSkeleton } from "@/components/account-loading-skeletons";

interface AccountDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleBalanceVisibility: () => void;
  isBalanceVisible: boolean;
  onSelectAccount: (type: "demo" | "real") => void;
  selectedAccount: "demo" | "real";
}

export default function AccountDropdown({
  isOpen,
  onClose,
  onToggleBalanceVisibility,
  isBalanceVisible,
  onSelectAccount,
  selectedAccount,
}: AccountDropdownProps) {
  const t = useTranslations("AccountDropdown");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { demoBalance, realBalance, setDemoBalance, setRealBalance, syncBalances } = useAccountStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isBalancesLoading, setIsBalancesLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        setIsBalancesLoading(true);
        const balances = await accountService.getBalances();
        setDemoBalance(balances.demoBalance);
        setRealBalance(balances.realBalance);
      } catch (error) {
        console.error("Error fetching balances:", error);
      } finally {
        setIsBalancesLoading(false);
      }
    };

    if (isOpen) {
      fetchBalances();
    }
  }, [isOpen, setDemoBalance, setRealBalance]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleReloadDemoAccount = async () => {
    try {
      await accountService.reloadDemoAccount();
      await syncBalances();
    } catch (error) {
      console.error("Error reloading demo account:", error);
    }
  };

  const formatCurrency = (value: number) => {
    if (isNaN(value)) {
      return "$0.00";
    }
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (!isClient) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-[12px] transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        ref={dropdownRef}
        className={`z-[121] overflow-hidden rounded-2xl bg-[#0b0b0f]/96 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          width: isMobile ? "calc(100% - 32px)" : "28rem",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "auto",
        }}
      >
        {/* Header */}
        <div className=" p-5">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium text-platform-text">{t("selectYourAccount")}</div>
            <button
              onClick={onToggleBalanceVisibility}
              className="p-1 rounded hover:bg-platform-overlay-hover/50 transition-colors"
              title={isBalanceVisible ? t("hideBalances") : t("showBalances")}
            >
              {isBalanceVisible ? (
                <Eye size={18} className="text-platform-overlay-muted hover:text-platform-text" />
              ) : (
                <EyeOff size={18} className="text-platform-overlay-muted hover:text-platform-text" />
              )}
            </button>
          </div>
        </div>

        {/* Account Options */}
        {isBalancesLoading ? (
          <AccountDropdownSkeleton />
        ) : (
        <div className="space-y-2 bg-transparent p-4">
          {/* Real Account */}
          <div
            className={`p-3 rounded-xl group cursor-pointer transition-all duration-300 ${
              selectedAccount === "real"
                ? "bg-platform-positive/10"
                : "bg-platform-overlay-card/20 hover:bg-platform-overlay-hover/30"
            }`}
            onClick={() => onSelectAccount("real")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                    selectedAccount === "real" ? "bg-platform-positive/20" : "bg-platform-overlay-border/50 group-hover:bg-platform-positive/10"
                  }`}
                >
                  <Wallet
                    size={18}
                    className={`${
                      selectedAccount === "real" ? "text-platform-positive" : "text-platform-overlay-muted group-hover:text-platform-positive"
                    } transition-colors`}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-platform-positive">{t("realAccount")}</div>
                  <div className="text-lg font-bold text-platform-text">
                    {isBalanceVisible ? formatCurrency(realBalance) : "••••••"}
                  </div>
                  <div className="text-xs text-platform-overlay-muted">{t("tradeWithRealMoney")}</div>
                </div>
              </div>
              <Link href="/account?section=deposit">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200" style={{ background: "#01db97", color: "#000000" }}>
                  <Banknote size={15} />
                  {t("deposit")}
                </button>
              </Link>
            </div>
          </div>

          {/* Demo Account */}
          <div
            className={`p-3 rounded-xl group cursor-pointer transition-all duration-300 ${
              selectedAccount === "demo"
                ? "bg-platform-demo/10"
                : "bg-platform-overlay-card/20 hover:bg-platform-overlay-hover/30"
            }`}
            onClick={() => onSelectAccount("demo")}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-colors ${
                    selectedAccount === "demo" ? "bg-platform-demo/20" : "bg-platform-overlay-border/50 group-hover:bg-platform-demo/10"
                  }`}
                >
                  <Shield
                    size={18}
                    className={`${
                      selectedAccount === "demo" ? "text-platform-demo" : "text-platform-overlay-muted group-hover:text-platform-demo"
                    } transition-colors`}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-platform-demo">{t("demoAccount")}</div>
                  <div className="text-lg font-bold text-platform-text">
                    {isBalanceVisible ? formatCurrency(demoBalance) : "••••••"}
                  </div>
                  <div className="text-xs text-platform-overlay-muted">{t("practiceWithVirtualMoney")}</div>
                </div>
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-platform-demo hover:bg-platform-demo-hover text-platform-text text-sm transition-colors shadow-lg hover:shadow-platform-demo/25"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReloadDemoAccount();
                }}
              >
                {t("reload")}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-platform-overlay-hover/50 transition-colors">
            <X size={16} className="text-platform-overlay-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}
