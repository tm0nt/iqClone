export function formatUsd(
  value: number | null | undefined,
  locale = "en-US",
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number(value ?? 0));
}
