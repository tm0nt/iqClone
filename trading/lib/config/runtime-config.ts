import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const RUNTIME_CONFIG_TTL_MS = 30_000;

const runtimeConfigSelect = {
  urlSite: true,
  authSecret: true,
  adminSessionSecret: true,
  settleSecret: true,
  googleClientId: true,
  googleClientSecret: true,
} as const;

type RuntimeConfigValue = {
  urlSite: string;
  authSecret: string;
  adminSessionSecret: string;
  settleSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
};

type RuntimeConfigState = {
  cache: { value: RuntimeConfigValue; expiresAt: number } | null;
  promise: Promise<RuntimeConfigValue> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __TRADING_RUNTIME_CONFIG_STATE__: RuntimeConfigState | undefined;
}

const runtimeConfigState: RuntimeConfigState =
  globalThis.__TRADING_RUNTIME_CONFIG_STATE__ ?? {
    cache: null,
    promise: null,
  };

if (!globalThis.__TRADING_RUNTIME_CONFIG_STATE__) {
  globalThis.__TRADING_RUNTIME_CONFIG_STATE__ = runtimeConfigState;
}

function normalizeOptionalString(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function deriveStableSecret(namespace: string) {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return createHash("sha256")
      .update(`${databaseUrl}:${namespace}`)
      .digest("hex");
  }

  return randomBytes(32).toString("hex");
}

async function buildRuntimeConfig(): Promise<RuntimeConfigValue> {
  let config = null;

  try {
    config = await prisma.config.findUnique({
      where: { id: 1 },
      select: runtimeConfigSelect,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (!message.includes("Unknown field")) {
      throw error;
    }

    const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT * FROM "Config" WHERE "id" = 1 LIMIT 1
    `;
    config = (rows[0] ?? null) as typeof config;
  }

  return {
    urlSite: normalizeOptionalString(config?.urlSite) ?? "",
    authSecret:
      normalizeOptionalString(config?.authSecret) ??
      deriveStableSecret("trading-auth"),
    adminSessionSecret:
      normalizeOptionalString(config?.adminSessionSecret) ??
      deriveStableSecret("admin-session"),
    settleSecret: normalizeOptionalString(config?.settleSecret) ?? "",
    googleClientId: normalizeOptionalString(config?.googleClientId),
    googleClientSecret: normalizeOptionalString(config?.googleClientSecret),
  };
}

export function invalidateRuntimeConfigCache() {
  runtimeConfigState.cache = null;
}

export async function getRuntimeConfig() {
  if (
    runtimeConfigState.cache &&
    runtimeConfigState.cache.expiresAt > Date.now()
  ) {
    return runtimeConfigState.cache.value;
  }

  if (!runtimeConfigState.promise) {
    runtimeConfigState.promise = buildRuntimeConfig()
      .then((value) => {
        runtimeConfigState.cache = {
          value,
          expiresAt: Date.now() + RUNTIME_CONFIG_TTL_MS,
        };
        return value;
      })
      .finally(() => {
        runtimeConfigState.promise = null;
      });
  }

  return runtimeConfigState.promise;
}
