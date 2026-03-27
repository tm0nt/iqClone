import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  doublePrecision,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { platformEnum, statusEnum, dispatchStatusEnum } from "./enums";
import { users } from "./users";
import { affiliates } from "./affiliate";

// =================== PostbackConfig ===================
export const postbackConfigs = pgTable(
  "PostbackConfig",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    affiliateId: text("affiliateId").references(() => affiliates.id),
    userId: text("userId").references(() => users.id),
    url: text("url").notNull(),
    platform: platformEnum("platform").notNull(),
    active: statusEnum("active").notNull().default("ACTIVE"),
    conversionType: text("conversionType"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("PostbackConfig_affiliateId_idx").on(t.affiliateId),
    index("PostbackConfig_userId_idx").on(t.userId),
  ],
);

export const postbackConfigsRelations = relations(postbackConfigs, ({ one, many }) => ({
  affiliate: one(affiliates, { fields: [postbackConfigs.affiliateId], references: [affiliates.id] }),
  user: one(users, { fields: [postbackConfigs.userId], references: [users.id] }),
  logs: many(postbackLogs),
}));

// =================== PostbackLog ===================
export const postbackLogs = pgTable(
  "PostbackLog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postbackConfigId: text("postbackConfigId").notNull().references(() => postbackConfigs.id),
    affiliateId: text("affiliateId"),
    dispatchTime: timestamp("dispatchTime", { precision: 3 }).notNull().defaultNow(),
    status: dispatchStatusEnum("status").notNull(),
    successRate: doublePrecision("successRate"),
    responseCode: integer("responseCode"),
    responseMessage: text("responseMessage"),
    payload: jsonb("payload"),
    errorDetails: text("errorDetails"),
  },
  (t) => [index("PostbackLog_postbackConfigId_idx").on(t.postbackConfigId)],
);

export const postbackLogsRelations = relations(postbackLogs, ({ one }) => ({
  postbackConfig: one(postbackConfigs, { fields: [postbackLogs.postbackConfigId], references: [postbackConfigs.id] }),
}));

// =================== WebhookConfig ===================
export const webhookConfigs = pgTable(
  "WebhookConfig",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("userId").notNull().references(() => users.id),
    url: text("url").notNull(),
    eventType: text("eventType").notNull(),
    active: statusEnum("active").notNull().default("ACTIVE"),
    notes: text("notes"),
    createdAt: timestamp("createdAt", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updatedAt", { precision: 3 }).notNull().$onUpdate(() => new Date()),
  },
  (t) => [index("WebhookConfig_userId_idx").on(t.userId)],
);

export const webhookConfigsRelations = relations(webhookConfigs, ({ one, many }) => ({
  user: one(users, { fields: [webhookConfigs.userId], references: [users.id] }),
  logs: many(webhookLogs),
}));

// =================== WebhookLog ===================
export const webhookLogs = pgTable(
  "WebhookLog",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    webhookConfigId: text("webhookConfigId").notNull().references(() => webhookConfigs.id),
    userId: text("userId").notNull(),
    dispatchTime: timestamp("dispatchTime", { precision: 3 }).notNull().defaultNow(),
    status: dispatchStatusEnum("status").notNull(),
    responseCode: integer("responseCode"),
    responseMessage: text("responseMessage"),
    payload: jsonb("payload"),
    errorDetails: text("errorDetails"),
  },
  (t) => [index("WebhookLog_webhookConfigId_idx").on(t.webhookConfigId)],
);

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  webhookConfig: one(webhookConfigs, { fields: [webhookLogs.webhookConfigId], references: [webhookConfigs.id] }),
}));
