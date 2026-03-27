"use client";

import { useEffect, useMemo, useState } from "react";

import {
  BUTTON_DISABLE_THRESHOLD,
  SECONDS_IN_DAY,
  calculateSecondsUntilNextInterval,
} from "@/lib/trading-order";

export function useTradeCountdown(timeValue: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    calculateSecondsUntilNextInterval(timeValue),
  );
  const [buttonsDisabled, setButtonsDisabled] = useState(false);

  const totalSeconds = useMemo(
    () => (timeValue === 1440 ? SECONDS_IN_DAY : timeValue * 60),
    [timeValue],
  );

  useEffect(() => {
    const initialSeconds = calculateSecondsUntilNextInterval(timeValue);
    setRemainingSeconds(initialSeconds);
    setButtonsDisabled(initialSeconds <= BUTTON_DISABLE_THRESHOLD);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= BUTTON_DISABLE_THRESHOLD) {
          setButtonsDisabled(true);
        }

        if (prev <= 1) {
          const resetSeconds = calculateSecondsUntilNextInterval(timeValue);
          setButtonsDisabled(resetSeconds <= BUTTON_DISABLE_THRESHOLD);
          return resetSeconds;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeValue]);

  return {
    buttonsDisabled,
    remainingSeconds,
    totalSeconds,
  };
}
