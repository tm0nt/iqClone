"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, ArrowLeft, Plus, Grid3X3, Banknote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl"; // Import useLocale and useTranslations
import ProfileDropdown from "./profile-dropdown";
import AccountDropdown from "./account-dropdown";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAccountStore } from "@/store/account-store";
import { CryptoSelector } from "./crypto-selector";
import { Crypto } from "@/lib/forex-data";
import { Logo } from "@/components/logo";

interface HeaderProps {
  cryptos: Crypto[];
  selectedCrypto: Crypto | undefined;
  currentPrice: number;
  onSelect: (crypto: Crypto, addOnly: boolean) => void;
  onToggleFavorite: (crypto: Crypto) => void;
  onUpdateCryptos: (updatedCryptos: Crypto[]) => void;
  openCharts?: string[];
  currentChart?: string;
  onChangeChart?: (symbol: string) => void;
  onRemoveChart?: (symbol: string) => void;
  onOpenAssetsPanel?: () => void;
}

export default function Header({
  cryptos,
  selectedCrypto,
  currentPrice,
  onSelect,
  onToggleFavorite,
  onUpdateCryptos,
  openCharts,
  currentChart,
  onChangeChart,
  onRemoveChart,
  onOpenAssetsPanel,
}: HeaderProps) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const locale = useLocale(); // Get current locale dynamically

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const accountTriggerRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLDivElement>(null);

  const { demoBalance, realBalance, selectedAccount, setSelectedAccount, syncBalances, profilePicture } =
    useAccountStore();

  useEffect(() => {
    syncBalances();
    const savedBalanceVisibility = localStorage.getItem("balanceVisibility");
    if (savedBalanceVisibility !== null) {
      setIsBalanceVisible(savedBalanceVisibility === "true");
    }
  }, [syncBalances]);

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

  const toggleProfileDropdown = () => {
    if (profileTriggerRef.current) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    }
    if (isAccountDropdownOpen) setIsAccountDropdownOpen(false);
  };

  const toggleAccountDropdown = () => {
    if (accountTriggerRef.current) {
      setIsAccountDropdownOpen(!isAccountDropdownOpen);
    }
    if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  const closeAccountDropdown = () => {
    setIsAccountDropdownOpen(false);
  };

  const toggleBalanceVisibility = () => {
    const newVisibility = !isBalanceVisible;
    setIsBalanceVisible(newVisibility);
    localStorage.setItem("balanceVisibility", newVisibility.toString());
  };

  const handleSelectAccount = (type: "demo" | "real") => {
    setSelectedAccount(type);
    closeAccountDropdown();
  };

  const getBalance = () => {
    return selectedAccount === "demo" ? demoBalance : realBalance;
  };

  // Dynamic check with locale
  const isAccountPage = pathname === `/${locale}/account`;

  return (
    <header className="platform-header border-b border-platform-surface-alt px-4 py-2 h-20">
      <div className="flex items-center justify-between h-full">
        {/* Left Section - Logo and Trading Pair */}
        <div className="flex items-center space-x-4">
          {/* SHARK Logo */}
          <div className="flex items-center space-x-2">
            <Logo width={150} variant="light" />
          </div>
          {!isAccountPage && (
            <div className="hidden md:flex">
              {/* Crypto Selector */}
              <CryptoSelector
                cryptos={cryptos}
                selectedCrypto={selectedCrypto}
                currentPrice={currentPrice}
                onSelect={onSelect}
                onToggleFavorite={onToggleFavorite}
                onUpdateCryptos={onUpdateCryptos}
                openCharts={openCharts}
                currentChart={currentChart}
                onChangeChart={onChangeChart}
                onRemoveChart={onRemoveChart}
                assetBrowserMode="sidebar"
                onOpenAssetBrowser={onOpenAssetsPanel}
              />
            </div>
          )}
          {/* Back arrow when in account page — hard navigation to avoid chart re-init freeze */}
          {isAccountPage && (
            <button
              onClick={() => { window.location.href = `/${locale}/trading`; }}
              className="ml-4 flex items-center rounded-xl bg-white px-3.5 py-2 text-black transition-colors hover:bg-white/90"
            >
              <ArrowLeft size={16} className="mr-2" />
              <span className="font-medium text-sm">{t("traderoom")}</span>
            </button>
          )}
        </div>

        {/* Right Section - Profile | Money | Deposit */}
        <div className="flex items-center space-x-4">
          {/* Profile */}
          <div
            ref={profileTriggerRef}
            className="w-10 h-10 bg-platform-overlay-card rounded-full flex items-center justify-center cursor-pointer overflow-hidden hover:bg-platform-overlay-muted transition-colors"
            onClick={toggleProfileDropdown}
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "";
                  target.className = "hidden";
                }}
              />
            ) : (
              <User size={20} className="text-white" />
            )}
          </div>

          {/* Money/Balance */}
          <div
            ref={accountTriggerRef}
            className="cursor-pointer flex items-center space-x-1 hover:bg-platform-surface-alt rounded px-2 py-1 transition-colors"
            onClick={toggleAccountDropdown}
          >
            <span
              className={`font-bold text-lg ${
                selectedAccount === "real" ? "text-platform-positive" : "text-platform-demo"
              }`}
            >
              {isBalanceVisible ? formatCurrency(getBalance()) : t("balanceHidden")}
            </span>
            <ChevronDown size={14} className="text-platform-overlay-muted" />
          </div>

          {/* Deposit Button */}
          {!isAccountPage && (
            <Link
              href="/account?section=deposit"
              className="border border-platform-positive text-platform-positive bg-transparent px-4 py-2 rounded font-medium transition-all duration-200 flex items-center space-x-2 hover:bg-platform-positive hover:text-black active:bg-platform-positive active:text-black"
            >
              {isMobile ? (
                <Banknote size={20} />
              ) : (
                <>
                  <Banknote size={16} />
                  <span>{t("deposit")}</span>
                </>
              )}
            </Link>
          )}
        </div>

        {/* Dropdowns */}
        <AccountDropdown
          isOpen={isAccountDropdownOpen}
          onClose={closeAccountDropdown}
          onToggleBalanceVisibility={toggleBalanceVisibility}
          isBalanceVisible={isBalanceVisible}
          onSelectAccount={handleSelectAccount}
          selectedAccount={selectedAccount}
        />

        <ProfileDropdown isOpen={isProfileDropdownOpen} onClose={closeProfileDropdown} isMobile={isMobile} />
      </div>
    </header>
  );
}
