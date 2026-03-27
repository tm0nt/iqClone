"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function AuthFooter() {
  const t = useTranslations("Auth.Footer");
  const year = new Date().getFullYear();
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale(); // Get current locale from next-intl
  const [selectedLocale, setSelectedLocale] = useState(currentLocale); // Initialize with current locale from URL

  // Update selectedLocale if the locale changes (e.g., via navigation)
  useEffect(() => {
    setSelectedLocale(currentLocale);
  }, [currentLocale]);

  const locales = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "pt", name: "Português (BR)", flag: "🇧🇷" },
  ];

  const changeLocale = (newLocale: string) => {
    setSelectedLocale(newLocale);
    // Update the URL with the new locale (e.g., /en/path -> /es/path)
    const newPath = pathname.replace(/^\/[a-z]{2}/, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <motion.div
      className="mt-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="text-xs text-platform-input-label">
        <a
          href="#"
          className="text-black transition-colors duration-300 hover:underline"
        >
          {t("terms")}
        </a>
        {" · "}
        <a
          href="#"
          className="text-black transition-colors duration-300 hover:underline"
        >
          {t("privacy")}
        </a>
        {" · "}
        <a
          href="#"
          className="text-black transition-colors duration-300 hover:underline"
        >
          {t("support")}
        </a>
      </div>

      <div className="mt-2 text-xs text-platform-input-subtle">
        {`© ${year} ${t("copyrightSuffix")}`}
      </div>

      {/* Language Selector - Only flags, with selected one clearer (full opacity) */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {locales.map((locale) => (
          <span
            key={locale.code}
            className={`text-2xl cursor-pointer transition-opacity ${
              selectedLocale === locale.code ? "opacity-100" : "opacity-50"
            }`}
            onClick={() => changeLocale(locale.code)}
            title={locale.name}
          >
            {locale.flag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
