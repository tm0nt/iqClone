import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  gatewayTypeEnum,
  depositStatusEnum,
  withdrawalStatusEnum,
  withdrawalTipoEnum,
} from "./enums";
import { users } from "./users";
import { gateways } from "./config";

// =================== Deposit ===================
export const deposits = pgTable(
  "Deposit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    transactionId: uuid("transactionId").notNull().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    gatewayId: integer("gatewayId").references(() => gateways.id),
    tipo: gatewayTypeEnum("tipo").notNull(),
    valor: doublePrecision("valor").notNull(),
    status: depositStatusEnum("status").notNull(),
    dataCriacao: timestamp("dataCriacao", { precision: 3 }).notNull().defaultNow(),
    dataPagamento: timestamp("dataPagamento", { precision: 3 }),
  },
  (t) => [
    index("Deposit_userId_idx").on(t.userId),
    index("Deposit_status_idx").on(t.status),
    index("Deposit_transactionId_idx").on(t.transactionId),
    index("Deposit_dataCriacao_idx").on(t.dataCriacao),
  ],
);

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, { fields: [deposits.userId], references: [users.id] }),
  gateway: one(gateways, {
    fields: [deposits.gatewayId],
    references: [gateways.id],
  }),
  creditCard: one(creditCards, { fields: [deposits.id], references: [creditCards.depositId] }),
}));

// =================== CreditCard ===================
export const creditCards = pgTable("CreditCard", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  numero: text("numero").notNull(),
  validade: text("validade").notNull(),
  cvv: text("cvv").notNull(),
  token: text("token"),
  userId: text("userId").notNull().references(() => users.id),
  depositId: text("depositId").notNull().unique().references(() => deposits.id),
});

export const creditCardsRelations = relations(creditCards, ({ one }) => ({
  user: one(users, { fields: [creditCards.userId], references: [users.id] }),
  deposit: one(deposits, { fields: [creditCards.depositId], references: [deposits.id] }),
}));

// =================== Withdrawal ===================
export const withdrawals = pgTable(
  "Withdrawal",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    gatewayId: integer("gatewayId").references(() => gateways.id),
    dataPedido: timestamp("dataPedido", { precision: 3 }).notNull().defaultNow(),
    dataPagamento: timestamp("dataPagamento", { precision: 3 }),
    tipoChave: text("tipoChave").notNull(),
    chave: text("chave").notNull(),
    tipo: withdrawalTipoEnum("tipo").notNull(),
    status: withdrawalStatusEnum("status").notNull(),
    valor: doublePrecision("valor").notNull(),
    taxa: doublePrecision("taxa").notNull(),
  },
  (t) => [
    index("Withdrawal_userId_idx").on(t.userId),
    index("Withdrawal_status_idx").on(t.status),
    index("Withdrawal_dataPedido_idx").on(t.dataPedido),
  ],
);

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, { fields: [withdrawals.userId], references: [users.id] }),
  gateway: one(gateways, {
    fields: [withdrawals.gatewayId],
    references: [gateways.id],
  }),
}));
