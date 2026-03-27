import { db } from "@/db";
import { configs, gateways, marketDataProviders } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getConfig() {
  const rows = await db.query.configs.findFirst({
    with: {
      gatewayPixDeposito: true,
      gatewayPixSaque: true,
      creditCardDeposit: true,
      cryptoDeposit: true,
      cryptoSaque: true,
    },
  });

  return rows ?? null;
}

export async function getMarketProviders() {
  return db
    .select()
    .from(marketDataProviders)
    .orderBy(asc(marketDataProviders.sortOrder), asc(marketDataProviders.name));
}

export async function upsertConfig(data: Partial<typeof configs.$inferInsert>) {
  const existing = await db.select({ id: configs.id }).from(configs).limit(1);

  if (existing[0]) {
    await db
      .update(configs)
      .set(data)
      .where(eq(configs.id, existing[0].id))
      .returning();
  } else {
    await db.insert(configs).values(data).returning();
  }

  const config = await getConfig();
  if (!config) {
    throw new Error("Falha ao persistir configuracao.");
  }
  return config;
}

export async function getGatewayById(id: number) {
  const rows = await db
    .select()
    .from(gateways)
    .where(eq(gateways.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateMarketProviders(
  updates: Array<{
    id: number;
    authToken?: string | null;
    isActive?: boolean;
  }>,
) {
  for (const update of updates) {
    const payload: Partial<typeof marketDataProviders.$inferInsert> = {};

    if (update.authToken !== undefined) {
      payload.authToken = update.authToken;
    }

    if (update.isActive !== undefined) {
      payload.isActive = update.isActive;
    }

    if (Object.keys(payload).length === 0) {
      continue;
    }

    await db
      .update(marketDataProviders)
      .set(payload)
      .where(eq(marketDataProviders.id, update.id));
  }

  return getMarketProviders();
}
