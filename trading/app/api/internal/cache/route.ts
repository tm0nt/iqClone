import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRuntimeConfig,
  invalidateRuntimeConfigCache,
} from "@/lib/config/runtime-config";
import { invalidatePlatformConfigCache } from "@/lib/config/site-config";
import { invalidateMarketRegistryCaches } from "@/lib/server/market-registry";
import { invalidateMarketDataCaches } from "@/lib/server/market-data";

function normalizeSecret(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export async function POST(request: Request) {
  const providedSecret = normalizeSecret(
    request.headers.get("x-platform-cache-secret"),
  );

  if (!providedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [runtimeConfig, configRow] = await Promise.all([
    getRuntimeConfig().catch(() => null),
    prisma.config
      .findUnique({
        where: { id: 1 },
        select: {
          authSecret: true,
          adminSessionSecret: true,
        },
      })
      .catch(() => null),
  ]);

  const acceptedSecrets = [
    normalizeSecret(runtimeConfig?.authSecret),
    normalizeSecret(runtimeConfig?.adminSessionSecret),
    normalizeSecret(configRow?.authSecret),
    normalizeSecret(configRow?.adminSessionSecret),
  ].filter((value): value is string => Boolean(value));

  if (!acceptedSecrets.includes(providedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  invalidateRuntimeConfigCache();
  invalidatePlatformConfigCache();
  invalidateMarketRegistryCaches();
  invalidateMarketDataCaches();

  return NextResponse.json({ success: true });
}
