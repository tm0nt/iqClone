import {
  pgTable,
  uuid,
  text,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { tipoComissaoEnum, commissionStatusEnum } from "./enums";
import { users } from "./users";

// =================== Affiliate ===================
export const affiliates = pgTable("Affiliate", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("userId").notNull().unique().references(() => users.id),
  tipoComissao: tipoComissaoEnum("tipoComissao"),
  split: text("split"),
  splitValue: doublePrecision("splitValue"),
  createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
});

export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  user: one(users, { fields: [affiliates.userId], references: [users.id] }),
  clicks: many(clickEvents),
  pixelEvents: many(pixelEvents),
  commissions: many(affiliateCommissions),
}));

// =================== AffiliateCommission ===================
export const affiliateCommissions = pgTable("AffiliateCommission", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: text("affiliateId").notNull().references(() => affiliates.id),
  userId: text("userId").references(() => users.id),
  depositId: text("depositId"),
  operationId: text("operationId"),
  tipo: tipoComissaoEnum("tipo").notNull(),
  valor: doublePrecision("valor").notNull(),
  percentual: doublePrecision("percentual"),
  descricao: text("descricao"),
  data: timestamp("data", { precision: 3 }).notNull().defaultNow(),
  status: commissionStatusEnum("status").notNull().default("pendente"),
});

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({ one }) => ({
  affiliate: one(affiliates, { fields: [affiliateCommissions.affiliateId], references: [affiliates.id] }),
  user: one(users, { fields: [affiliateCommissions.userId], references: [users.id] }),
}));

// =================== ClickEvent ===================
export const clickEvents = pgTable("ClickEvent", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: text("affiliateId").notNull().references(() => affiliates.id),
  url: text("url").notNull(),
  data: timestamp("data", { precision: 3 }).notNull().defaultNow(),
});

export const clickEventsRelations = relations(clickEvents, ({ one }) => ({
  affiliate: one(affiliates, { fields: [clickEvents.affiliateId], references: [affiliates.id] }),
}));

// =================== PixelEvent ===================
export const pixelEvents = pgTable("PixelEvent", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: text("affiliateId").notNull().references(() => affiliates.id),
  eventName: text("eventName").notNull(),
  data: timestamp("data", { precision: 3 }).notNull().defaultNow(),
});

export const pixelEventsRelations = relations(pixelEvents, ({ one }) => ({
  affiliate: one(affiliates, { fields: [pixelEvents.affiliateId], references: [affiliates.id] }),
}));
