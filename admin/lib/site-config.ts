import { getConfig } from "@/db/queries/config";
import { BRANDING_DEFAULTS } from "@shared/platform/branding";

const ADMIN_SITE_CONFIG_TTL_MS = 30_000;

type AdminSiteConfigValue = Awaited<ReturnType<typeof buildAdminSiteConfig>>;
type AdminSiteConfigState = {
  cache: { value: AdminSiteConfigValue; expiresAt: number } | null;
  promise: Promise<AdminSiteConfigValue> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __ADMIN_SITE_CONFIG_STATE__: AdminSiteConfigState | undefined;
}

const adminSiteConfigState: AdminSiteConfigState =
  globalThis.__ADMIN_SITE_CONFIG_STATE__ ?? {
    cache: null,
    promise: null,
  };

if (!globalThis.__ADMIN_SITE_CONFIG_STATE__) {
  globalThis.__ADMIN_SITE_CONFIG_STATE__ = adminSiteConfigState;
}

async function buildAdminSiteConfig() {
  const config = await getConfig();

  return {
    ...BRANDING_DEFAULTS,
    ...config,
    nomeSite: config?.nomeSite || BRANDING_DEFAULTS.nomeSite,
    urlSite: config?.urlSite || "",
    logoUrlDark: config?.logoUrlDark || BRANDING_DEFAULTS.logoUrlDark,
    logoUrlWhite: config?.logoUrlWhite || BRANDING_DEFAULTS.logoUrlWhite,
    faviconUrl: config?.faviconUrl || null,
  };
}

export function invalidateAdminSiteConfigCache() {
  adminSiteConfigState.cache = null;
}

export async function getAdminSiteConfig() {
  if (
    adminSiteConfigState.cache &&
    adminSiteConfigState.cache.expiresAt > Date.now()
  ) {
    return adminSiteConfigState.cache.value;
  }

  if (!adminSiteConfigState.promise) {
    adminSiteConfigState.promise = buildAdminSiteConfig()
      .then((value) => {
        adminSiteConfigState.cache = {
          value,
          expiresAt: Date.now() + ADMIN_SITE_CONFIG_TTL_MS,
        };
        return value;
      })
      .finally(() => {
        adminSiteConfigState.promise = null;
      });
  }

  return adminSiteConfigState.promise;
}
