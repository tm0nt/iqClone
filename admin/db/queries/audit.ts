import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getAuditLogs(opts: { take?: number; offset?: number } = {}) {
  const { take = 50, offset = 0 } = opts;

  return db
    .select({
      id: auditLogs.id,
      userId: auditLogs.userId,
      entidade: auditLogs.entidade,
      entidadeId: auditLogs.entidadeId,
      acao: auditLogs.acao,
      valoresAntigos: auditLogs.valoresAntigos,
      valoresNovos: auditLogs.valoresNovos,
      createdAt: auditLogs.createdAt,
      userName: users.nome,
      userEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(take)
    .offset(offset);
}
