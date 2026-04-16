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
    () => (timeValue === 1440 ? SECONDS_IN_DAY : Math.round(timeValue * 60)),
    [timeValue],
  );

  const disableThreshold = useMemo(
    () => (totalSeconds <= BUTTON_DISABLE_THRESHOLD ? 1 : BUTTON_DISABLE_THRESHOLD),
    [totalSeconds],
  );

  useEffect(() => {
    const initialSeconds = calculateSecondsUntilNextInterval(timeValue);
    setRemainingSeconds(initialSeconds);
    setButtonsDisabled(initialSeconds <= disableThreshold);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= disableThreshold) {
          setButtonsDisabled(true);
        }

        if (prev <= 1) {
          const resetSeconds = calculateSecondsUntilNextInterval(timeValue);
          setButtonsDisabled(resetSeconds <= disableThreshold);
          return resetSeconds;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeValue, disableThreshold]);

  return {
    buttonsDisabled,
    remainingSeconds,
    totalSeconds,
  };
}
