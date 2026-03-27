import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { kycStatusEnum, kycTypeEnum } from "./enums";

// =================== User ===================
export const users = pgTable(
  "User",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    nome: text("nome").notNull(),
    senha: text("senha").notNull(),
    cpf: text("cpf").unique(),
    nacionalidade: text("nacionalidade"),
    documentoTipo: text("documentoTipo"),
    documentoNumero: text("documentoNumero"),
    ddi: text("ddi"),
    telefone: text("telefone"),
    dataNascimento: timestamp("dataNascimento", { precision: 3 }),
    avatarUrl: text("avatarUrl"),
    kyc: kycStatusEnum("kyc"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
    affiliateId: text("affiliateId"),
  },
  (t) => [index("User_createdAt_idx").on(t.createdAt), index("User_affiliateId_idx").on(t.affiliateId)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  balance: one(balances, { fields: [users.id], references: [balances.userId] }),
  activities: many(userActivities),
  logs: many(userLogs),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  operations: many(tradeOperations),
  auditLogs: many(auditLogs),
  kycs: many(kycs),
  creditCards: many(creditCards),
  promotionRedemptions: many(promotionRedemptions),
}));

// =================== KYC ===================
export const kycs = pgTable(
  "KYC",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    status: kycStatusEnum("status").notNull(),
    type: kycTypeEnum("type").notNull(),
    paths: jsonb("paths").notNull(),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [index("KYC_userId_idx").on(t.userId), index("KYC_status_idx").on(t.status)],
);

export const kycsRelations = relations(kycs, ({ one }) => ({
  user: one(users, { fields: [kycs.userId], references: [users.id] }),
}));

// =================== Balance ===================
export const balances = pgTable("Balance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().unique().references(() => users.id),
  saldoDemo: doublePrecision("saldoDemo").notNull().default(0.0),
  saldoComissao: doublePrecision("saldoComissao").notNull().default(0.0),
  saldoReal: doublePrecision("saldoReal").notNull().default(0.0),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
});

export const balancesRelations = relations(balances, ({ one }) => ({
  user: one(users, { fields: [balances.userId], references: [users.id] }),
}));

// =================== UserLog ===================
export const userLogs = pgTable("UserLog", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().references(() => users.id),
  acao: text("acao").notNull(),
  descricao: text("descricao").notNull(),
  ip: text("ip").notNull(),
  userAgent: text("userAgent").notNull(),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
});

export const userLogsRelations = relations(userLogs, ({ one }) => ({
  user: one(users, { fields: [userLogs.userId], references: [users.id] }),
}));

// =================== UserActivity ===================
export const userActivities = pgTable(
  "UserActivity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    activityType: text("activityType").notNull(),
    device: text("device").notNull(),
    ipAddress: text("ipAddress").notNull(),
    location: text("location"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  },
  (t) => [index("UserActivity_userId_idx").on(t.userId), index("UserActivity_createdAt_idx").on(t.createdAt)],
);

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, { fields: [userActivities.userId], references: [users.id] }),
}));

// Forward-references para relações circulares (importados de outros schemas)
// Estes imports serão resolvidos pelo barrel em index.ts
import { deposits } from "./finance";
import { withdrawals } from "./finance";
import { creditCards } from "./finance";
import { promotionRedemptions, tradeOperations } from "./trading";
import { auditLogs } from "./audit";
