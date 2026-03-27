import { createHash, randomBytes } from "crypto";
import { db } from "@/db";
import { configs } from "@/db/schema";

const RUNTIME_CONFIG_TTL_MS = 30_000;

type RuntimeConfigValue = {
  adminSessionSecret: string;
};

type RuntimeConfigState = {
  cache: { value: RuntimeConfigValue; expiresAt: number } | null;
  promise: Promise<RuntimeConfigValue> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __ADMIN_RUNTIME_CONFIG_STATE__: RuntimeConfigState | undefined;
}

const runtimeConfigState: RuntimeConfigState =
  globalThis.__ADMIN_RUNTIME_CONFIG_STATE__ ?? {
    cache: null,
    promise: null,
  };

if (!globalThis.__ADMIN_RUNTIME_CONFIG_STATE__) {
  globalThis.__ADMIN_RUNTIME_CONFIG_STATE__ = runtimeConfigState;
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
  const config = await db.query.configs.findFirst({
    columns: {
      authSecret: true,
      adminSessionSecret: true,
    },
  });

  return {
    adminSessionSecret:
      normalizeOptionalString(config?.adminSessionSecret) ??
      normalizeOptionalString(config?.authSecret) ??
      deriveStableSecret("admin-session"),
  };
}

export function invalidateAdminRuntimeConfigCache() {
  runtimeConfigState.cache = null;
}

export async function getAdminRuntimeConfig() {
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

