"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { TrendingUp, TrendingDown, Plus, Minus, Info, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

import { useAccountStore } from "@/store/account-store";
import { ValueChangeOverlay } from "@/components/ui/value-change-overlay";
import { useTickSound } from "@/hooks/use-tick-sound";
import { fetchCurrentPrice } from "@/lib/api";
import {
  subscribeToPriceUpdates,
  unsubscribeFromPriceUpdates,
} from "@/lib/price-provider";
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

interface TradingPanelProps {
  currentPrice: number;
  tradingPair: string;
  payoutRate: number;
  onPlaceOrder: (orderType: "buy" | "sell", amount: number, expirationMinutes: number) => string;
  onOperationConfirmed?: (localId: string, serverId: string) => void;
  defaultExpirationMinutes?: number;
  expirationOptions?: readonly number[];
  onTradeHoverChange?: (direction: "buy" | "sell" | null) => void;
}

export default function TradingPanel({
  tradingPair,
  currentPrice,
  payoutRate,
  onPlaceOrder,
  onOperationConfirmed,
  defaultExpirationMinutes = 5,
  expirationOptions = DEFAULT_TIME_INTERVALS,
  onTradeHoverChange,
}: TradingPanelProps) {
  const t = useTranslations("TradingPanel");
  const [value, setValue] = useState(1);
  const [timeValue, setTimeValue] = useState<TimeInterval>(defaultExpirationMinutes);
  const [valueInput, setValueInput] = useState("1");
  const [valueChangeItems, setValueChangeItems] = useState<Array<{ id: number; delta: number }>>([]);
  const [isProcessingOperation, setIsProcessingOperation] = useState(false);
  const [buyPercentage, setBuyPercentage] = useState(54);
  const [sellPercentage, setSellPercentage] = useState(46);
  const [isValueMenuOpen, setIsValueMenuOpen] = useState(false);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

  const currentPriceRef = useRef(currentPrice);
  const valueMenuRef = useRef<HTMLDivElement | null>(null);
  const timeMenuRef = useRef<HTMLDivElement | null>(null);
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
  const { buttonsDisabled, remainingSeconds } = useTradeCountdown(timeValue);

  const revenue = useMemo(() => value * payoutRate, [value, payoutRate]);
  const formattedPair = useMemo(() => tradingPair.replace("/", ""), [tradingPair]);
  const availableTimeIntervals = useMemo(
    () => sanitizeExpirationOptions(expirationOptions),
    [expirationOptions],
  );
  const currentBalance = useMemo(
    () => getAccountBalance(selectedAccount, realBalance, demoBalance),
    [demoBalance, realBalance, selectedAccount],
  );

  const formatCurrency = useCallback((val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  }, []);
  const formattedAccountBalance = useMemo(
    () => formatCurrency(currentBalance),
    [currentBalance, formatCurrency],
  );

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
      setValueInput(String(nextValue));
      pushValueAnimation(nextValue - prev);
      return nextValue;
    });
  }, [playTick, pushValueAnimation]);

  const decrementValue = useCallback(() => {
    playTick();
    setValue((prev) => {
      const nextValue = normalizeTradeAmountStepDown(prev);
      const delta = nextValue - prev;
      setValueInput(String(nextValue));
      pushValueAnimation(delta);
      return nextValue;
    });
  }, [playTick, pushValueAnimation]);

  const safeDefaultTimeValue = useMemo(
    () =>
      resolveSafeExpirationValue(
        availableTimeIntervals,
        defaultExpirationMinutes,
        5,
      ),
    [availableTimeIntervals, defaultExpirationMinutes],
  );

  useEffect(() => {
    setTimeValue((prev) =>
      availableTimeIntervals.includes(prev) ? prev : safeDefaultTimeValue,
    );
  }, [availableTimeIntervals, safeDefaultTimeValue]);

  const timeIntervalIndex = useMemo(
    () => availableTimeIntervals.indexOf(timeValue),
    [availableTimeIntervals, timeValue],
  );

  const incrementTime = useCallback(() => {
    playTick();
    const nextIndex = Math.min(
      timeIntervalIndex + 1,
      availableTimeIntervals.length - 1,
    );
    setTimeValue(availableTimeIntervals[nextIndex] ?? safeDefaultTimeValue);
  }, [
    availableTimeIntervals,
    playTick,
    safeDefaultTimeValue,
    timeIntervalIndex,
  ]);

  const decrementTime = useCallback(() => {
    playTick();
    const nextIndex = Math.max(timeIntervalIndex - 1, 0);
    setTimeValue(availableTimeIntervals[nextIndex] ?? safeDefaultTimeValue);
  }, [
    availableTimeIntervals,
    playTick,
    safeDefaultTimeValue,
    timeIntervalIndex,
  ]);

  const handleValueInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    setValueInput(rawValue);
    if (rawValue) {
      setValue(Math.max(1, Number(rawValue)));
    }
  }, []);

  const handleValueInputBlur = useCallback(() => {
    if (!valueInput) {
      setValue(1);
      setValueInput("1");
      return;
    }

    const nextValue = Math.max(1, Number(valueInput));
    setValue(nextValue);
    setValueInput(String(nextValue));
  }, [valueInput]);

  const selectQuickAmount = useCallback(
    (amount: number) => {
      playTick();
      setValue(amount);
      setValueInput(String(amount));
      setIsValueMenuOpen(false);
    },
    [playTick],
  );

  const selectAllBalance = useCallback(() => {
    playTick();
    const balanceAmount = Math.max(1, Math.floor(currentBalance));
    setValue(balanceAmount);
    setValueInput(String(balanceAmount));
    setIsValueMenuOpen(false);
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
      const price = currentPriceRef.current || (await fetchCurrentPrice(tradingPair));
      return createTradeDraft({
        asset: formattedPair,
        type,
        value,
        timeValue,
        payoutRate,
        price,
      });
    },
    [formattedPair, payoutRate, timeValue, tradingPair, value],
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

  useEffect(() => {
    currentPriceRef.current = currentPrice;
  }, [currentPrice]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (valueMenuRef.current && !valueMenuRef.current.contains(target)) {
        setIsValueMenuOpen(false);
      }
      if (timeMenuRef.current && !timeMenuRef.current.contains(target)) {
        setIsTimeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handlePriceUpdate = (price: number) => {
      currentPriceRef.current = price;
      if (updateCurrentPrice) {
        updateCurrentPrice(formattedPair, price);
      }
    };
    if (!formattedPair) return;
    subscribeToPriceUpdates(formattedPair, handlePriceUpdate);
    return () => {
      unsubscribeFromPriceUpdates(formattedPair, handlePriceUpdate);
    };
  }, [formattedPair, updateCurrentPrice]);

  return (
    <div
      className="w-[135px] p-3 flex flex-col gap-3 font-sans"
      style={{
        color: "var(--platform-surface-foreground-color)",
        background: "var(--platform-background-color)",
      }}
    >
      {/* Value Section */}
      <div className="flex flex-col gap-2">
        <div ref={valueMenuRef} className="relative bg-platform-overlay-surface rounded-lg p-2 flex items-center justify-between h-12 overflow-visible">
          <ValueChangeOverlay items={valueChangeItems} />
          <div className="flex flex-col justify-center flex-grow min-w-0">
            <span
              className="text-xs leading-none"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              {t("value")}
            </span>
            <div className="flex items-center gap-1">
              <span
                className="text-sm"
                style={{ color: "var(--platform-surface-muted-foreground-color)" }}
              >
                $
              </span>
              <input
                type="text"
                min={1}
                value={valueInput}
                onFocus={() => {
                  playTick();
                  setIsValueMenuOpen(true);
                }}
                onChange={handleValueInputChange}
                onBlur={handleValueInputBlur}
                className="bg-transparent text-white text-sm font-semibold w-full focus:outline-none no-spin"
                style={{
                  MozAppearance: "textfield",
                }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-0.5 ml-2">
            <button
              onClick={incrementValue}
              className="transition-colors p-0.5"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              <Plus size={14} />
            </button>
            <button
              onClick={decrementValue}
              className="transition-colors p-0.5"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              <Minus size={14} />
            </button>
          </div>
          {isValueMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-[192px] rounded-[20px] border border-platform-overlay-border bg-platform-bg/96 p-2.5 shadow-2xl backdrop-blur-xl">
              <div className="mb-2.5 flex items-center justify-between border-b border-platform-overlay-border px-0.5 pb-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                  Valor rapido
                </div>
                <div className="text-[9px] font-medium uppercase tracking-[0.14em] text-platform-overlay-muted">
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
                    className="rounded-xl border px-2.5 py-2.5 text-[11px] font-medium transition-all"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--platform-overlay-border-color) 72%, transparent)",
                      background:
                        "color-mix(in srgb, var(--platform-overlay-surface-color) 90%, black)",
                      color: "var(--platform-overlay-surface-foreground-color)",
                    }}
                  >
                    {`$${amount}`}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={selectAllBalance}
                className="mt-2 w-full rounded-xl border px-2.5 py-2.5 text-[11px] font-semibold transition-all"
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

      {/* Expiration Section */}
      <div className="flex flex-col gap-2">
        <div ref={timeMenuRef} className="relative bg-platform-overlay-surface rounded-lg p-2 flex items-center justify-between h-12">
          <div className="flex flex-col justify-center flex-grow min-w-0">
            <span
              className="text-xs leading-none"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              {t("expiration")}
            </span>
            <button
              type="button"
              onClick={() => {
                playTick();
                setIsTimeMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-1 text-left"
            >
              <Clock
                size={14}
                style={{ color: "var(--platform-surface-muted-foreground-color)" }}
              />
              <span className="text-white text-sm font-semibold">
                {formatTradeExpirationLabel(timeValue)}
              </span>
            </button>
          </div>
          <div className="flex flex-col gap-0.5 ml-2">
            <button
              onClick={incrementTime}
              className="transition-colors p-0.5"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              <Plus size={14} />
            </button>
            <button
              onClick={decrementTime}
              className="transition-colors p-0.5"
              style={{ color: "var(--platform-surface-muted-foreground-color)" }}
            >
              <Minus size={14} />
            </button>
          </div>
          {isTimeMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-[192px] rounded-[20px] border border-platform-overlay-border bg-platform-bg/96 p-2.5 shadow-2xl backdrop-blur-xl">
              <div className="mb-2.5 border-b border-platform-overlay-border px-0.5 pb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-platform-overlay-muted">
                Expiracao
              </div>
              <div className="grid grid-cols-2 gap-2">
                {availableTimeIntervals.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectTimeValue(minutes)}
                    className={`rounded-xl border px-2.5 py-2.5 text-[11px] font-medium transition-all ${
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

      {/* Profit Section */}
      <div className="flex flex-col items-center gap-1 py-2">
        <div
          className="flex items-center gap-2"
          style={{ color: "var(--platform-surface-foreground-color)" }}
        >
          <span>{t("profit")}</span>
          <Info size={14} />
        </div>
        <p
          className="text-4xl"
          style={{ color: "var(--platform-success-color)" }}
        >
          +90%
        </p>
        <p
          className="text-md font-semibold"
          style={{ color: "var(--platform-success-color)" }}
        >
          +${formatCurrency(revenue)}
        </p>
      </div>

      {/* Trading Buttons */}
      <div className="flex flex-col gap-3">
        {buttonsDisabled && (
          <div
            className="text-center text-xs animate-pulse"
            style={{ color: "var(--platform-warning-color)" }}
          >
            {t("waitingNewInterval", { seconds: remainingSeconds })}
          </div>
        )}
        <button
          className="w-full p-3 bg-platform-positive hover:bg-platform-primary-hover text-white font-bold flex flex-col items-center justify-center gap-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleBuyClick}
          onMouseEnter={() => onTradeHoverChange?.("buy")}
          onMouseLeave={() => onTradeHoverChange?.(null)}
          onFocus={() => onTradeHoverChange?.("buy")}
          onBlur={() => onTradeHoverChange?.(null)}
          disabled={isProcessingOperation || buttonsDisabled}
        >
          {isProcessingOperation ? (
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full bg-white/35" />
              <Skeleton className="h-3 w-16 rounded-full bg-white/20" />
            </div>
          ) : (
            <>
              <TrendingUp size={28} strokeWidth={2.5} />
              <span className="text-base">{t("higher")}</span>
            </>
          )}
        </button>
        <button
          className="w-full p-3 bg-platform-danger hover:bg-platform-negative text-white font-bold flex flex-col items-center justify-center gap-2 transition-colors rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSellClick}
          onMouseEnter={() => onTradeHoverChange?.("sell")}
          onMouseLeave={() => onTradeHoverChange?.(null)}
          onFocus={() => onTradeHoverChange?.("sell")}
          onBlur={() => onTradeHoverChange?.(null)}
          disabled={isProcessingOperation || buttonsDisabled}
        >
          {isProcessingOperation ? (
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-5 w-12 rounded-full bg-white/35" />
              <Skeleton className="h-3 w-16 rounded-full bg-white/20" />
            </div>
          ) : (
            <>
              <TrendingDown size={28} strokeWidth={2.5} />
              <span className="text-base">{t("lower")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
