import {
  pgTable,
  serial,
  text,
  doublePrecision,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { gatewayTypeEnum } from "./enums";

// =================== Gateways ===================
export const gateways = pgTable("Gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull().default("custom"),
  endpoint: text("endpoint").notNull(),
  tokenPublico: text("tokenPublico").notNull(),
  tokenPrivado: text("tokenPrivado").notNull(),
  split: text("split"),
  splitValue: doublePrecision("splitValue"),
  type: gatewayTypeEnum("type").notNull(),
  isActive: boolean("isActive").notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
});

export const gatewaysRelations = relations(gateways, ({ many }) => ({
  pixDepositoConfigs: many(configs, { relationName: "PixDeposito" }),
  pixSaqueConfigs: many(configs, { relationName: "PixSaque" }),
  creditCardDeposits: many(configs, { relationName: "CreditCardDeposito" }),
  cryptoDeposits: many(configs, { relationName: "CryptoDeposito" }),
  cryptoSaques: many(configs, { relationName: "CryptoSaque" }),
}));

// =================== Config ===================
export const configs = pgTable("Config", {
  id: serial("id").primaryKey(),
  nomeSite: text("nomeSite").notNull().default("Bincebroker"),
  urlSite: text("urlSite").notNull().default("https://app.bincebroker.com/"),
  logoUrlDark: text("logoUrlDark").notNull().default("/nextbrokers.png"),
  logoUrlWhite: text("logoUrlWhite").notNull().default("/nextbrokers.png"),
  logoUrlMobile: text("logoUrlMobile"),
  supportUrl: text("supportUrl"),
  supportAvailabilityText: text("supportAvailabilityText")
    .notNull()
    .default("TODO DIA, A TODA HORA"),
  platformTimezone: text("platformTimezone")
    .notNull()
    .default("America/Sao_Paulo"),
  chartBackgroundUrl: text("chartBackgroundUrl"),
  faviconUrl: text("faviconUrl"),
  candleUpColor: text("candleUpColor"),
  candleDownColor: text("candleDownColor"),
  chartGridColor: text("chartGridColor"),
  primaryColor: text("primaryColor").notNull().default("#1ca06d"),
  primaryHoverColor: text("primaryHoverColor").notNull().default("#0b7250"),
  accentColor: text("accentColor").notNull().default("#3b82f6"),
  warningColor: text("warningColor").notNull().default("#f59e0b"),
  demoColor: text("demoColor").notNull().default("#f97316"),
  demoHoverColor: text("demoHoverColor").notNull().default("#ea580c"),
  primaryGradientFrom: text("primaryGradientFrom").notNull().default("#0b7250"),
  primaryGradientVia: text("primaryGradientVia").notNull().default("#1ca06d"),
  primaryGradientTo: text("primaryGradientTo").notNull().default("#3cd385"),
  buttonTextColor: text("buttonTextColor").notNull().default("#ffffff"),
  backgroundColor: text("backgroundColor").notNull().default("#252b3b"),
  surfaceColor: text("surfaceColor").notNull().default("#364152"),
  surfaceAltColor: text("surfaceAltColor").notNull().default("#2a3441"),
  cardColor: text("cardColor").notNull().default("#1e293b"),
  borderColor: text("borderColor").notNull().default("#2a3441"),
  overlayBackdropColor: text("overlayBackdropColor")
    .notNull()
    .default("#0f172a"),
  overlaySurfaceColor: text("overlaySurfaceColor").notNull().default("#1e293b"),
  overlayBorderColor: text("overlayBorderColor").notNull().default("#334155"),
  overlayCardColor: text("overlayCardColor").notNull().default("#334155"),
  overlayHoverColor: text("overlayHoverColor").notNull().default("#3a4551"),
  overlayMutedTextColor: text("overlayMutedTextColor")
    .notNull()
    .default("#94a3b8"),
  headerGradientFrom: text("headerGradientFrom").notNull().default("#1a1d29"),
  headerGradientTo: text("headerGradientTo").notNull().default("#252b3b"),
  headerTextColor: text("headerTextColor").notNull().default("#ffffff"),
  mutedTextColor: text("mutedTextColor").notNull().default("#a1a8b3"),
  authBackgroundColor: text("authBackgroundColor").notNull().default("#ffffff"),
  inputBackgroundColor: text("inputBackgroundColor")
    .notNull()
    .default("#1a1a1a"),
  inputBorderColor: text("inputBorderColor").notNull().default("#2a2a2a"),
  inputLabelColor: text("inputLabelColor").notNull().default("#999999"),
  inputSubtleTextColor: text("inputSubtleTextColor")
    .notNull()
    .default("#666666"),
  loadingBackgroundColor: text("loadingBackgroundColor")
    .notNull()
    .default("#ffffff"),
  loadingTrackColor: text("loadingTrackColor").notNull().default("#d1d5db"),
  loadingGradientFrom: text("loadingGradientFrom").notNull().default("#0b7250"),
  loadingGradientVia: text("loadingGradientVia").notNull().default("#1ca06d"),
  loadingGradientTo: text("loadingGradientTo").notNull().default("#3cd385"),
  successColor: text("successColor").notNull().default("#16a34a"),
  dangerColor: text("dangerColor").notNull().default("#dc2626"),
  textColor: text("textColor").notNull().default("#ffffff"),
  iconColor: text("iconColor").notNull().default("#a1a8b3"),
  iconBgColor: text("iconBgColor").notNull().default("#364152"),
  positiveColor: text("positiveColor").notNull().default("#22c55e"),
  negativeColor: text("negativeColor").notNull().default("#ef4444"),
  chartPriceTagColor: text("chartPriceTagColor").notNull().default("#d88a31"),
  authSecret: text("authSecret"),
  adminSessionSecret: text("adminSessionSecret"),
  settleSecret: text("settleSecret"),
  googleClientId: text("googleClientId"),
  googleClientSecret: text("googleClientSecret"),
  tradingMinPriceVariation: doublePrecision("tradingMinPriceVariation")
    .notNull()
    .default(0),
  tradingSettlementTolerance: doublePrecision("tradingSettlementTolerance")
    .notNull()
    .default(0),
  tradingDefaultExpiryMinutes: integer("tradingDefaultExpiryMinutes")
    .notNull()
    .default(5),
  tradingExpiryOptions: text("tradingExpiryOptions")
    .notNull()
    .default("1,5,10,15,30,60,1440"),
  tradingSettlementGraceSeconds: integer("tradingSettlementGraceSeconds")
    .notNull()
    .default(2),
  cpaMin: doublePrecision("cpaMin").notNull().default(30),
  cpaValor: doublePrecision("cpaValor").notNull().default(15),
  revShareFalsoValue: doublePrecision("revShareFalsoValue")
    .notNull()
    .default(85),
  revShareNegativo: doublePrecision("revShareNegativo"),
  revShareValue: doublePrecision("revShareValue").notNull().default(35),
  taxa: doublePrecision("taxa").notNull().default(10),
  valorMinimoSaque: doublePrecision("valorMinimoSaque").notNull().default(100),
  valorMinimoDeposito: doublePrecision("valorMinimoDeposito")
    .notNull()
    .default(60),
  postbackUrl: text("postbackUrl"),
  googleAnalyticsId: text("googleAnalyticsId"),
  googleTagManagerId: text("googleTagManagerId"),
  facebookPixelId: text("facebookPixelId"),
  trackRegisterEvents: boolean("trackRegisterEvents")
    .notNull()
    .default(true),
  trackDepositEvents: boolean("trackDepositEvents")
    .notNull()
    .default(true),
  trackWithdrawalEvents: boolean("trackWithdrawalEvents")
    .notNull()
    .default(true),
  depositGatewayMode: text("depositGatewayMode").notNull().default("manual"),
  withdrawGatewayMode: text("withdrawGatewayMode").notNull().default("manual"),
  lastPixDepositGatewayId: integer("lastPixDepositGatewayId"),
  lastPixWithdrawalGatewayId: integer("lastPixWithdrawalGatewayId"),
  lastCreditDepositGatewayId: integer("lastCreditDepositGatewayId"),
  lastCryptoDepositGatewayId: integer("lastCryptoDepositGatewayId"),
  lastCryptoWithdrawalGatewayId: integer("lastCryptoWithdrawalGatewayId"),
  criadoEm: timestamp("criadoEm", { precision: 3 }).notNull().defaultNow(),
  gatewayPixDepositoId: integer("gatewayPixDepositoId").references(
    () => gateways.id,
  ),
  gatewayPixSaqueId: integer("gatewayPixSaqueId").references(() => gateways.id),
  creditCardDepositId: integer("creditCardDepositId").references(
    () => gateways.id,
  ),
  cryptoDepositId: integer("cryptoDepositId").references(() => gateways.id),
  cryptoSaqueId: integer("cryptoSaqueId").references(() => gateways.id),
});

export const configsRelations = relations(configs, ({ one }) => ({
  gatewayPixDeposito: one(gateways, {
    fields: [configs.gatewayPixDepositoId],
    references: [gateways.id],
    relationName: "PixDeposito",
  }),
  gatewayPixSaque: one(gateways, {
    fields: [configs.gatewayPixSaqueId],
    references: [gateways.id],
    relationName: "PixSaque",
  }),
  creditCardDeposit: one(gateways, {
    fields: [configs.creditCardDepositId],
    references: [gateways.id],
    relationName: "CreditCardDeposito",
  }),
  cryptoDeposit: one(gateways, {
    fields: [configs.cryptoDepositId],
    references: [gateways.id],
    relationName: "CryptoDeposito",
  }),
  cryptoSaque: one(gateways, {
    fields: [configs.cryptoSaqueId],
    references: [gateways.id],
    relationName: "CryptoSaque",
  }),
}));
