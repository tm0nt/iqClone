import {
  CreditCard,
  IdCard,
  type LucideIcon,
  User,
  Wallet,
} from "lucide-react";

export type AccountSection =
  | "overview"
  | "overview-history"
  | "overview-security"
  | "deposit"
  | "deposit-history"
  | "withdraw"
  | "withdraw-history"
  | "kyc";

export type AccountNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  defaultSection: AccountSection;
  sections: AccountSection[];
  items: Array<{
    id: AccountSection;
    label: string;
  }>;
};

const LEGACY_SECTION_MAP: Record<string, AccountSection> = {
  history: "overview-history",
  security: "overview-security",
};

const VALID_SECTIONS = new Set<AccountSection>([
  "overview",
  "overview-history",
  "overview-security",
  "deposit",
  "deposit-history",
  "withdraw",
  "withdraw-history",
  "kyc",
]);

export function normalizeAccountSection(
  value: string | null | undefined,
): AccountSection {
  if (!value) {
    return "overview";
  }

  if (VALID_SECTIONS.has(value as AccountSection)) {
    return value as AccountSection;
  }

  return LEGACY_SECTION_MAP[value] ?? "overview";
}

export function getAccountGroupId(section: AccountSection): string {
  if (section.startsWith("overview")) {
    return "overview";
  }

  if (section.startsWith("deposit")) {
    return "deposit";
  }

  if (section.startsWith("withdraw")) {
    return "withdraw";
  }

  return "kyc";
}

export function buildAccountNavigation(
  t: (key: string) => string,
): AccountNavGroup[] {
  return [
    {
      id: "overview",
      label: t("account"),
      icon: User,
      defaultSection: "overview",
      sections: ["overview", "overview-history", "overview-security"],
      items: [
        { id: "overview", label: t("personalData") },
        { id: "overview-history", label: t("tradingHistory") },
        { id: "overview-security", label: t("accountSecurity") },
      ],
    },
    {
      id: "deposit",
      label: t("deposits"),
      icon: Wallet,
      defaultSection: "deposit",
      sections: ["deposit", "deposit-history"],
      items: [
        { id: "deposit", label: t("newDeposit") },
        { id: "deposit-history", label: t("depositHistory") },
      ],
    },
    {
      id: "withdraw",
      label: t("withdrawals"),
      icon: CreditCard,
      defaultSection: "withdraw",
      sections: ["withdraw", "withdraw-history"],
      items: [
        { id: "withdraw", label: t("newWithdrawal") },
        { id: "withdraw-history", label: t("withdrawalHistory") },
      ],
    },
    {
      id: "kyc",
      label: t("verification"),
      icon: IdCard,
      defaultSection: "kyc",
      sections: ["kyc"],
      items: [{ id: "kyc", label: t("verification") }],
    },
  ];
}
