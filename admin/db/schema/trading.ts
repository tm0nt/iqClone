import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
  boolean,
  index,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  resultadoEnum,
  settlementJobStatusEnum,
  tradingPairTypeEnum,
  promotionTypeEnum,
  promotionRedemptionStatusEnum,
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
    providerId: integer("providerId").references(() => marketDataProviders.id),
    priceSource: text("priceSource").notNull().default("itick"),
    priceSymbol: text("priceSymbol"),
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
    index("TradingPair_providerId_isActive_displayOrder_idx").on(
      t.providerId,
      t.isActive,
      t.displayOrder,
    ),
  ],
);

export const marketDataProviders = pgTable(
  "MarketDataProvider",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: tradingPairTypeEnum("type").notNull(),
    restBaseUrl: text("restBaseUrl").notNull(),
    wsBaseUrl: text("wsBaseUrl"),
    authType: text("authType").notNull().default("none"),
    authHeaderName: text("authHeaderName"),
    authQueryParam: text("authQueryParam"),
    authToken: text("authToken"),
    envKey: text("envKey"),
    isActive: boolean("isActive").notNull().default(true),
    sortOrder: integer("sortOrder").notNull().default(0),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("MarketDataProvider_type_isActive_sortOrder_idx").on(
      t.type,
      t.isActive,
      t.sortOrder,
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
    resolvedAt: timestamp("resolvedAt", { precision: 3 }),
    valor: doublePrecision("valor").notNull(),
    durationSeconds: integer("durationSeconds").notNull().default(0),
    payoutRateSnapshot: doublePrecision("payoutRateSnapshot")
      .notNull()
      .default(0.9),
    minPriceVariation: doublePrecision("minPriceVariation")
      .notNull()
      .default(0),
    settlementTolerance: doublePrecision("settlementTolerance")
      .notNull()
      .default(0),
    settlementGraceSeconds: integer("settlementGraceSeconds")
      .notNull()
      .default(0),
    providerSlug: text("providerSlug"),
    marketSymbol: text("marketSymbol"),
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
    index("TradeOperation_userId_resolvedAt_idx").on(t.userId, t.resolvedAt),
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

export const promotions = pgTable(
  "Promotion",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    rulesText: text("rulesText"),
    type: promotionTypeEnum("type").notNull(),
    bonusPercent: doublePrecision("bonusPercent"),
    bonusFixedAmount: doublePrecision("bonusFixedAmount"),
    maxBonusAmount: doublePrecision("maxBonusAmount"),
    revenueMultiplier: doublePrecision("revenueMultiplier"),
    minDepositAmount: doublePrecision("minDepositAmount"),
    maxClaimsTotal: integer("maxClaimsTotal"),
    validFrom: timestamp("validFrom", { precision: 3 }),
    validUntil: timestamp("validUntil", { precision: 3 }),
    isActive: boolean("isActive").notNull().default(true),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("Promotion_type_isActive_validUntil_idx").on(
      t.type,
      t.isActive,
      t.validUntil,
    ),
  ],
);

export const promotionRedemptions = pgTable(
  "PromotionRedemption",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promotionId: uuid("promotionId").notNull().references(() => promotions.id),
    userId: text("userId").notNull().references(() => users.id),
    status: promotionRedemptionStatusEnum("status").notNull().default("active"),
    redeemedAt: timestamp("redeemedAt", { precision: 3 }).notNull().defaultNow(),
    consumedAt: timestamp("consumedAt", { precision: 3 }),
    expiresAt: timestamp("expiresAt", { precision: 3 }),
    appliedReference: text("appliedReference"),
    rewardValue: doublePrecision("rewardValue"),
  },
  (t) => [
    index("PromotionRedemption_userId_status_expiresAt_idx").on(
      t.userId,
      t.status,
      t.expiresAt,
    ),
    index("PromotionRedemption_promotionId_status_idx").on(
      t.promotionId,
      t.status,
    ),
  ],
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

export const tradingPairsRelations = relations(tradingPairs, ({ many, one }) => ({
  operations: many(tradeOperations),
  marketProvider: one(marketDataProviders, {
    fields: [tradingPairs.providerId],
    references: [marketDataProviders.id],
  }),
}));

export const marketDataProvidersRelations = relations(
  marketDataProviders,
  ({ many }) => ({
    tradingPairs: many(tradingPairs),
  }),
);

export const promotionsRelations = relations(promotions, ({ many }) => ({
  redemptions: many(promotionRedemptions),
}));

export const promotionRedemptionsRelations = relations(
  promotionRedemptions,
  ({ one }) => ({
    promotion: one(promotions, {
      fields: [promotionRedemptions.promotionId],
      references: [promotions.id],
    }),
    user: one(users, {
      fields: [promotionRedemptions.userId],
      references: [users.id],
    }),
  }),
);

export const operationSettlementJobsRelations = relations(
  operationSettlementJobs,
  ({ one }) => ({
    operation: one(tradeOperations, {
      fields: [operationSettlementJobs.operationId],
      references: [tradeOperations.id],
    }),
  }),
);
