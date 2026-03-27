import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { acaoAuditoriaEnum } from "./enums";
import { users } from "./users";

export const auditLogs = pgTable(
  "AuditLog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").references(() => users.id),
    entidade: text("entidade").notNull(),
    entidadeId: text("entidadeId").notNull(),
    acao: acaoAuditoriaEnum("acao").notNull(),
    valoresAntigos: jsonb("valoresAntigos"),
    valoresNovos: jsonb("valoresNovos"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  },
  (t) => [
    index("AuditLog_userId_idx").on(t.userId),
    index("AuditLog_createdAt_idx").on(t.createdAt),
    index("AuditLog_entidade_idx").on(t.entidade),
  ],
);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
