"use client";

type PlatformTrackingEvent = "register" | "deposit" | "withdraw";

type PlatformTrackingConfig = {
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  facebookPixelId?: string | null;
  trackRegisterEvents?: boolean;
  trackDepositEvents?: boolean;
  trackWithdrawalEvents?: boolean;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __PLATFORM_TRACKING__?: PlatformTrackingConfig;
  }
}

const TRACKING_FLAG_BY_EVENT: Record<
  PlatformTrackingEvent,
  keyof Pick<
    PlatformTrackingConfig,
    "trackRegisterEvents" | "trackDepositEvents" | "trackWithdrawalEvents"
  >
> = {
  register: "trackRegisterEvents",
  deposit: "trackDepositEvents",
  withdraw: "trackWithdrawalEvents",
};

const GA_EVENT_BY_TYPE: Record<PlatformTrackingEvent, string> = {
  register: "sign_up",
  deposit: "purchase",
  withdraw: "withdraw_request",
};

const FB_EVENT_BY_TYPE: Record<PlatformTrackingEvent, string> = {
  register: "CompleteRegistration",
  deposit: "Purchase",
  withdraw: "WithdrawRequest",
};

function getTrackingConfig() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.__PLATFORM_TRACKING__ ?? null;
}

function shouldTrack(event: PlatformTrackingEvent) {
  const config = getTrackingConfig();
  if (!config) {
    return false;
  }

  return config[TRACKING_FLAG_BY_EVENT[event]] !== false;
}

export function trackPlatformPixel(
  event: PlatformTrackingEvent,
  payload: Record<string, unknown> = {},
) {
  if (typeof window === "undefined" || !shouldTrack(event)) {
    return;
  }

  const config = getTrackingConfig();
  const amount =
    typeof payload.amount === "number"
      ? payload.amount
      : typeof payload.value === "number"
        ? payload.value
        : undefined;

  const normalizedPayload = {
    currency: "USD",
    ...payload,
    ...(typeof amount === "number" ? { value: amount } : {}),
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: `platform_${event}`,
    ...normalizedPayload,
  });

  if (config?.googleAnalyticsId && typeof window.gtag === "function") {
    window.gtag("event", GA_EVENT_BY_TYPE[event], normalizedPayload);
  }

  if (config?.facebookPixelId && typeof window.fbq === "function") {
    window.fbq("track", FB_EVENT_BY_TYPE[event], normalizedPayload);
  }
}
