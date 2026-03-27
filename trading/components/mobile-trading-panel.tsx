"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TrendingUp, TrendingDown, Plus, Minus } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useAccountStore } from "@/store/account-store";
import { fetchCurrentPrice } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { ValueChangeOverlay } from "@/components/ui/value-change-overlay";
import { useTickSound } from "@/hooks/use-tick-sound";
import {
  DEFAULT_TIME_INTERVALS,
  MIN_PERCENTAGE,
  QUICK_AMOUNTS,
  buildTradeOperationPayload,
  createTradeDraft,
  formatTradeExpirationLabel,
  getAccountBalance,
  normalizeTradeAmountStepDown,
  normalizeTradeAmountStepUp,
  resolveSafeExpirationValue,
  sanitizeExpirationOptions,
  type TimeInterval,
  type TradeType,
} from "@/lib/trading-order";
import { useTradeCountdown } from "@/hooks/useTradeCountdown";

interface OrderFormProps {
  currentPrice: number;
  onPlaceOrder: (
    type: TradeType,
    amount: number,
    expirationMinutes: number,
  ) => string;
  onOperationConfirmed?: (localId: string, serverId: string) => void;
  tradingPair: string;
  payoutRate: number;
  defaultExpirationMinutes?: number;
  expirationOptions?: readonly number[];
}

export function MobileTradingPanel({
  currentPrice,
  onPlaceOrder,
  onOperationConfirmed,
  tradingPair,
  payoutRate,
  defaultExpirationMinutes = 1,
  expirationOptions = DEFAULT_TIME_INTERVALS,
}: OrderFormProps) {
  const t = useTranslations("TradingPanel");
  const [timeValue, setTimeValue] = useState<TimeInterval>(
    defaultExpirationMinutes,
  );
  const [value, setValue] = useState(1);
  const [valueChangeItems, setValueChangeItems] = useState<Array<{ id: number; delta: number }>>([]);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [inputValue, setInputValue] = useState("1");
  const [buyPercentage, setBuyPercentage] = useState(54);
  const [sellPercentage, setSellPercentage] = useState(46);
  const [isProcessingOperation, setIsProcessingOperation] = useState(false);
  const [isValueMenuOpen, setIsValueMenuOpen] = useState(false);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

  const valueInputRef = useRef<HTMLInputElement>(null);
  const currentPriceRef = useRef(currentPrice);
  const valueMenuRef = useRef<HTMLDivElement>(null);
  const timeMenuRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const playTick = useTickSound();
  const playDealOpen = useTickSound("/sound_make_deal.ogg");

  const {
    realBalance,
    demoBalance,
    selectedAccount,
    addOperation,
    syncBalances,
    updateCurrentPrice,
  } = useAccountStore();
  const { buttonsDisabled, remainingSeconds, totalSeconds } =
    useTradeCountdown(timeValue);

  const revenue = useMemo(() => value * payoutRate, [value, payoutRate]);
  const availableTimeIntervals = useMemo(
    () => sanitizeExpirationOptions(expirationOptions),
    [expirationOptions],
  );
  const currentBalance = useMemo(
    () => getAccountBalance(selectedAccount, realBalance, demoBalance),
    [demoBalance, realBalance, selectedAccount],
  );
  const progress = useMemo(
    () => (totalSeconds === 0 ? 100 : (remainingSeconds / totalSeconds) * 100),
    [remainingSeconds, totalSeconds],
  );

  // Update the current price reference when it changes
  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (valueMenuRef.current && !valueMenuRef.current.contains(target)) {
        setIsValueMenuOpen(false);
        setIsEditingValue(false);
      }
      if (timeMenuRef.current && !timeMenuRef.current.contains(target)) {
        setIsTimeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatCurrency = useCallback(
    (value: number) =>
      value.toLocaleString("en-US", { style: "currency", currency: "USD" }),
    [],
  );
  const formattedAccountBalance = useMemo(
    () => formatCurrency(currentBalance),
    [currentBalance, formatCurrency],
  );

  const formatTimeDisplay = useCallback((seconds: number) => {
    if (seconds <= 0) return "00:00";
    if (seconds > 86400) return `${Math.floor(seconds / 3600)}h`;
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  }, []);

  const incrementTime = useCallback(() => {
    playTick();
    setTimeValue((prev) => {
      const currentIndex = availableTimeIntervals.indexOf(prev);
      const nextIndex = Math.min(
        currentIndex + 1,
        availableTimeIntervals.length - 1,
      );
      return availableTimeIntervals[nextIndex] ?? prev;
    });
  }, [availableTimeIntervals, playTick]);

  const decrementTime = useCallback(() => {
    playTick();
    setTimeValue((prev) => {
      const currentIndex = availableTimeIntervals.indexOf(prev);
      const nextIndex = Math.max(currentIndex - 1, 0);
      return availableTimeIntervals[nextIndex] ?? prev;
    });
  }, [availableTimeIntervals, playTick]);

  useEffect(() => {
    const safeDefault = resolveSafeExpirationValue(
      availableTimeIntervals,
      defaultExpirationMinutes,
      1,
    );

    setTimeValue((prev) =>
      availableTimeIntervals.includes(prev) ? prev : safeDefault,
    );
  }, [availableTimeIntervals, defaultExpirationMinutes]);

  const pushValueAnimation = useCallback((delta: number) => {
    if (delta === 0) return;
    const id = Date.now() + Math.random();
    setValueChangeItems((prev) => [...prev, { id, delta }]);
    window.setTimeout(() => {
      setValueChangeItems((prev) => prev.filter((item) => item.id !== id));
    }, 760);
  }, []);

  const incrementValue = useCallback(() => {
    playTick();
    setValue((prev) => {
      const nextValue = normalizeTradeAmountStepUp(prev);
      setInputValue(String(nextValue));
      pushValueAnimation(nextValue - prev);
      return nextValue;
    });
  }, [playTick, pushValueAnimation]);

  const decrementValue = useCallback(() => {
    playTick();
    setValue((prev) => {
      const nextValue = normalizeTradeAmountStepDown(prev);
      setInputValue(String(nextValue));
      pushValueAnimation(nextValue - prev);
      return nextValue;
    });
  }, [playTick, pushValueAnimation]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      setInputValue(rawValue);
      if (rawValue) setValue(Number(rawValue));
    },
    [],
  );

  const handleValueFocus = useCallback(() => {
    playTick();
    setIsValueMenuOpen(true);
    setIsEditingValue(true);
    setTimeout(() => valueInputRef.current?.select(), 0);
  }, [playTick]);

  const handleValueBlur = useCallback(() => {
    setIsEditingValue(false);
    if (!inputValue) {
      setInputValue("1");
      setValue(1);
      return;
    }
    const nextValue = Math.max(1, Number(inputValue));
    setInputValue(String(nextValue));
    setValue(nextValue);
  }, [inputValue]);

  const selectQuickAmount = useCallback(
    (amount: number) => {
      playTick();
      setValue(amount);
      setInputValue(String(amount));
      setIsValueMenuOpen(false);
      setIsEditingValue(false);
    },
    [playTick],
  );

  const selectAllBalance = useCallback(() => {
    playTick();
    const balanceAmount = Math.max(1, Math.floor(currentBalance));
    setValue(balanceAmount);
    setInputValue(String(balanceAmount));
    setIsValueMenuOpen(false);
    setIsEditingValue(false);
  }, [currentBalance, playTick]);

  const selectTimeValue = useCallback(
    (minutes: TimeInterval) => {
      playTick();
      setTimeValue(minutes);
      setIsTimeMenuOpen(false);
    },
    [playTick],
  );

  const checkBalance = useCallback(
    (selectedAccount: string) => {
      const balance = selectedAccount === "real" ? realBalance : demoBalance;
      if (value > balance) {
        toast.open({
          variant: "error",
          title: t("insufficientBalance"),
          description: t("insufficientBalanceDesc", { account: selectedAccount }),
          duration: 5000,
        });
        return false;
      }
      return true;
    },
    [value, realBalance, demoBalance, toast, t],
  );

  const createOperation = useCallback(
    async (type: TradeType) => {
      const price =
        currentPriceRef.current || (await fetchCurrentPrice(tradingPair));
      return createTradeDraft({
        asset: tradingPair,
        type,
        value,
        timeValue,
        payoutRate,
        price,
      });
    },
    [payoutRate, timeValue, tradingPair, value],
  );

  const handleTrade = useCallback(
    async (type: TradeType) => {
      if (isProcessingOperation) return;
      setIsProcessingOperation(true);

      try {
        if (!currentPriceRef.current || currentPriceRef.current <= 0) {
          toast.open({
            variant: "error",
            title: t("priceUnavailable"),
            description: t("priceUnavailableDesc"),
            duration: 3000,
          });
          setIsProcessingOperation(false);
          return;
        }

        if (!checkBalance(selectedAccount)) {
          setIsProcessingOperation(false);
          return;
        }

        if (type === "buy" && sellPercentage > MIN_PERCENTAGE) {
          setBuyPercentage((p) => p + 1);
          setSellPercentage((p) => p - 1);
        } else if (type === "sell" && buyPercentage > MIN_PERCENTAGE) {
          setSellPercentage((p) => p + 1);
          setBuyPercentage((p) => p - 1);
        }

        const draftOperation = await createOperation(type);
        const expirationMinutes = timeValue;
        const localOrderId = onPlaceOrder(type, value, expirationMinutes);

        const response = await fetch("/api/account/operations/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            buildTradeOperationPayload({
              selectedAccount,
              tradingPair,
              type,
              timeValue,
              entryPrice: draftOperation.entryPrice,
              value,
              expiryTime: draftOperation.expiryTime,
            }),
          ),
        });

        if (!response.ok) throw new Error(t("failedToCreateOperation"));

        const { id: operationId, expiresAt: serverExpiresAt } =
          await response.json();
        addOperation({
          ...draftOperation,
          id: operationId,
          accountType: selectedAccount,
          expiryTime: serverExpiresAt
            ? new Date(serverExpiresAt).getTime()
            : draftOperation.expiryTime,
        });
        onOperationConfirmed?.(localOrderId, operationId);
        syncBalances();
        playDealOpen();

        toast.open({
          variant: "success",
          title: t("operationPerformed"),
          description: t("operationDescription", { type: t(type), pair: tradingPair, value: formatCurrency(value) }),
          duration: 5000,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error(`Error in ${type} operation:`, error);
        }
        toast.open({
          variant: "error",
          title: t("operationError"),
          description: t("tryAgain"),
          duration: 5000,
        });
      } finally {
        setIsProcessingOperation(false);
      }
    },
    [
      isProcessingOperation,
      selectedAccount,
      checkBalance,
      createOperation,
      addOperation,
      syncBalances,
      toast,
      t,
      formatCurrency,
      tradingPair,
      timeValue,
      value,
      sellPercentage,
      buyPercentage,
      onPlaceOrder,
      onOperationConfirmed,
      playDealOpen,
    ],
  );

  const handleBuyClick = useCallback(() => {
    playTick();
    void handleTrade("buy");
  }, [handleTrade, playTick]);
  const handleSellClick = useCallback(() => {
    playTick();
    void handleTrade("sell");
  }, [handleTrade, playTick]);

  return (
    <div className="w-full h-full bg-black flex flex-col rounded-lg overflow-hidden">
      <div className="p-2 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="text-platform-positive text-xs bg-transparent px-2 py-1 rounded-xl">
              {formatTimeDisplay(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Simplified Progress Bar */}
        <div className="w-full h-1 bg-platform-overlay-surface rounded-full overflow-hidden mb-4 relative">
          <div
            className="h-full bg-gradient-to-r from-platform-positive to-platform-primary-hover absolute top-0 left-0 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Compact Controls */}
        <div className="grid grid-cols-2 gap-2 mb-4 mt-2">
          <div>
            <div className="text-xs text-platform-overlay-muted mb-1">{t("time")}</div>
            <div
              ref={timeMenuRef}
              className="relative flex items-center rounded-xl overflow-visible h-9 border border-platform-overlay-border"
            >
              <button
                className="bg-transparent text-white p-1 w-8 flex justify-center items-center hover:text-platform-overlay-muted transition-colors"
                onClick={decrementTime}
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setIsTimeMenuOpen((prev) => !prev);
                }}
                className="flex-1 text-center py-1 min-w-[40px] text-sm font-medium text-white"
              >
                {formatTradeExpirationLabel(timeValue)}
              </button>
              <button
                className="bg-transparent text-white p-1 w-8 flex justify-center items-center hover:text-platform-overlay-muted transition-colors"
                onClick={incrementTime}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
              {isTimeMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[220px] rounded-3xl border border-platform-overlay-border bg-platform-bg/96 p-3 shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 border-b border-platform-overlay-border px-1 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                    Expiracao
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableTimeIntervals.map((minutes) => (
                      <button
                        key={minutes}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectTimeValue(minutes)}
                        className={`rounded-2xl border px-3 py-3 text-xs font-medium transition-all ${
                          timeValue === minutes
                            ? "border-platform-positive bg-platform-positive/10 text-platform-text shadow-lg shadow-platform-positive/10"
                            : "border-platform-overlay-border bg-platform-bg text-platform-muted hover:border-platform-overlay-muted hover:text-platform-text"
                        }`}
                      >
                        {formatTradeExpirationLabel(minutes)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs text-platform-overlay-muted mb-1">{t("value")}</div>
            <div
              ref={valueMenuRef}
              className="relative flex items-center rounded-xl overflow-visible h-9 bg-transparent border border-platform-overlay-border"
            >
              <ValueChangeOverlay items={valueChangeItems} compact />
              <button
                className="bg-platform-surface-alt text-platform-muted p-1 w-8 flex justify-center items-center hover:text-platform-overlay-muted transition-colors"
                onClick={decrementValue}
              >
                <Minus size={14} strokeWidth={2.5} />
              </button>
              {isEditingValue ? (
                <input
                  ref={valueInputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleValueChange}
                  onBlur={handleValueBlur}
                  className="flex-1 text-center py-1 bg-transparent border-none focus:outline-none focus:border-platform-positive min-w-[40px] text-sm text-white font-bold transition-all duration-300 focus:shadow-xl focus:shadow-platform-positive/20"
                  autoFocus
                />
              ) : (
                <div
                  className="flex-1 text-center py-1 cursor-text truncate min-w-[40px] text-sm font-medium text-white hover:border-platform-overlay-border transition-all duration-300 hover:shadow-xl hover:shadow-platform-overlay-hover/20"
                  onClick={handleValueFocus}
                >
                  {formatCurrency(value).replace("$", "").trim()}
                </div>
              )}
              <button
                className="bg-platform-surface-alt text-platform-muted p-1 w-8 flex justify-center items-center hover:text-platform-overlay-muted transition-colors"
                onClick={incrementValue}
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
              {isValueMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[220px] rounded-3xl border border-platform-overlay-border bg-platform-bg/96 p-3 shadow-2xl backdrop-blur-xl">
                  <div className="mb-3 flex items-center justify-between border-b border-platform-overlay-border px-1 pb-3">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                      Valor rapido
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-platform-overlay-muted">
                      {selectedAccount}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectQuickAmount(amount)}
                        className="rounded-2xl border border-platform-overlay-border bg-platform-bg px-3 py-3 text-xs font-medium text-platform-text transition-all hover:border-platform-overlay-muted hover:text-platform-text"
                      >
                        {`$${amount}`}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={selectAllBalance}
                    className="mt-2 w-full rounded-2xl border px-3 py-3 text-xs font-semibold transition-all"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--platform-success-color) 30%, transparent)",
                      background:
                        "color-mix(in srgb, var(--platform-success-color) 12%, transparent)",
                      color: "var(--platform-success-color)",
                    }}
                  >
                    {formattedAccountBalance}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Compact Revenue */}
        <div className="mb-4 bg-transparent p-2 rounded-xl">
          <div className="flex items-center justify-between">
            <div
              className="text-xs"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              {t("revenue")}
            </div>
            <div
              className="text-lg font-bold"
              style={{ color: "var(--platform-success-color)" }}
            >
              {formatCurrency(revenue)}
            </div>
          </div>
        </div>

        {/* Buy/Sell Buttons - Main Element */}
        <div className="flex flex-col gap-2 mt-auto mb-2">
          {buttonsDisabled && (
            <div
              className="text-center text-xs animate-pulse"
              style={{ color: "var(--platform-warning-color)" }}
            >
              {t("waitingNewInterval", { seconds: remainingSeconds })}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {/* Buy Button */}
            <button
              className={`w-full py-3 bg-platform-positive hover:bg-platform-primary-hover text-white font-bold flex items-center justify-center transition-colors rounded-sm ${
                buttonsDisabled || isProcessingOperation ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:shadow-platform-positive/20"
              }`}
              onClick={handleBuyClick}
              disabled={buttonsDisabled || isProcessingOperation}
            >
              {isProcessingOperation ? (
                <Skeleton className="h-4 w-14 rounded-full bg-white/30" />
              ) : (
                <>
                  <TrendingUp size={16} strokeWidth={2.5} className="mr-1" />
                  <span className="font-bold">{t("higher")}</span>
                </>
              )}
            </button>

            {/* Sell Button */}
            <button
              className={`w-full py-3 bg-platform-danger hover:bg-platform-negative text-white font-bold flex items-center justify-center transition-colors rounded-sm ${
                buttonsDisabled || isProcessingOperation ? "opacity-50 cursor-not-allowed" : "hover:shadow-xl hover:shadow-platform-danger/20"
              }`}
              onClick={handleSellClick}
              disabled={buttonsDisabled || isProcessingOperation}
            >
              {isProcessingOperation ? (
                <Skeleton className="h-4 w-14 rounded-full bg-white/30" />
              ) : (
                <>
                  <TrendingDown size={16} strokeWidth={2.5} className="mr-1" />
                  <span className="font-bold">{t("lower")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
