"use client";

import { useRef, useEffect, useState } from "react";
import {
  User,
  History,
  Wallet,
  CreditCard,
  LogOut,
  ChevronRight,
  Shield,
  X,
  BadgeIcon as IdCard,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { useAccountStore } from "@/store/account-store";
import { useLocale, useTranslations } from "next-intl";
import { logoutUser } from "@/lib/auth/auth-service";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

export default function ProfileDropdown({ isOpen, onClose, isMobile = false }: ProfileDropdownProps) {
  const t = useTranslations("ProfileDropdown");
  const locale = useLocale();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { realBalance, user, name, profilePicture } = useAccountStore();
  const toast = useToast();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const copyIdToClipboard = () => {
    if (!user) return;
    navigator.clipboard.writeText(user).then(() => {
      toast.open({
        variant: "success",
        title: t("copiedSuccess"),
        description: t("idCopied"),
        duration: 3000,
      });
    });
  };

  const navigateToSection = (section: string) => {
    router.push(`/account?section=${section}`);
    onClose();
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
        className={`relative z-[121] overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0f]/96 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          width: isMobile ? "calc(100% - 32px)" : "30rem",
          maxHeight: isMobile ? "calc(100vh - 32px)" : "auto",
        }}
      >
        {/* Header */}
        <div className="p-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-platform-overlay-hover/50 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-platform-overlay-muted hover:text-platform-text" />
          </button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-platform-overlay-hover/50 flex items-center justify-center overflow-hidden">
              {profilePicture ? (
                <img
                  src={profilePicture || "/placeholder.svg"}
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-platform-muted" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <div className="text-lg font-medium text-platform-text capitalize">{name?.split(" ").slice(0, 2).join(" ")}</div>
              <div className="flex items-center mt-1">
                <div className="text-xs text-platform-overlay-muted">ID: {user}</div>
                <button
                  onClick={copyIdToClipboard}
                  className="ml-2 p-1 hover:bg-platform-overlay-hover/50 rounded transition-colors"
                >
                  <Copy size={12} className="text-platform-overlay-muted" />
                </button>
              </div>
            </div>
          </div>

          <div className="platform-surface-panel rounded-xl p-3 flex justify-between items-center">
            <div>
              <div
                className="text-xs"
                style={{ color: "var(--platform-surface-muted-foreground-color)" }}
              >
                {t("availableBalance")}
              </div>
              <div
                className="text-lg font-bold"
                style={{ color: "var(--platform-success-color)" }}
              >
                {formatCurrency(realBalance || 0)}
              </div>
            </div>
            <div
              className="p-2 rounded-full"
              style={{
                background:
                  "color-mix(in srgb, var(--platform-success-color) 14%, transparent)",
              }}
            >
              <Wallet
                size={18}
                style={{ color: "var(--platform-success-color)" }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-2 bg-transparent p-4">
          {[
            { icon: User, label: t("myAccount"), section: "overview" },
            { icon: History, label: t("history"), section: "overview-history" },
            { icon: Wallet, label: t("deposit"), section: "deposit" },
            { icon: CreditCard, label: t("withdraw"), section: "withdraw" },
            { icon: Shield, label: t("security"), section: "overview-security" },
            { icon: IdCard, label: t("kyc"), section: "kyc" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigateToSection(item.section)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-platform-overlay-hover/50 transition-colors group"
            >
              <div className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-platform-primary/20 flex items-center justify-center mr-3 transition-colors">
                  <item.icon
                    className="text-white group-hover:scale-110 transition-transform"
                    size={18}
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-platform-overlay-muted group-hover:text-platform-muted transition-colors" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4">
          <button
            onClick={async () => {
              try {
                await logoutUser(`/${locale}/auth`);
              } catch (error) {
                console.error("Error during logout:", error);
                window.location.href = `/${locale}/auth`;
              }
            }}
            className="w-full flex items-center p-3 rounded-xl hover:bg-platform-overlay-hover/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-platform-danger/10 flex items-center justify-center mr-3">
              <LogOut className="text-platform-negative group-hover:scale-110 transition-transform" size={18} strokeWidth={1.5} />
            </div>
            <span className="text-sm font-medium text-platform-negative">{t("signOut")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
