import type { CandleData, TimeframeConfig } from "@/types";

/**
 * Service de Chart.
 * Responsável pela comunicação com a API interna de mercado
 * e transformação dos dados de candles.
 */

export const chartService = {
  /**
   * Converte label de timeframe (ex: "5m") para configuração de base interval do AmCharts.
   */
  parseTimeframe(tf: string): TimeframeConfig {
    const unit = tf.slice(-1);
    const count = Number.parseInt(tf.slice(0, -1)) || 1;
    switch (unit) {
      case "m":
        return { timeUnit: "minute", count };
      case "h":
        return { timeUnit: "hour", count };
      case "d":
        return { timeUnit: "day", count };
      case "w":
        return { timeUnit: "week", count };
      default:
        return { timeUnit: "minute", count: 1 };
    }
  },

  /**
   * Busca candles históricos.
   * Sempre via API interna da plataforma.
   */
  async fetchCandles(
    pair: string,
    timeframe: string,
    limit = 500,
  ): Promise<CandleData[]> {
    const symbol = pair.toUpperCase();

    const response = await fetch(
      `/api/market/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}&limit=${Math.min(limit, 1000)}`,
      {
        cache: "no-store",
      },
    );
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || `Failed to fetch candles for ${symbol}`);
    }

    if (!Array.isArray(json?.candles)) {
      throw new Error("Resposta invalida da API interna de candles");
    }

    return json.candles as CandleData[];
  },

  /**
   * Extrai timestamp em ms de payload iTick (quote/tick).
   * Lida com timestamps em segundos e milissegundos.
   */
  getTimestampMs(raw: any): number {
    let t =
      typeof raw?.t === "number"
        ? raw.t
        : typeof raw?.ts === "number"
          ? raw.ts
          : Date.now();
    if (t < 1e11) t *= 1000; // segundos -> ms
    return t;
  },

  /**
   * Calcula o timestamp do início do candle baseado no timeframe.
   */
  getCandleStartTime(timestampMs: number, timeframe: string): number {
    const { timeUnit, count } = this.parseTimeframe(timeframe);
    const intervalMs =
      count *
      (timeUnit === "minute"
        ? 60_000
        : timeUnit === "hour"
          ? 3_600_000
          : timeUnit === "day"
            ? 86_400_000
            : timeUnit === "week"
              ? 604_800_000
              : 60_000);

    return Math.floor(timestampMs / intervalMs) * intervalMs;
  },
};
