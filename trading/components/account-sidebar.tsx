"use client";

import { useTranslations } from "next-intl";
import {
  buildAccountNavigation,
  type AccountSection,
} from "@/components/account-navigation";

interface AccountSidebarProps {
  activeSection: string;
  onSectionChange?: (section: string) => void;
}

export default function AccountSidebar({
  activeSection,
  onSectionChange,
}: AccountSidebarProps) {
  const t = useTranslations("AccountMobileSelector");
  const navigation = buildAccountNavigation(t);

  return (
    <nav className="flex w-full flex-col gap-3">
      {navigation.map((group) => {
        const groupIsActive = group.sections.includes(activeSection as AccountSection);
        const isStandalone = group.items.length === 1;

        return (
          <div
            key={group.id}
            className={`rounded-2xl border p-2 transition-all duration-200 ${
              groupIsActive
                ? "border-white/12 bg-white/[0.045]"
                : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            <button
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                groupIsActive ? "text-white" : "text-white/75 hover:text-white"
              }`}
              onClick={() => onSectionChange?.(group.defaultSection)}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  groupIsActive ? "bg-white/10" : "bg-white/[0.05]"
                }`}
              >
                <group.icon
                  size={18}
                  className={groupIsActive ? "text-white" : "text-white/55"}
                />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{group.label}</div>
              </div>
            </button>

            {!isStandalone && (
              <div className="mt-1 space-y-1 border-t border-white/[0.06] px-1 pt-2">
                {group.items.map((item) => {
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white text-black"
                          : "text-white/65 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      onClick={() => onSectionChange?.(item.id)}
                    >
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-black/70" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
