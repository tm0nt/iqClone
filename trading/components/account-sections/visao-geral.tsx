"use client";

import type React from "react";

import { useEffect, useState, useRef, useMemo } from "react";
import { Copy, Camera, ChevronDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { enUS, es as esLocale, ptBR } from "date-fns/locale";
import { useAccountStore } from "@/store/account-store";
import { useToast } from "@/components/ui/toast";
import { useTranslations, useLocale } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

function validateSSN(ssn: string): boolean {
  const strSSN = ssn.replace(/[^\d]/g, "");
  if (strSSN.length !== 9) return false;
  if (/^(\d)\1+$/.test(strSSN)) return false;
  return true;
}

const formatSSN = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3");
};

const formatPhone = (value: string) =>
  value
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d)/, "($1) $2")
    .replace(/(\d{3})(\d)/, "$1-$2")
    .substring(0, 14);

const formatDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 10);
};

const unmask = (value: string) => value.replace(/\D/g, "");

export default function OverviewSection() {
  const {
    realBalance,
    user,
    createdAt,
    name,
    cpf,
    email,
    documentNumber,
    birthdate,
    phone,
    nationality,
    documentType,
    profilePicture,
    kycStatus,
    updateUserInfo
  } = useAccountStore();

  // i18n
  const t = useTranslations("Account.Overview");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Map locale -> date-fns locale
  const dateFnsLocale = locale === "es" ? esLocale : locale === "pt" ? ptBR : enUS;

  const formattedDate =
    createdAt && !isNaN(Date.parse(createdAt))
      ? format(new Date(createdAt), "MMM, yyyy", { locale: dateFnsLocale })
      : "";

  const capitalizedDate = formattedDate ? formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1) : "";

  const [isNationalityOpen, setIsNationalityOpen] = useState(false);
  const [isDocumentTypeOpen, setIsDocumentTypeOpen] = useState(false);
  const [isCountryCodeOpen, setIsCountryCodeOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedLanguage, setSelectedLanguage] = useState(locale);

  const nationalityRef = useRef<HTMLDivElement>(null);
  const documentTypeRef = useRef<HTMLDivElement>(null);
  const countryCodeRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Inputs
  const [fullName, setFullName] = useState("");
  const [ssnInput, setSsnInput] = useState("");
  const [document, setDocument] = useState("");
  const [emailInput, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalityValue, setNationalityValue] = useState("");
  const [documentTypeValue, setDocumentTypeValue] = useState("ID");
  const [countryCode, setCountryCode] = useState("+1");

  const [errors, setErrors] = useState({
    name: "",
    ssn: "",
    phone: "",
    document: "",
    birthdate: ""
  });

  const missingAccountItems = useMemo(() => {
    const missing: string[] = [];

    if (!fullName.trim() || fullName.trim().split(" ").length < 2) {
      missing.push(t("form.nameLabel"));
    }
    if (!validateSSN(unmask(ssnInput))) {
      missing.push(t("form.ssnLabel"));
    }
    if (!document.trim()) {
      missing.push(t("form.documentNumberLabel"));
    }
    if (!birthDate) {
      missing.push(t("form.birthDateLabel"));
    }
    if (!phoneNumber.trim()) {
      missing.push(t("form.phoneLabel"));
    }
    if (!nationalityValue || nationalityValue === "select") {
      missing.push(t("form.nationalityLabel"));
    }
    if (!documentTypeValue) {
      missing.push(t("form.documentTypeLabel"));
    }
    if (kycStatus !== "APPROVED") {
      missing.push("KYC");
    }

    return missing;
  }, [
    birthDate,
    document,
    documentTypeValue,
    fullName,
    kycStatus,
    nationalityValue,
    phoneNumber,
    ssnInput,
    t,
  ]);

  // Opções (labels de i18n)
  const nationalityOptions = [
    { id: "select", label: t("options.nationalities.select") },
    { id: "usa", label: t("options.nationalities.usa") },
    { id: "canada", label: t("options.nationalities.canada") },
    { id: "uk", label: t("options.nationalities.uk") }
  ];

  const documentTypeOptions = [
    { id: "id", label: t("options.documentTypes.id") },
    { id: "license", label: t("options.documentTypes.license") },
    { id: "passport", label: t("options.documentTypes.passport") }
  ];

  // IDs "+1" duplicados mantidos conforme original
  const countryCodeOptions = [
    { id: "+1", label: t("options.countryCodes.us"), flag: "🇺🇸" },
    { id: "+1", label: t("options.countryCodes.ca"), flag: "🇨🇦" },
    { id: "+44", label: t("options.countryCodes.uk"), flag: "🇬🇧" }
  ];

  // Labels do seletor de idioma via i18n
  const languageOptions = [
    { id: "en", label: t("language.options.en"), flag: "🇺🇸" },
    { id: "es", label: t("language.options.es"), flag: "🇪🇸" },
    { id: "pt", label: t("language.options.pt"), flag: "🇧🇷" }
  ];

  useEffect(() => {
    // Sincroniza UI com o locale atual
    setSelectedLanguage(locale);
  }, [locale]);

  useEffect(() => {
    setFullName(name ?? "");
    setSsnInput(formatSSN(cpf ?? ""));
    setDocument(documentNumber ?? "");
    setBirthDate(birthdate ? new Date(birthdate).toISOString().split("T")[0] : "");
    setDateInput(birthdate ? format(new Date(birthdate), "dd/MM/yyyy", { locale: dateFnsLocale }) : "");
    setPhoneNumber(formatPhone(phone ?? ""));
    setNationalityValue(nationality ?? "");
    setDocumentTypeValue(documentType ?? "ID");
    setCountryCode("+1");
    setEmail(email ?? "");

    if (birthdate) {
      const date = new Date(birthdate);
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, cpf, documentNumber, birthdate, phone, nationality, documentType, email, dateFnsLocale]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target as Node)) {
        setIsNationalityOpen(false);
      }
      if (documentTypeRef.current && !documentTypeRef.current.contains(event.target as Node)) {
        setIsDocumentTypeOpen(false);
      }
      if (countryCodeRef.current && !countryCodeRef.current.contains(event.target as Node)) {
        setIsCountryCodeOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    // Listener omitido no original; adicione se desejar clique fora
    // document.addEventListener("click", handleClickOutside);
    // return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const copyIdToClipboard = (userId: string) => {
    navigator.clipboard.writeText(userId);
    toast.open({
      variant: "success",
      title: t("header.copySuccess"),
      duration: 5000
    });
  };

  const formatCurrency = (value: number) => {
    const safe = isNaN(value) ? 0 : value;
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safe);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.open({
        variant: "error",
        title: t("toasts.upload.invalidFormat.title"),
        description: t("toasts.upload.invalidFormat.description"),
        duration: 5000
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.open({
        variant: "error",
        title: t("toasts.upload.tooLarge.title"),
        description: t("toasts.upload.tooLarge.description"),
        duration: 5000
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/account/picture", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error updating photo");

      updateUserInfo({ profilePicture: data.url });
      toast.open({
        variant: "success",
        title: t("toasts.upload.success.title"),
        description: t("toasts.upload.success.description"),
        duration: 5000
      });
    } catch (error) {
      toast.open({
        variant: "error",
        title: t("toasts.upload.error.title"),
        description:
          error instanceof Error ? error.message : t("toasts.upload.error.description"),
        duration: 5000
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSelect = (value: string, setValue: (v: string) => void, setIsOpen: (v: boolean) => void) => {
    setValue(value);
    setIsOpen(false);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDate(value);
    setDateInput(formatted);

    try {
      const parsedDate = parse(formatted, "dd/MM/yyyy", new Date());
      if (!isNaN(parsedDate.getTime())) {
        setBirthDate(parsedDate.toISOString().split("T")[0]);
        setErrors((prev) => ({ ...prev, birthdate: "" }));
        setSelectedMonth(parsedDate.getMonth());
        setSelectedYear(parsedDate.getFullYear());
      } else {
        setErrors((prev) => ({ ...prev, birthdate: t("errors.dateInvalid") }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, birthdate: t("errors.dateInvalid") }));
    }
  };

  const handleDateSelect = (date: string) => {
    const parsedDate = new Date(date);
    setBirthDate(date);
    setDateInput(format(parsedDate, "dd/MM/yyyy", { locale: dateFnsLocale }));
    setSelectedMonth(parsedDate.getMonth());
    setSelectedYear(parsedDate.getFullYear());
    setIsDatePickerOpen(false);
    setErrors((prev) => ({ ...prev, birthdate: "" }));
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    setSelectedMonth((prev) => {
      let newMonth = direction === "prev" ? prev - 1 : prev + 1;
      let newYear = selectedYear;

      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }

      setSelectedYear(newYear);
      return newMonth;
    });
  };

  const generateCalendarDays = () => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const firstDayOfWeek = startDate.getDay();
    const placeholders = Array(firstDayOfWeek).fill(null);
    return [...placeholders, ...days];
  };

  const handleSubmit = async () => {
    const nameValid = fullName.trim().split(" ").length >= 2;
    const ssnValid = validateSSN(unmask(ssnInput));
    const phoneValid = unmask(phoneNumber).length >= 10;
    const documentValid = document.length >= 5;
    const birthdateValid = birthDate && !isNaN(new Date(birthDate).getTime());

    setErrors({
      name: nameValid ? "" : t("errors.name"),
      ssn: ssnValid ? "" : t("errors.ssn"),
      phone: phoneValid ? "" : t("errors.phone"),
      document: documentValid ? "" : t("errors.document"),
      birthdate: birthdateValid ? "" : t("errors.birthdate")
    });

    if (!nameValid || !ssnValid || !phoneValid || !documentValid || !birthdateValid) return;

    try {
      const res = await fetch("/api/account/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          ssn: unmask(ssnInput),
          email: emailInput,
          documentNumber: document.trim(),
          birthDate: birthDate,
          phone: unmask(phoneNumber),
          nationality: nationalityValue,
          documentType: documentTypeValue,
          countryCode
        })
      });

      if (!res.ok) throw new Error("Error updating data");

      updateUserInfo({
        name: fullName.trim(),
        cpf: unmask(ssnInput),
        documentNumber: document.trim(),
        birthdate: birthDate,
        phone: unmask(phoneNumber),
        nationality: nationalityValue,
        documentType: documentTypeValue
      });

      toast.open({
        variant: "success",
        title: t("toasts.update.success.title"),
        duration: 5000
      });
    } catch (error) {
      toast.open({
        variant: "error",
        title: t("toasts.update.error.title"),
        duration: 5000
      });
    }
  };

  // Troca de idioma preservando pathname atual
  const switchLocale = (newLocale: string) => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
      router.refresh();
    }
    setSelectedLanguage(newLocale);
    setIsLanguageOpen(false);
  };

  // Weekdays localizados
  const weekdays = [
    t("form.weekdaysShort.sun"),
    t("form.weekdaysShort.mon"),
    t("form.weekdaysShort.tue"),
    t("form.weekdaysShort.wed"),
    t("form.weekdaysShort.thu"),
    t("form.weekdaysShort.fri"),
    t("form.weekdaysShort.sat")
  ];

  return (
    <div className="w-full text-platform-text">

      {/* ── Profile card ── */}
      <div className="bg-white/[0.03] rounded-2xl p-6 mb-6">

        {/* Row 1: avatar + meta | language */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl bg-white/[0.06] flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img
                    src={`${profilePicture}?t=${Date.now()}`}
                    alt={t("header.profilePictureAlt")}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "";
                      target.className = "hidden";
                    }}
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <button
                className="absolute -bottom-1 -right-1 bg-platform-success rounded-full p-1 hover:bg-platform-positive transition-colors"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Skeleton className="h-2.5 w-2.5 rounded-full bg-white/70" />
                ) : (
                  <Camera size={10} className="text-white" />
                )}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{name || "—"}</div>
              <div className="text-xs text-white/40 mt-0.5">{t("header.memberSinceLabel")} {capitalizedDate}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-white/25 font-mono truncate max-w-[180px]">{user}</span>
                <button
                  className="p-0.5 hover:bg-white/5 rounded transition-colors"
                  onClick={user ? () => copyIdToClipboard(user) : undefined}
                >
                  <Copy size={10} className="text-white/25" />
                </button>
              </div>
            </div>
          </div>

          {/* Language selector */}
          <div className="relative" ref={languageRef}>
            <button
              className="flex items-center gap-2 py-2 px-3 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10 min-w-[130px]"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <span>{languageOptions.find((opt) => opt.id === selectedLanguage)?.flag}</span>
              <span className="text-sm flex-1 text-left">{languageOptions.find((opt) => opt.id === selectedLanguage)?.label}</span>
              <ChevronDown size={14} className={`text-white/40 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
            </button>
            {isLanguageOpen && (
              <div className="absolute top-full right-0 mt-2 bg-black rounded-xl overflow-hidden z-50 shadow-2xl min-w-[130px]">
                {languageOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 flex items-center gap-2 ${
                      option.id === selectedLanguage ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => switchLocale(option.id)}
                  >
                    <span>{option.flag}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
          <div className="bg-white/[0.04] rounded-xl px-5 py-4">
            <div className="text-xs text-white/40 mb-0.5">{t("balance.label")}</div>
            <div className="text-xl font-bold text-white">{formatCurrency(realBalance)}</div>
          </div>

          <div className={`rounded-xl px-4 py-4 ${
            missingAccountItems.length === 0
              ? "bg-platform-positive/[0.07]"
              : "bg-platform-warning/[0.07]"
          }`}>
            <div className={`text-xs font-semibold mb-0.5 ${missingAccountItems.length === 0 ? "text-platform-positive" : "text-platform-warning"}`}>
              {missingAccountItems.length === 0 ? "Conta validada" : "Pendências"}
            </div>
            <div className="text-xs leading-relaxed text-white/40">
              {missingAccountItems.length === 0
                ? "Perfil completo e pronto para uso."
                : missingAccountItems.slice(0, 4).join(", ") + (missingAccountItems.length > 4 ? ` +${missingAccountItems.length - 4}` : "")}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] rounded-2xl p-5 sm:p-6">
        <h3 className="text-lg font-semibold mb-6">{t("section.personalInfo")}</h3>

        {/* Full Name | Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.nameLabel")}</label>
            <input
              type="text"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
              placeholder={t("form.namePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            {errors.name && <p className="text-platform-danger text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.emailLabel")}</label>
            <input
              type="email"
              className="w-full bg-white/[0.03] rounded-xl py-3 px-4 text-platform-text opacity-50 cursor-not-allowed"
              value={emailInput}
              readOnly
            />
          </div>
        </div>

        {/* Nationality | Birth Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative" ref={nationalityRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.nationalityLabel")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsNationalityOpen(!isNationalityOpen)}
            >
              <span className={`text-sm ${nationalityValue ? "text-white" : "text-white/40"}`}>
                {nationalityOptions.find((opt) => opt.id === nationalityValue)?.label || t("form.nationalitySelect")}
              </span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isNationalityOpen ? "rotate-180" : ""}`} />
            </button>
            {isNationalityOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black rounded-xl overflow-hidden z-50 shadow-2xl">
                {nationalityOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      option.id === nationalityValue ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setNationalityValue, setIsNationalityOpen)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={datePickerRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.birthDateLabel")}</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                placeholder={t("form.birthDatePlaceholder")}
                value={dateInput}
                onChange={handleDateInputChange}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
                <Calendar size={16} className="text-platform-overlay-muted" />
              </button>
            </div>
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black rounded-xl overflow-hidden z-50 p-4 w-[280px] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => handleMonthChange("prev")} className="p-1 hover:bg-white/5 rounded-full">
                    <ChevronLeft size={16} className="text-platform-overlay-muted" />
                  </button>
                  <span className="text-sm text-platform-text">
                    {format(new Date(selectedYear, selectedMonth), "MMMM yyyy", { locale: dateFnsLocale })}
                  </span>
                  <button onClick={() => handleMonthChange("next")} className="p-1 hover:bg-white/5 rounded-full">
                    <ChevronRight size={16} className="text-platform-overlay-muted" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {weekdays.map((day) => (
                    <div key={day} className="text-platform-overlay-muted text-xs">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => (
                    <button
                      key={index}
                      className={`p-2 text-sm transition-colors duration-200 ${
                        day
                          ? new Date(birthDate).toDateString() === day.toDateString()
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                          : "text-transparent"
                      }`}
                      onClick={() => day && handleDateSelect(day.toISOString().split("T")[0])}
                      disabled={!day}
                    >
                      {day ? format(day, "d") : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {errors.birthdate && <p className="text-platform-danger text-xs mt-1">{errors.birthdate}</p>}
          </div>
        </div>

        {/* SSN | Document Type | Document Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.ssnLabel")}</label>
            <input
              type="text"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
              placeholder={t("form.ssnPlaceholder")}
              value={ssnInput}
              onChange={(e) => setSsnInput(formatSSN(e.target.value))}
            />
            {errors.ssn && <p className="text-platform-danger text-xs mt-1">{errors.ssn}</p>}
          </div>

          <div className="relative" ref={documentTypeRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.documentTypeLabel")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsDocumentTypeOpen(!isDocumentTypeOpen)}
            >
              <span className={`text-sm ${documentTypeValue ? "text-white" : "text-white/40"}`}>
                {documentTypeOptions.find((opt) => opt.id === documentTypeValue)?.label || t("form.documentTypeSelect")}
              </span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isDocumentTypeOpen ? "rotate-180" : ""}`} />
            </button>
            {isDocumentTypeOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black rounded-xl overflow-hidden z-50 shadow-2xl">
                {documentTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      option.id === documentTypeValue ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setDocumentTypeValue, setIsDocumentTypeOpen)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.documentNumberLabel")}</label>
            <input
              type="text"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
              placeholder={t("form.documentNumberPlaceholder")}
              value={document}
              onChange={(e) => setDocument(e.target.value)}
            />
            {errors.document && <p className="text-platform-danger text-xs mt-1">{errors.document}</p>}
          </div>
        </div>

        {/* Country Code | Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative" ref={countryCodeRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.countryCodeLabel")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsCountryCodeOpen(!isCountryCodeOpen)}
            >
              <div className="flex items-center">
                <span className="mr-2">{countryCodeOptions.find((opt) => opt.id === countryCode)?.flag}</span>
                <span className={`text-sm ${countryCode ? "text-white" : "text-white/40"}`}>
                  {countryCodeOptions.find((opt) => opt.id === countryCode)?.label || t("form.countryCodeSelect")}
                </span>
              </div>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isCountryCodeOpen ? "rotate-180" : ""}`} />
            </button>
            {isCountryCodeOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black rounded-xl overflow-hidden z-50 shadow-2xl">
                {countryCodeOptions.map((option) => (
                  <button
                    key={option.id + option.label}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 flex items-center ${
                      option.id === countryCode ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setCountryCode, setIsCountryCodeOpen)}
                  >
                    <span className="mr-3">{option.flag}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("form.phoneLabel")}</label>
            <input
              type="tel"
              className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
              placeholder={t("form.phonePlaceholder")}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
            />
            {errors.phone && <p className="text-platform-danger text-xs mt-1">{errors.phone}</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-white text-black py-3 rounded-xl transition-all duration-200 hover:bg-white/90"
        >
          {t("buttons.save")}
        </button>
      </div>
    </div>
  );
}
