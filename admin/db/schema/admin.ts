import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { roleEnum } from "./enums";

export const admins = pgTable("Admin", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  senha: text("senha").notNull(),
  nome: text("nome").notNull(),
  telefone: text("telefone"),
  dataCriacao: timestamp("dataCriacao", { precision: 3 }).notNull().defaultNow(),
  nivel: roleEnum("nivel").notNull(),
});
