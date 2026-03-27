"use client";

import { useEffect, useState } from "react";

const DEFAULT_EXPIRATION_OPTIONS = [1, 5, 10, 15, 30, 60, 1440];

export function useTradingGeneralConfig() {
  const [chartBackgroundUrl, setChartBackgroundUrl] = useState<string | null>(
    null,
  );
  const [defaultExpirationMinutes, setDefaultExpirationMinutes] = useState(5);
  const [expirationOptions, setExpirationOptions] = useState<number[]>(
    DEFAULT_EXPIRATION_OPTIONS,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGeneralConfig() {
      try {
        const response = await fetch("/api/config/general");
        if (!response.ok || cancelled) {
          return;
        }

        const data = await response.json();
        if (cancelled) {
          return;
        }

        if (data.chartBackgroundUrl) {
          setChartBackgroundUrl(data.chartBackgroundUrl);
        }

        if (Array.isArray(data.expiryOptions)) {
          const nextOptions = data.expiryOptions
            .map((value: unknown) => Number(value))
            .filter((value: number) => Number.isFinite(value) && value > 0);

          if (nextOptions.length > 0) {
            setExpirationOptions(nextOptions);
          }
        }

        if (Number.isFinite(Number(data.defaultExpiryMinutes))) {
          setDefaultExpirationMinutes(Number(data.defaultExpiryMinutes));
        }
      } catch {
        // Best effort only.
      }
    }

    void loadGeneralConfig();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    chartBackgroundUrl,
    defaultExpirationMinutes,
    expirationOptions,
  };
}
