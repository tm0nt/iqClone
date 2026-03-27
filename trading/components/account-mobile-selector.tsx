"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  buildAccountNavigation,
  getAccountGroupId,
  type AccountSection,
} from "@/components/account-navigation";

interface AccountMobileSelectorProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function AccountMobileSelector({
  activeSection,
  onSectionChange,
}: AccountMobileSelectorProps) {
  const t = useTranslations("AccountMobileSelector");
  const navigation = buildAccountNavigation(t);
  const [activeGroupId, setActiveGroupId] = useState(
    getAccountGroupId(activeSection as AccountSection),
  );

  useEffect(() => {
    setActiveGroupId(getAccountGroupId(activeSection as AccountSection));
  }, [activeSection]);

  const activeGroup =
    navigation.find((group) => group.id === activeGroupId) ?? navigation[0];

  return (
    <div className="mb-6 space-y-3">
      <nav
        aria-label={t("account")}
        className="flex gap-2 overflow-x-auto rounded-2xl  bg-white/[0.02] p-2 scrollbar-none"
      >
        {navigation.map((group) => {
          const groupIsActive = group.id === activeGroupId;

          return (
            <button
              key={group.id}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-3 text-left transition-all duration-200 ${
                groupIsActive
                  ? "bg-white text-black"
                  : "bg-transparent text-white/68 hover:bg-white/[0.06] hover:text-white"
              }`}
              onClick={() => {
                setActiveGroupId(group.id);
                if (!group.sections.includes(activeSection as AccountSection)) {
                  onSectionChange(group.defaultSection);
                }
              }}
            >
              <group.icon
                size={17}
                className={groupIsActive ? "text-black" : "text-white/55"}
              />
                <span className="text-sm font-medium whitespace-nowrap">
                  {group.label}
                </span>
              </button>
          );
        })}
      </nav>

      {activeGroup.items.length > 1 && (
        <nav
          aria-label={activeGroup.label}
          className="flex gap-2 overflow-x-auto rounded-2xl  p-2 scrollbar-none"
        >
          {activeGroup.items.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                className={`shrink-0 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-black"
                    : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white"
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
