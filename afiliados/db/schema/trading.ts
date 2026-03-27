import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  boolean,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  resultadoEnum,
  settlementJobStatusEnum,
  tradingPairTypeEnum,
} from "./enums";
import { users } from "./users";

export const tradingPairs = pgTable(
  "TradingPair",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    symbol: text("symbol").notNull().unique(),
    name: text("name").notNull(),
    type: tradingPairTypeEnum("type").notNull(),
    provider: text("provider").notNull(),
    payoutRate: doublePrecision("payoutRate").notNull().default(0.9),
    isActive: boolean("isActive").notNull().default(true),
    favorite: boolean("favorite").notNull().default(false),
    displayOrder: integer("displayOrder").notNull().default(0),
    imageUrl: text("imageUrl"),
    color: text("color"),
    logo: text("logo"),
    description: text("description"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("TradingPair_type_isActive_displayOrder_idx").on(
      t.type,
      t.isActive,
      t.displayOrder,
    ),
  ],
);

export const tradeOperations = pgTable(
  "TradeOperation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    pairId: uuid("pairId").references(() => tradingPairs.id),
    tipo: text("tipo"),
    data: timestamp("data", { precision: 3 }).notNull(),
    ativo: text("ativo").notNull(),
    tempo: text("tempo").notNull(),
    previsao: text("previsao").notNull(),
    vela: text("vela").notNull(),
    abertura: doublePrecision("abertura").notNull(),
    fechamento: doublePrecision("fechamento"),
    valor: doublePrecision("valor").notNull(),
    estornado: boolean("estornado").notNull().default(false),
    executado: boolean("executado").notNull().default(false),
    status: text("status").notNull(),
    receita: doublePrecision("receita").notNull().default(0),
    resultado: resultadoEnum("resultado"),
    expiresAt: timestamp("expiresAt", { precision: 3 }),
  },
  (t) => [
    index("TradeOperation_userId_idx").on(t.userId),
    index("TradeOperation_data_idx").on(t.data),
    index("TradeOperation_status_idx").on(t.status),
    index("TradeOperation_ativo_idx").on(t.ativo),
    index("TradeOperation_resultado_expiresAt_idx").on(t.resultado, t.expiresAt),
    index("TradeOperation_userId_resultado_idx").on(t.userId, t.resultado),
    index("TradeOperation_pairId_idx").on(t.pairId),
  ],
);

export const operationSettlementJobs = pgTable(
  "OperationSettlementJob",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    operationId: uuid("operationId").notNull().unique().references(() => tradeOperations.id),
    status: settlementJobStatusEnum("status").notNull().default("pending"),
    scheduledFor: timestamp("scheduledFor", { precision: 3 }).notNull(),
    startedAt: timestamp("startedAt", { precision: 3 }),
    processedAt: timestamp("processedAt", { precision: 3 }),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("lastError"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [index("OperationSettlementJob_status_scheduledFor_idx").on(t.status, t.scheduledFor)],
);

export const tradeOperationsRelations = relations(tradeOperations, ({ one }) => ({
  user: one(users, { fields: [tradeOperations.userId], references: [users.id] }),
  pair: one(tradingPairs, {
    fields: [tradeOperations.pairId],
    references: [tradingPairs.id],
  }),
  settlementJob: one(operationSettlementJobs, {
    fields: [tradeOperations.id],
    references: [operationSettlementJobs.operationId],
  }),
}));

export const tradingPairsRelations = relations(tradingPairs, ({ many }) => ({
  operations: many(tradeOperations),
}));

export const operationSettlementJobsRelations = relations(
  operationSettlementJobs,
  ({ one }) => ({
    operation: one(tradeOperations, {
      fields: [operationSettlementJobs.operationId],
      references: [tradeOperations.id],
    }),
  }),
);
