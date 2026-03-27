import { db } from "@/db";
import { gateways } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getGateways() {
  return db.select().from(gateways);
}

export async function createGateway(data: typeof gateways.$inferInsert) {
  const rows = await db.insert(gateways).values(data).returning();
  return rows[0]!;
}

export async function updateGateway(
  id: number,
  data: Partial<typeof gateways.$inferInsert>,
) {
  const rows = await db
    .update(gateways)
    .set(data)
    .where(eq(gateways.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteGateway(id: number) {
  return db.delete(gateways).where(eq(gateways.id, id));
}
