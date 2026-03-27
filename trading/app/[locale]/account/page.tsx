"use client"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header";
import AccountSidebar from "@/components/account-sidebar";
import AccountMobileSelector from "@/components/account-mobile-selector";
import {
  normalizeAccountSection,
  type AccountSection,
} from "@/components/account-navigation";
import VisaoGeralSection from "@/components/account-sections/visao-geral";
import HistoricoSection from "@/components/account-sections/historico";
import DepositarSection from "@/components/account-sections/depositar";
import SacarSection from "@/components/account-sections/sacar";
import KYC from "@/components/account-sections/kyc";
import SegurancaSection from "@/components/account-sections/seguranca";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ToastContainer } from "@/components/ui/toast";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section");
  const [activeSection, setActiveSection] = useState<AccountSection>("overview");
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    setActiveSection(normalizeAccountSection(sectionParam));
  }, [sectionParam]);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <VisaoGeralSection />;
      case "overview-history":
        return <HistoricoSection />;
      case "deposit":
        return <DepositarSection mode="deposit" />;
      case "deposit-history":
        return <DepositarSection mode="history" />;
      case "withdraw":
        return <SacarSection mode="withdraw" />;
      case "withdraw-history":
        return <SacarSection mode="history" />;
      case "overview-security":
        return <SegurancaSection />;
      case "kyc":
        return <KYC />;
      default:
        return <VisaoGeralSection />;
    }
  };

  const handleSectionChange = (section: string) => {
    const nextSection = normalizeAccountSection(section);
    setActiveSection(nextSection);
    const url = new URL(window.location.href);
    url.searchParams.set("section", nextSection);
    window.history.pushState({}, "", url);
  };

  return (
    <ToastContainer>
      <main className="flex flex-col min-h-screen bg-[#0000] text-white">
        <Header
          cryptos={[]}
          selectedCrypto={undefined}
          currentPrice={0}
          onSelect={() => {}}
          onToggleFavorite={() => {}}
          onUpdateCryptos={() => {}}
        />

        <div className="flex flex-1">
          {!isMobile && (
            <aside className="w-64 flex-shrink-0 border-r border-white/[0.05] px-4 py-8 min-h-full">
              <AccountSidebar
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </aside>
          )}

          <div className="flex-1 min-w-0 overflow-auto">
            <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-4 sm:px-6 sm:pt-6 lg:px-8">
              {isMobile && (
                <AccountMobileSelector
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              )}
              {renderSection()}
            </div>
          </div>
        </div>
      </main>
    </ToastContainer>
  );
}
