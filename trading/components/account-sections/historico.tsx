"use client";

import type React from "react";

import { useState, useEffect, useRef, useMemo } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ChevronDown, BarChart2, Target, DollarSign, Download, Calendar, ChevronLeft, ChevronRight, Inbox, Settings2 } from "lucide-react";
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { enUS, es as esLocale, ptBR } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { AccountTableSectionSkeleton } from "@/components/account-loading-skeletons";

type Operation = {
  id: string;
  data: string;
  ativo: string;
  tempo: string;
  previsao: string;
  vela: string;
  abertura: string;
  tipo: string;
  fechamento: string;
  valor: string;
  receita: string;
  estornado: string;
  executado: string;
  status: string;
  resultado: string;
};

type HistoryColumnId =
  | "id"
  | "date"
  | "asset"
  | "type"
  | "openPrice"
  | "closePrice"
  | "revenue"
  | "value"
  | "prediction"
  | "result";

export default function HistorySection() {
  const t = useTranslations("History");
  const locale = useLocale();

  const dateFnsLocale = locale === "es" ? esLocale : locale === "pt" ? ptBR : enUS;

  const [operations, setOperations] = useState<Operation[]>([]);
  const [allOperations, setAllOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All operations");
  const [selectedPrediction, setSelectedPrediction] = useState("All predictions");
  const [selectedAsset, setSelectedAsset] = useState("All assets");
  const [selectedStatus, setSelectedStatus] = useState("All statuses");
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateToInput, setDateToInput] = useState("");
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);
  const [isAssetOpen, setIsAssetOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateFromOpen, setIsDateFromOpen] = useState(false);
  const [isDateToOpen, setIsDateToOpen] = useState(false);
  const [selectedFromMonth, setSelectedFromMonth] = useState(new Date().getMonth());
  const [selectedFromYear, setSelectedFromYear] = useState(new Date().getFullYear());
  const [selectedToMonth, setSelectedToMonth] = useState(new Date().getMonth());
  const [selectedToYear, setSelectedToYear] = useState(new Date().getFullYear());
  const [isColumnsOpen, setIsColumnsOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<HistoryColumnId[]>([
    "id",
    "date",
    "asset",
    "type",
    "openPrice",
    "closePrice",
    "revenue",
    "value",
    "prediction",
    "result",
  ]);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const typeRef = useRef<HTMLDivElement>(null);
  const predictionRef = useRef<HTMLDivElement>(null);
  const assetRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const dateFromRef = useRef<HTMLDivElement>(null);
  const dateToRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);

  const revenueColor = totalRevenue >= 0 ? "text-platform-positive" : "text-platform-danger";
  const hasOperations = operations.length > 0;

  const [assets, setAssets] = useState<string[]>([]);

  const columnOptions = useMemo(
    () => [
      { id: "id" as const, label: t("id") },
      { id: "date" as const, label: t("date") },
      { id: "asset" as const, label: t("asset") },
      { id: "type" as const, label: t("type") },
      { id: "openPrice" as const, label: t("openPrice") },
      { id: "closePrice" as const, label: t("closePrice") },
      { id: "revenue" as const, label: t("revenue") },
      { id: "value" as const, label: t("value") },
      { id: "prediction" as const, label: t("prediction") },
      { id: "result" as const, label: t("result") },
    ],
    [t],
  );

  const typeOptions = [
    { id: "All operations", label: t("allOperations") },
    { id: "demo", label: "DEMO" },
    { id: "real", label: "REAL" },
  ];

  const predictionOptions = [
    { id: "All predictions", label: t("allPredictions") },
    { id: "call", label: t("buy") },
    { id: "put", label: t("sell") },
  ];

  const statusOptions = [
    { id: "All statuses", label: t("allStatuses") },
    { id: "ganho", label: t("win") },
    { id: "perda", label: t("loss") },
  ];

  function formatDate(date: string | Date): string {
    return format(new Date(date), "dd/MM/yyyy", { locale: dateFnsLocale });
  }

  function formatDateInput(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    return digits.replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2").substring(0, 10);
  }

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  useEffect(() => {
    async function fetchOperations() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/account/operations");
        const data = await res.json();
        if (res.ok) {
          const ops = Array.isArray(data.operations) ? data.operations : [];
          setOperations(ops);
          setAllOperations(ops);
          const uniqueAssets = Array.from(new Set(ops.map((op: Operation) => op.ativo))) as string[];
          setAssets(uniqueAssets);

          const calculatedRevenue = data.operations.reduce((total: number, op: Operation) => {
            const value = Number(op.valor);
            if (op.resultado === "ganho") {
              return total + value;
            } else if (op.resultado === "perda") {
              return total - value;
            }
            return total;
          }, 0);
          setTotalRevenue(calculatedRevenue);

          const totalOperations = data.operations.length;
          const winningOperations = data.operations.filter((op: Operation) => op.resultado === "Ganho").length;
          const calculatedAccuracy = totalOperations ? (winningOperations / totalOperations) * 100 : 0;
          setAccuracy(calculatedAccuracy);
        }
      } catch (error) {
        console.error("Error fetching operations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOperations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
          setIsTypeOpen(false);
        }
        if (predictionRef.current && !predictionRef.current.contains(event.target as Node)) {
          setIsPredictionOpen(false);
        }
        if (assetRef.current && !assetRef.current.contains(event.target as Node)) {
          setIsAssetOpen(false);
        }
        if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
          setIsStatusOpen(false);
        }
        if (dateFromRef.current && !dateFromRef.current.contains(event.target as Node)) {
          setIsDateFromOpen(false);
        }
        if (dateToRef.current && !dateToRef.current.contains(event.target as Node)) {
          setIsDateToOpen(false);
        }
        if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
          setIsColumnsOpen(false);
        }
      }
    };

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        if (typeof document !== "undefined") {
          document.removeEventListener("mousedown", handleClickOutside);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedColumns = window.localStorage.getItem("account-history-columns");

    if (!storedColumns) {
      return;
    }

    try {
      const parsed = JSON.parse(storedColumns) as HistoryColumnId[];
      const sanitized = parsed.filter((column) =>
        columnOptions.some((option) => option.id === column),
      );

      if (sanitized.length > 0) {
        setSelectedColumns(sanitized);
      }
    } catch {
      // Ignore invalid persisted state
    }
  }, [columnOptions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "account-history-columns",
        JSON.stringify(selectedColumns),
      );
    }
  }, [selectedColumns]);

  const getPredictionColor = (prediction: string) => {
    if (prediction === "call") return "text-platform-positive";
    if (prediction === "put") return "text-platform-danger";
    return "text-platform-text";
  };

  const getResultColor = (result: string) => {
    if (result.startsWith("ganho")) return "text-platform-positive";
    if (result.startsWith("perda")) return "text-platform-danger";
    return "text-platform-text";
  };

  const filterOperations = () => {
    const result = allOperations.filter((op) => {
      const opDate = new Date(op.data);
      const fromDate = dateFrom ? new Date(dateFrom) : new Date(0);
      const toDate = dateTo ? new Date(dateTo) : new Date();

      const withinPeriod = opDate >= fromDate && opDate <= toDate;
      const typeOK = selectedType === "All operations" || op.tipo === selectedType;
      const predictionOK = selectedPrediction === "All predictions" || op.previsao === selectedPrediction;
      const assetOK = selectedAsset === "All assets" || op.ativo === selectedAsset;
      const statusOK = selectedStatus === "All statuses" || op.status === selectedStatus;

      return withinPeriod && typeOK && predictionOK && assetOK && statusOK;
    });
    setOperations(result);
  };

  useEffect(() => {
    filterOperations();
  }, [selectedType, selectedPrediction, selectedAsset, selectedStatus, dateFrom, dateTo, allOperations]);

  const handleSelect = (value: string, setValue: (value: string) => void, setIsOpen: (value: boolean) => void) => {
    setValue(value);
    setIsOpen(false);
  };

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setDateInput: (value: string) => void,
    setDate: (value: string) => void,
    setSelectedMonth: (value: number) => void,
    setSelectedYear: (value: number) => void,
  ) => {
    const value = e.target.value;
    const formatted = formatDateInput(value);
    setDateInput(formatted);

    try {
      const parsedDate = parse(formatted, "dd/MM/yyyy", new Date());
      if (!isNaN(parsedDate.getTime())) {
        setDate(parsedDate.toISOString().split("T")[0]);
        setSelectedMonth(parsedDate.getMonth());
        setSelectedYear(parsedDate.getFullYear());
      }
    } catch {
      // No error handling needed here; validation occurs on submit
    }
  };

  const handleDateSelect = (
    date: string,
    setDate: (value: string) => void,
    setDateInput: (value: string) => void,
    setIsOpen: (value: boolean) => void,
    setSelectedMonth: (value: number) => void,
    setSelectedYear: (value: number) => void,
  ) => {
    const parsedDate = new Date(date);
    setDate(date);
    setDateInput(format(parsedDate, "dd/MM/yyyy", { locale: dateFnsLocale }));
    setSelectedMonth(parsedDate.getMonth());
    setSelectedYear(parsedDate.getFullYear());
    setIsOpen(false);
  };

  const handleMonthChange = (
    direction: "prev" | "next",
    setSelectedMonth: React.Dispatch<React.SetStateAction<number>>,
    setSelectedYear: (value: number) => void,
    currentYear: number,
  ) => {
    setSelectedMonth((prev) => {
      let newMonth = direction === "prev" ? prev - 1 : prev + 1;
      let newYear = currentYear;

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

  const generateCalendarDays = (month: number, year: number) => {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const firstDayOfWeek = startDate.getDay();
    const placeholders = Array(firstDayOfWeek).fill(null);
    return [...placeholders, ...days];
  };

  const exportCSV = () => {
    const randomNumber = Math.floor(Math.random() * 1000000);
    const filename = `history_operations_${randomNumber}.csv`;
    const visibleColumns = columnOptions.filter((column) =>
      selectedColumns.includes(column.id),
    );

    const csvRows = [
      visibleColumns.map((column) => column.label).join(","),
      ...operations.map((op) =>
        visibleColumns
          .map((column) => {
            switch (column.id) {
              case "id":
                return op.id;
              case "date":
                return formatDate(op.data);
              case "asset":
                return op.ativo;
              case "type":
                return op.tipo;
              case "openPrice":
                return op.abertura;
              case "closePrice":
                return op.fechamento;
              case "revenue":
                return formatCurrency(Number(op.receita));
              case "value":
                return formatCurrency(Number(op.valor));
              case "prediction":
                return op.previsao;
              case "result":
                return op.resultado;
              default:
                return "";
            }
          })
          .join(","),
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleColumn = (columnId: HistoryColumnId) => {
    setSelectedColumns((current) => {
      if (current.includes(columnId)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((column) => column !== columnId);
      }

      return [...current, columnId];
    });
  };

  const renderCell = (columnId: HistoryColumnId, op: Operation) => {
    switch (columnId) {
      case "id":
        return <span className="text-platform-overlay-muted">{op.id}</span>;
      case "date":
        return <span>{formatDate(op.data)}</span>;
      case "asset":
        return <span className="font-medium uppercase">{op.ativo}</span>;
      case "type":
        return <span className="uppercase">{op.tipo}</span>;
      case "openPrice":
        return <span>{op.abertura}</span>;
      case "closePrice":
        return <span>{op.fechamento}</span>;
      case "revenue":
        return <span>{formatCurrency(Number(op.receita))}</span>;
      case "value":
        return <span>{formatCurrency(Number(op.valor))}</span>;
      case "prediction":
        return <span className={`font-medium uppercase ${getPredictionColor(op.previsao)}`}>{op.previsao}</span>;
      case "result":
        return <span className={`font-semibold uppercase ${getResultColor(op.resultado)}`}>{op.resultado}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full text-platform-text">
      <div className="bg-white/[0.03] rounded-2xl p-5 sm:p-6">
        {isLoading ? (
          <AccountTableSectionSkeleton
            showStats
            showActions
            rows={isMobile ? 4 : 6}
            columns={isMobile ? 2 : 10}
          />
        ) : (
          <>
        <h3 className="text-lg font-semibold mb-4">{t("tradingHistory")}</h3>
        <p className="text-sm text-platform-overlay-muted mb-6">{t("totalOperations")}: {operations.length}</p>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative" ref={typeRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("type")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsTypeOpen(!isTypeOpen)}
            >
              <span className="text-sm">{typeOptions.find((opt) => opt.id === selectedType)?.label || t("select")}</span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isTypeOpen ? "rotate-180" : ""}`} />
            </button>
            {isTypeOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 shadow-2xl">
                {typeOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      option.id === selectedType
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setSelectedType, setIsTypeOpen)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={predictionRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("prediction")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsPredictionOpen(!isPredictionOpen)}
            >
              <span className="text-sm">
                {predictionOptions.find((opt) => opt.id === selectedPrediction)?.label || t("select")}
              </span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isPredictionOpen ? "rotate-180" : ""}`} />
            </button>
            {isPredictionOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 shadow-2xl">
                {predictionOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      option.id === selectedPrediction
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setSelectedPrediction, setIsPredictionOpen)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={assetRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("asset")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsAssetOpen(!isAssetOpen)}
            >
              <span className="text-sm">{selectedAsset === "All assets" ? t("allAssets") : selectedAsset}</span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isAssetOpen ? "rotate-180" : ""}`} />
            </button>
            {isAssetOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 shadow-2xl max-h-64 overflow-y-auto">
                <button
                  className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                    selectedAsset === "All assets"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => handleSelect("All assets", setSelectedAsset, setIsAssetOpen)}
                >
                  {t("allAssets")}
                </button>
                {assets.map((asset) => (
                  <button
                    key={asset}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      asset === selectedAsset ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(asset, setSelectedAsset, setIsAssetOpen)}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={statusRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("status")}</label>
            <button
              className="w-full flex items-center justify-between py-3 px-4 bg-white/5 text-white rounded-xl transition-all duration-200 focus:outline-none focus:bg-white/10"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
            >
              <span className="text-sm">
                {statusOptions.find((opt) => opt.id === selectedStatus)?.label || t("select")}
              </span>
              <ChevronDown size={16} className={`text-white/40 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>
            {isStatusOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 shadow-2xl">
                {statusOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      option.id === selectedStatus
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() => handleSelect(option.id, setSelectedStatus, setIsStatusOpen)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={dateFromRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("from")}</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                placeholder={t("datePlaceholder")}
                value={dateFromInput}
                onChange={(e) =>
                  handleDateInputChange(e, setDateFromInput, setDateFrom, setSelectedFromMonth, setSelectedFromYear)
                }
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setIsDateFromOpen(!isDateFromOpen)}
              >
                <Calendar size={16} className="text-platform-overlay-muted" />
              </button>
            </div>
            {isDateFromOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 p-4 w-[280px] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() =>
                      handleMonthChange("prev", setSelectedFromMonth, setSelectedFromYear, selectedFromYear)
                    }
                    className="p-1 hover:bg-white/5 rounded-full"
                  >
                    <ChevronLeft size={16} className="text-platform-overlay-muted" />
                  </button>
                  <span className="text-sm text-platform-text">
                    {format(new Date(selectedFromYear, selectedFromMonth), "MMMM yyyy", { locale: dateFnsLocale })}
                  </span>
                  <button
                    onClick={() =>
                      handleMonthChange("next", setSelectedFromMonth, setSelectedFromYear, selectedFromYear)
                    }
                    className="p-1 hover:bg-white/5 rounded-full"
                  >
                    <ChevronRight size={16} className="text-platform-overlay-muted" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-platform-overlay-muted text-xs">
                      {t(`weekdays.${day.toLowerCase()}`)}
                    </div>
                  ))}
                  {generateCalendarDays(selectedFromMonth, selectedFromYear).map((day, index) => (
                    <button
                      key={index}
                      className={`p-2 text-sm transition-colors duration-200 ${
                        day
                          ? dateFrom && new Date(dateFrom).toDateString() === day.toDateString()
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                          : "text-transparent"
                      }`}
                      onClick={() =>
                        day &&
                        handleDateSelect(
                          day.toISOString().split("T")[0],
                          setDateFrom,
                          setDateFromInput,
                          setIsDateFromOpen,
                          setSelectedFromMonth,
                          setSelectedFromYear,
                        )
                      }
                      disabled={!day}
                    >
                      {day ? format(day, "d") : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={dateToRef}>
            <label className="block text-sm text-platform-overlay-muted mb-2">{t("to")}</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-white/5 rounded-xl py-3 px-4 text-platform-text focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all duration-200"
                placeholder={t("datePlaceholder")}
                value={dateToInput}
                onChange={(e) =>
                  handleDateInputChange(e, setDateToInput, setDateTo, setSelectedToMonth, setSelectedToYear)
                }
              />
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setIsDateToOpen(!isDateToOpen)}
              >
                <Calendar size={16} className="text-platform-overlay-muted" />
              </button>
            </div>
            {isDateToOpen && (
              <div className="absolute top-full left-0 mt-2 bg-[#1a1f2e] rounded-xl overflow-hidden z-50 p-4 w-[280px] shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => handleMonthChange("prev", setSelectedToMonth, setSelectedToYear, selectedToYear)}
                    className="p-1 hover:bg-white/5 rounded-full"
                  >
                    <ChevronLeft size={16} className="text-platform-overlay-muted" />
                  </button>
                  <span className="text-sm text-platform-text">
                    {format(new Date(selectedToYear, selectedToMonth), "MMMM yyyy", { locale: dateFnsLocale })}
                  </span>
                  <button
                    onClick={() => handleMonthChange("next", setSelectedToMonth, setSelectedToYear, selectedToYear)}
                    className="p-1 hover:bg-white/5 rounded-full"
                  >
                    <ChevronRight size={16} className="text-platform-overlay-muted" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-platform-overlay-muted text-xs">
                      {t(`weekdays.${day.toLowerCase()}`)}
                    </div>
                  ))}
                  {generateCalendarDays(selectedToMonth, selectedToYear).map((day, index) => (
                    <button
                      key={index}
                      className={`p-2 text-sm transition-colors duration-200 ${
                        day
                          ? dateTo && new Date(dateTo).toDateString() === day.toDateString()
                            ? "bg-white/10 text-white"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                          : "text-transparent"
                      }`}
                      onClick={() =>
                        day &&
                        handleDateSelect(
                          day.toISOString().split("T")[0],
                          setDateTo,
                          setDateToInput,
                          setIsDateToOpen,
                          setSelectedToMonth,
                          setSelectedToYear,
                        )
                      }
                      disabled={!day}
                    >
                      {day ? format(day, "d") : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/40">
                {t("operations")}
              </div>
              <BarChart2 className="text-platform-positive" size={16} />
            </div>
            <div className="text-xl font-bold">{operations.length}</div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/40">
                {t("accuracy")}
              </div>
              <Target className="text-platform-positive" size={16} />
            </div>
            <div className="text-xl font-bold">{accuracy.toFixed(2)}%</div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-white/40">
                {t("revenue")}
              </div>
              <DollarSign className="text-platform-positive" size={16} />
            </div>
            <div className={`text-xl font-bold ${revenueColor}`}>{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="relative" ref={columnsRef}>
            <button
              onClick={() => setIsColumnsOpen((current) => !current)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white transition-all duration-200 hover:bg-white/[0.06]"
            >
              <Settings2 size={16} />
              <span>{t("columns")}</span>
            </button>

            {isColumnsOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-white/[0.08] bg-[#050505] p-2 shadow-2xl">
                <div className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-platform-overlay-muted">
                  {t("columns")}
                </div>
                <div className="space-y-1">
                  {columnOptions.map((column) => {
                    const checked = selectedColumns.includes(column.id);

                    return (
                      <button
                        key={column.id}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          checked
                            ? "bg-white/[0.08] text-white"
                            : "text-white/72 hover:bg-white/[0.05] hover:text-white"
                        }`}
                        onClick={() => toggleColumn(column.id)}
                      >
                        <span>{column.label}</span>
                        <span className={`h-4 w-4 rounded border ${checked ? "border-white bg-white" : "border-white/25 bg-transparent"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={exportCSV}
            className="w-full md:w-auto bg-white text-black py-3 px-6 rounded-xl transition-all duration-200 hover:bg-white/90 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasOperations}
          >
            <Download size={16} className="mr-2" />
            <span>{t("export")}</span>
          </button>
        </div>

        {!hasOperations ? (
          <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-5 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
              <Inbox size={24} className="text-platform-overlay-muted" />
            </div>
            <h4 className="text-base font-semibold text-platform-text">
              {t("emptyTitle")}
            </h4>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-platform-overlay-muted">
              {t("emptyDescription")}
            </p>
          </div>
        ) : (
          <>
            {!isMobile && (
              <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr className="text-left text-white/42">
                      {columnOptions
                        .filter((column) => selectedColumns.includes(column.id))
                        .map((column) => (
                          <th
                            key={column.id}
                            className="border-b border-white/[0.06] bg-white/[0.03] py-3.5 px-4 font-medium text-sm"
                          >
                            {column.label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => (
                      <tr key={op.id} className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.03]">
                        {columnOptions
                          .filter((column) => selectedColumns.includes(column.id))
                          .map((column) => (
                            <td key={column.id} className="py-4 px-4 text-sm">
                              {renderCell(column.id, op)}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {isMobile && (
              <div className="space-y-3">
                {operations.map((op) => (
                  <div key={op.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold uppercase text-platform-text">
                          {op.ativo}
                        </div>
                        <div className="mt-1 text-xs text-platform-overlay-muted">
                          {formatDate(op.data)} • {op.tempo}
                        </div>
                      </div>
                      <div className={`text-xs uppercase font-semibold ${getResultColor(op.resultado)}`}>
                        {op.resultado}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-platform-overlay-muted">{t("prediction")}</div>
                      <div className={`text-right uppercase font-medium ${getPredictionColor(op.previsao)}`}>{op.previsao}</div>
                      <div className="text-platform-overlay-muted">{t("revenue")}</div>
                      <div className="text-right">{formatCurrency(Number(op.receita))}</div>
                      <div className="text-platform-overlay-muted">{t("value")}</div>
                      <div className="text-right">{formatCurrency(Number(op.valor))}</div>
                      <div className="text-platform-overlay-muted">{t("id")}</div>
                      <div className="text-right text-xs text-platform-overlay-muted">{op.id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
          </>
        )}
      </div>
    </div>
  );
}
