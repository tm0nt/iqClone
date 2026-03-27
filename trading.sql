--
-- PostgreSQL database dump
--

\restrict 4YCdqaj9FfTXVb9vZRaoNBI6IDMZhkEGDYDZWb4cH1mlAFdzhujtBDIcor2ABwX

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: brx
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO brx;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: brx
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AcaoAuditoria; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."AcaoAuditoria" AS ENUM (
    'create',
    'update',
    'delete'
);


ALTER TYPE public."AcaoAuditoria" OWNER TO brx;

--
-- Name: CommissionStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."CommissionStatus" AS ENUM (
    'pendente',
    'paga',
    'cancelada'
);


ALTER TYPE public."CommissionStatus" OWNER TO brx;

--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'concluido',
    'pendente',
    'cancelado',
    'processando'
);


ALTER TYPE public."DepositStatus" OWNER TO brx;

--
-- Name: DispatchStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."DispatchStatus" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PENDING'
);


ALTER TYPE public."DispatchStatus" OWNER TO brx;

--
-- Name: GatewayType; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."GatewayType" AS ENUM (
    'credit',
    'pix',
    'crypto'
);


ALTER TYPE public."GatewayType" OWNER TO brx;

--
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'APPROVED',
    'PENDING',
    'REJECT'
);


ALTER TYPE public."KYCStatus" OWNER TO brx;

--
-- Name: KYCType; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."KYCType" AS ENUM (
    'CNH',
    'RG',
    'PASSAPORTE'
);


ALTER TYPE public."KYCType" OWNER TO brx;

--
-- Name: MarketDataProviderAuthType; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."MarketDataProviderAuthType" AS ENUM (
    'none',
    'header',
    'query'
);


ALTER TYPE public."MarketDataProviderAuthType" OWNER TO brx;

--
-- Name: Platform; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."Platform" AS ENUM (
    'GOOGLE',
    'TIKTOK',
    'FACEBOOK',
    'KWAI',
    'CUSTOM'
);


ALTER TYPE public."Platform" OWNER TO brx;

--
-- Name: PromotionRedemptionStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."PromotionRedemptionStatus" AS ENUM (
    'active',
    'consumed',
    'expired',
    'cancelled'
);


ALTER TYPE public."PromotionRedemptionStatus" OWNER TO brx;

--
-- Name: PromotionType; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."PromotionType" AS ENUM (
    'deposit_bonus',
    'revenue_multiplier'
);


ALTER TYPE public."PromotionType" OWNER TO brx;

--
-- Name: Resultado; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."Resultado" AS ENUM (
    'ganho',
    'perda',
    'pendente'
);


ALTER TYPE public."Resultado" OWNER TO brx;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'ASSISTANT_ADMIN'
);


ALTER TYPE public."Role" OWNER TO brx;

--
-- Name: SettlementJobStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."SettlementJobStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


ALTER TYPE public."SettlementJobStatus" OWNER TO brx;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."Status" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."Status" OWNER TO brx;

--
-- Name: TipoComissao; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."TipoComissao" AS ENUM (
    'cpa',
    'revShare'
);


ALTER TYPE public."TipoComissao" OWNER TO brx;

--
-- Name: TradingPairType; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."TradingPairType" AS ENUM (
    'forex',
    'crypto'
);


ALTER TYPE public."TradingPairType" OWNER TO brx;

--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'concluido',
    'pendente',
    'cancelado',
    'processando'
);


ALTER TYPE public."WithdrawalStatus" OWNER TO brx;

--
-- Name: WithdrawalTipo; Type: TYPE; Schema: public; Owner: brx
--

CREATE TYPE public."WithdrawalTipo" AS ENUM (
    'afiliado',
    'usuario'
);


ALTER TYPE public."WithdrawalTipo" OWNER TO brx;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Account" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


ALTER TABLE public."Account" OWNER TO brx;

--
-- Name: Admin; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Admin" (
    id text NOT NULL,
    email text NOT NULL,
    senha text NOT NULL,
    nome text NOT NULL,
    telefone text,
    "dataCriacao" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nivel public."Role" NOT NULL
);


ALTER TABLE public."Admin" OWNER TO brx;

--
-- Name: Affiliate; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Affiliate" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "tipoComissao" public."TipoComissao",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    split text,
    "splitValue" double precision
);


ALTER TABLE public."Affiliate" OWNER TO brx;

--
-- Name: AffiliateCommission; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."AffiliateCommission" (
    id text NOT NULL,
    "affiliateId" text NOT NULL,
    tipo public."TipoComissao" NOT NULL,
    valor double precision NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."CommissionStatus" DEFAULT 'pendente'::public."CommissionStatus" NOT NULL,
    "userId" text,
    "depositId" text,
    "operationId" text,
    percentual double precision,
    descricao text
);


ALTER TABLE public."AffiliateCommission" OWNER TO brx;

--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."AuditLog" (
    id text NOT NULL,
    "userId" text,
    entidade text NOT NULL,
    "entidadeId" text NOT NULL,
    acao public."AcaoAuditoria" NOT NULL,
    "valoresAntigos" jsonb,
    "valoresNovos" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AuditLog" OWNER TO brx;

--
-- Name: Balance; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Balance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "saldoDemo" double precision DEFAULT 0.0 NOT NULL,
    "saldoReal" double precision DEFAULT 0.0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "saldoComissao" double precision DEFAULT 0.0 NOT NULL
);


ALTER TABLE public."Balance" OWNER TO brx;

--
-- Name: ClickEvent; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."ClickEvent" (
    id text NOT NULL,
    "affiliateId" text NOT NULL,
    url text NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClickEvent" OWNER TO brx;

--
-- Name: Config; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Config" (
    id integer NOT NULL,
    "nomeSite" text DEFAULT 'Bincebroker'::text NOT NULL,
    "valorMinimoSaque" double precision DEFAULT 100 NOT NULL,
    "valorMinimoDeposito" double precision DEFAULT 60 NOT NULL,
    "criadoEm" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    taxa double precision DEFAULT 10 NOT NULL,
    "cpaMin" double precision DEFAULT 30 NOT NULL,
    "cpaValor" double precision DEFAULT 15 NOT NULL,
    "revShareFalsoValue" double precision DEFAULT 85 NOT NULL,
    "revShareValue" double precision DEFAULT 35 NOT NULL,
    "urlSite" text DEFAULT 'https://app.bincebroker.com/'::text NOT NULL,
    "logoUrlDark" text DEFAULT 'default-logo.png'::text NOT NULL,
    "logoUrlWhite" text DEFAULT 'default-logo.png'::text NOT NULL,
    "postbackUrl" text,
    "revShareNegativo" double precision,
    "creditCardDepositId" integer,
    "cryptoDepositId" integer,
    "cryptoSaqueId" integer,
    "gatewayPixDepositoId" integer,
    "gatewayPixSaqueId" integer,
    "primaryColor" text DEFAULT '#1ca06d'::text NOT NULL,
    "primaryHoverColor" text DEFAULT '#0b7250'::text NOT NULL,
    "primaryGradientFrom" text DEFAULT '#0b7250'::text NOT NULL,
    "primaryGradientVia" text DEFAULT '#1ca06d'::text NOT NULL,
    "primaryGradientTo" text DEFAULT '#3cd385'::text NOT NULL,
    "buttonTextColor" text DEFAULT '#ffffff'::text NOT NULL,
    "backgroundColor" text DEFAULT '#252b3b'::text NOT NULL,
    "surfaceColor" text DEFAULT '#364152'::text NOT NULL,
    "surfaceAltColor" text DEFAULT '#2a3441'::text NOT NULL,
    "cardColor" text DEFAULT '#1e293b'::text NOT NULL,
    "borderColor" text DEFAULT '#2a3441'::text NOT NULL,
    "headerGradientFrom" text DEFAULT '#1a1d29'::text NOT NULL,
    "headerGradientTo" text DEFAULT '#252b3b'::text NOT NULL,
    "headerTextColor" text DEFAULT '#ffffff'::text NOT NULL,
    "mutedTextColor" text DEFAULT '#a1a8b3'::text NOT NULL,
    "authBackgroundColor" text DEFAULT '#ffffff'::text NOT NULL,
    "loadingBackgroundColor" text DEFAULT '#ffffff'::text NOT NULL,
    "loadingTrackColor" text DEFAULT '#d1d5db'::text NOT NULL,
    "loadingGradientFrom" text DEFAULT '#0b7250'::text NOT NULL,
    "loadingGradientVia" text DEFAULT '#1ca06d'::text NOT NULL,
    "loadingGradientTo" text DEFAULT '#3cd385'::text NOT NULL,
    "successColor" text DEFAULT '#16a34a'::text NOT NULL,
    "dangerColor" text DEFAULT '#dc2626'::text NOT NULL,
    "depositGatewayMode" text DEFAULT 'manual'::text NOT NULL,
    "withdrawGatewayMode" text DEFAULT 'manual'::text NOT NULL,
    "lastPixDepositGatewayId" integer,
    "lastPixWithdrawalGatewayId" integer,
    "lastCreditDepositGatewayId" integer,
    "lastCryptoDepositGatewayId" integer,
    "lastCryptoWithdrawalGatewayId" integer,
    "candleDownColor" text,
    "candleUpColor" text,
    "chartBackgroundUrl" text DEFAULT '/world-map.png'::text,
    "chartGridColor" text,
    "faviconUrl" text,
    "iconBgColor" text DEFAULT '#364152'::text NOT NULL,
    "iconColor" text DEFAULT '#a1a8b3'::text NOT NULL,
    "negativeColor" text DEFAULT '#ef4444'::text NOT NULL,
    "positiveColor" text DEFAULT '#22c55e'::text NOT NULL,
    "textColor" text DEFAULT '#ffffff'::text NOT NULL,
    "accentColor" text DEFAULT '#3b82f6'::text NOT NULL,
    "warningColor" text DEFAULT '#f59e0b'::text NOT NULL,
    "demoColor" text DEFAULT '#f97316'::text NOT NULL,
    "demoHoverColor" text DEFAULT '#ea580c'::text NOT NULL,
    "overlayBackdropColor" text DEFAULT '#0f172a'::text NOT NULL,
    "overlaySurfaceColor" text DEFAULT '#1e293b'::text NOT NULL,
    "overlayBorderColor" text DEFAULT '#334155'::text NOT NULL,
    "overlayCardColor" text DEFAULT '#334155'::text NOT NULL,
    "overlayHoverColor" text DEFAULT '#3a4551'::text NOT NULL,
    "overlayMutedTextColor" text DEFAULT '#94a3b8'::text NOT NULL,
    "inputBackgroundColor" text DEFAULT '#1a1a1a'::text NOT NULL,
    "inputBorderColor" text DEFAULT '#2a2a2a'::text NOT NULL,
    "inputLabelColor" text DEFAULT '#999999'::text NOT NULL,
    "inputSubtleTextColor" text DEFAULT '#666666'::text NOT NULL,
    "chartPriceTagColor" text DEFAULT '#d88a31'::text NOT NULL,
    "authSecret" text,
    "adminSessionSecret" text,
    "settleSecret" text,
    "googleClientId" text,
    "googleClientSecret" text,
    "tradingMinPriceVariation" double precision DEFAULT 0 NOT NULL,
    "tradingSettlementTolerance" double precision DEFAULT 0 NOT NULL,
    "tradingDefaultExpiryMinutes" integer DEFAULT 5 NOT NULL,
    "tradingExpiryOptions" text DEFAULT '1,5,10,15,30,60,1440'::text NOT NULL,
    "tradingSettlementGraceSeconds" integer DEFAULT 2 NOT NULL,
    "supportUrl" text,
    "supportAvailabilityText" text DEFAULT 'TODO DIA, A TODA HORA'::text NOT NULL,
    "platformTimezone" text DEFAULT 'America/Sao_Paulo'::text NOT NULL,
    "googleAnalyticsId" text,
    "googleTagManagerId" text,
    "facebookPixelId" text,
    "trackRegisterEvents" boolean DEFAULT true NOT NULL,
    "trackDepositEvents" boolean DEFAULT true NOT NULL,
    "trackWithdrawalEvents" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Config" OWNER TO brx;

--
-- Name: Config_id_seq; Type: SEQUENCE; Schema: public; Owner: brx
--

CREATE SEQUENCE public."Config_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Config_id_seq" OWNER TO brx;

--
-- Name: Config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brx
--

ALTER SEQUENCE public."Config_id_seq" OWNED BY public."Config".id;


--
-- Name: CreditCard; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."CreditCard" (
    id text NOT NULL,
    nome text NOT NULL,
    numero text NOT NULL,
    validade text NOT NULL,
    cvv text NOT NULL,
    token text,
    "userId" text NOT NULL,
    "depositId" text NOT NULL
);


ALTER TABLE public."CreditCard" OWNER TO brx;

--
-- Name: Deposit; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Deposit" (
    id text NOT NULL,
    "userId" text NOT NULL,
    valor double precision NOT NULL,
    status public."DepositStatus" NOT NULL,
    "dataCriacao" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataPagamento" timestamp(3) without time zone,
    "transactionId" text NOT NULL,
    tipo public."GatewayType" NOT NULL,
    "gatewayId" integer
);


ALTER TABLE public."Deposit" OWNER TO brx;

--
-- Name: Gateways; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Gateways" (
    id integer NOT NULL,
    endpoint text NOT NULL,
    "tokenPublico" text NOT NULL,
    "tokenPrivado" text NOT NULL,
    split text,
    "splitValue" double precision,
    type public."GatewayType" NOT NULL,
    name text NOT NULL,
    provider text DEFAULT 'custom'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Gateways" OWNER TO brx;

--
-- Name: Gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: brx
--

CREATE SEQUENCE public."Gateways_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Gateways_id_seq" OWNER TO brx;

--
-- Name: Gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brx
--

ALTER SEQUENCE public."Gateways_id_seq" OWNED BY public."Gateways".id;


--
-- Name: KYC; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."KYC" (
    id text NOT NULL,
    "userId" text NOT NULL,
    status public."KYCStatus" NOT NULL,
    type public."KYCType" NOT NULL,
    paths jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."KYC" OWNER TO brx;

--
-- Name: MarketDataProvider; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."MarketDataProvider" (
    id integer NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    type public."TradingPairType" NOT NULL,
    "restBaseUrl" text NOT NULL,
    "wsBaseUrl" text,
    "authType" public."MarketDataProviderAuthType" DEFAULT 'none'::public."MarketDataProviderAuthType" NOT NULL,
    "authHeaderName" text,
    "authQueryParam" text,
    "envKey" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authToken" text
);


ALTER TABLE public."MarketDataProvider" OWNER TO brx;

--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE; Schema: public; Owner: brx
--

CREATE SEQUENCE public."MarketDataProvider_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MarketDataProvider_id_seq" OWNER TO brx;

--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brx
--

ALTER SEQUENCE public."MarketDataProvider_id_seq" OWNED BY public."MarketDataProvider".id;


--
-- Name: OperationSettlementJob; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."OperationSettlementJob" (
    id text NOT NULL,
    "operationId" text NOT NULL,
    status public."SettlementJobStatus" DEFAULT 'pending'::public."SettlementJobStatus" NOT NULL,
    "scheduledFor" timestamp(3) without time zone NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "processedAt" timestamp(3) without time zone,
    attempts integer DEFAULT 0 NOT NULL,
    "lastError" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."OperationSettlementJob" OWNER TO brx;

--
-- Name: PixelEvent; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."PixelEvent" (
    id text NOT NULL,
    "affiliateId" text NOT NULL,
    "eventName" text NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PixelEvent" OWNER TO brx;

--
-- Name: PostbackConfig; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."PostbackConfig" (
    id text NOT NULL,
    "affiliateId" text,
    "userId" text,
    url text NOT NULL,
    platform public."Platform" NOT NULL,
    active public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    "conversionType" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PostbackConfig" OWNER TO brx;

--
-- Name: PostbackLog; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."PostbackLog" (
    id text NOT NULL,
    "postbackConfigId" text NOT NULL,
    "affiliateId" text,
    "dispatchTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."DispatchStatus" NOT NULL,
    "successRate" double precision,
    "responseCode" integer,
    "responseMessage" text,
    payload jsonb,
    "errorDetails" text
);


ALTER TABLE public."PostbackLog" OWNER TO brx;

--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Promotion" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text,
    "rulesText" text,
    type public."PromotionType" NOT NULL,
    "bonusPercent" double precision,
    "bonusFixedAmount" double precision,
    "maxBonusAmount" double precision,
    "revenueMultiplier" double precision,
    "minDepositAmount" double precision,
    "maxClaimsTotal" integer,
    "validFrom" timestamp(3) without time zone,
    "validUntil" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Promotion" OWNER TO brx;

--
-- Name: PromotionRedemption; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."PromotionRedemption" (
    id text NOT NULL,
    "promotionId" text NOT NULL,
    "userId" text NOT NULL,
    status public."PromotionRedemptionStatus" DEFAULT 'active'::public."PromotionRedemptionStatus" NOT NULL,
    "redeemedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "consumedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "appliedReference" text,
    "rewardValue" double precision
);


ALTER TABLE public."PromotionRedemption" OWNER TO brx;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO brx;

--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."SystemSettings" (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text DEFAULT 'string'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    description text,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "updatedBy" text
);


ALTER TABLE public."SystemSettings" OWNER TO brx;

--
-- Name: SystemSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: brx
--

CREATE SEQUENCE public."SystemSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."SystemSettings_id_seq" OWNER TO brx;

--
-- Name: SystemSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brx
--

ALTER SEQUENCE public."SystemSettings_id_seq" OWNED BY public."SystemSettings".id;


--
-- Name: TradeOperation; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."TradeOperation" (
    id text NOT NULL,
    "userId" text NOT NULL,
    data timestamp(3) without time zone NOT NULL,
    ativo text NOT NULL,
    tempo text NOT NULL,
    previsao text NOT NULL,
    vela text NOT NULL,
    abertura double precision NOT NULL,
    fechamento double precision,
    valor double precision NOT NULL,
    estornado boolean DEFAULT false NOT NULL,
    executado boolean DEFAULT false NOT NULL,
    status text NOT NULL,
    resultado public."Resultado",
    receita double precision DEFAULT 0 NOT NULL,
    tipo text,
    "expiresAt" timestamp(3) without time zone,
    "pairId" text,
    "resolvedAt" timestamp(3) without time zone,
    "durationSeconds" integer DEFAULT 0 NOT NULL,
    "payoutRateSnapshot" double precision DEFAULT 0.9 NOT NULL,
    "minPriceVariation" double precision DEFAULT 0 NOT NULL,
    "settlementTolerance" double precision DEFAULT 0 NOT NULL,
    "settlementGraceSeconds" integer DEFAULT 0 NOT NULL,
    "providerSlug" text,
    "marketSymbol" text
);


ALTER TABLE public."TradeOperation" OWNER TO brx;

--
-- Name: TradingPair; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."TradingPair" (
    id text NOT NULL,
    symbol text NOT NULL,
    name text NOT NULL,
    type public."TradingPairType" NOT NULL,
    provider text NOT NULL,
    "payoutRate" double precision DEFAULT 0.9 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    favorite boolean DEFAULT false NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "imageUrl" text,
    color text,
    logo text,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "priceSource" text DEFAULT 'itick'::text NOT NULL,
    "priceSymbol" text,
    "minTradeValue" double precision DEFAULT 1 NOT NULL,
    "maxTradeValue" double precision,
    "providerId" integer
);


ALTER TABLE public."TradingPair" OWNER TO brx;

--
-- Name: User; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    nome text,
    senha text,
    cpf text,
    nacionalidade text,
    "documentoTipo" text,
    "documentoNumero" text,
    ddi text,
    telefone text,
    "dataNascimento" timestamp(3) without time zone,
    "avatarUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "affiliateId" text,
    kyc public."KYCStatus",
    "emailVerified" timestamp(3) without time zone,
    image text,
    name text
);


ALTER TABLE public."User" OWNER TO brx;

--
-- Name: UserActivity; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."UserActivity" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "activityType" text NOT NULL,
    device text NOT NULL,
    "ipAddress" text NOT NULL,
    location text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserActivity" OWNER TO brx;

--
-- Name: UserLog; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."UserLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    acao text NOT NULL,
    descricao text NOT NULL,
    ip text NOT NULL,
    "userAgent" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserLog" OWNER TO brx;

--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."VerificationToken" OWNER TO brx;

--
-- Name: WebhookConfig; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."WebhookConfig" (
    id text NOT NULL,
    "userId" text NOT NULL,
    url text NOT NULL,
    "eventType" text NOT NULL,
    active public."Status" DEFAULT 'ACTIVE'::public."Status" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WebhookConfig" OWNER TO brx;

--
-- Name: WebhookLog; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."WebhookLog" (
    id text NOT NULL,
    "webhookConfigId" text NOT NULL,
    "userId" text NOT NULL,
    "dispatchTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."DispatchStatus" NOT NULL,
    "responseCode" integer,
    "responseMessage" text,
    payload jsonb,
    "errorDetails" text
);


ALTER TABLE public."WebhookLog" OWNER TO brx;

--
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."Withdrawal" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "dataPedido" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "dataPagamento" timestamp(3) without time zone,
    "tipoChave" text NOT NULL,
    chave text NOT NULL,
    status public."WithdrawalStatus" NOT NULL,
    valor double precision NOT NULL,
    taxa double precision NOT NULL,
    tipo public."WithdrawalTipo" NOT NULL,
    "gatewayId" integer
);


ALTER TABLE public."Withdrawal" OWNER TO brx;

--
-- Name: WorkerConfig; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public."WorkerConfig" (
    id integer NOT NULL,
    "workerName" text NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "batchSize" integer DEFAULT 50 NOT NULL,
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    "timeoutMs" integer DEFAULT 5000 NOT NULL,
    "retryDelayMs" integer DEFAULT 60000 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."WorkerConfig" OWNER TO brx;

--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: brx
--

CREATE SEQUENCE public."WorkerConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WorkerConfig_id_seq" OWNER TO brx;

--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: brx
--

ALTER SEQUENCE public."WorkerConfig_id_seq" OWNED BY public."WorkerConfig".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: brx
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO brx;

--
-- Name: Config id; Type: DEFAULT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config" ALTER COLUMN id SET DEFAULT nextval('public."Config_id_seq"'::regclass);


--
-- Name: Gateways id; Type: DEFAULT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Gateways" ALTER COLUMN id SET DEFAULT nextval('public."Gateways_id_seq"'::regclass);


--
-- Name: MarketDataProvider id; Type: DEFAULT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."MarketDataProvider" ALTER COLUMN id SET DEFAULT nextval('public."MarketDataProvider_id_seq"'::regclass);


--
-- Name: SystemSettings id; Type: DEFAULT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."SystemSettings" ALTER COLUMN id SET DEFAULT nextval('public."SystemSettings_id_seq"'::regclass);


--
-- Name: WorkerConfig id; Type: DEFAULT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WorkerConfig" ALTER COLUMN id SET DEFAULT nextval('public."WorkerConfig_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Admin" (id, email, senha, nome, telefone, "dataCriacao", nivel) FROM stdin;
c9dc91e1-63ae-44fe-b269-50245bdf91d9	admin@bincebroker.com	$2a$12$dgfVHEOFkY5z0SnDQLBhT.V/PiVzbaXOiXj2Ev3k4xwqrbqVf05Xa	admin	11911223344	2026-03-26 01:15:21.389	SUPER_ADMIN
\.


--
-- Data for Name: Affiliate; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Affiliate" (id, "userId", "tipoComissao", "createdAt", "updatedAt", split, "splitValue") FROM stdin;
54421d3a-7933-4e34-bcb8-4d1d60646e35	144e0f6c-8373-41be-ae2e-55f5d6909205	\N	2026-03-26 03:47:57.634	2026-03-26 03:47:57.634	\N	\N
\.


--
-- Data for Name: AffiliateCommission; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."AffiliateCommission" (id, "affiliateId", tipo, valor, data, status, "userId", "depositId", "operationId", percentual, descricao) FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."AuditLog" (id, "userId", entidade, "entidadeId", acao, "valoresAntigos", "valoresNovos", "createdAt") FROM stdin;
6545d083-8198-47c8-b9ef-710f81a33f0a	144e0f6c-8373-41be-ae2e-55f5d6909205	User	144e0f6c-8373-41be-ae2e-55f5d6909205	create	{}	{"nome": "tassio montenegro", "email": "tassio@gmail.com"}	2026-03-26 03:47:57.634
\.


--
-- Data for Name: Balance; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Balance" (id, "userId", "saldoDemo", "saldoReal", "updatedAt", "saldoComissao") FROM stdin;
99144ec5-b5d9-4680-aa0f-8cce7264bb4a	144e0f6c-8373-41be-ae2e-55f5d6909205	9909.483258220076	0	2026-03-27 05:18:37.783	0
\.


--
-- Data for Name: ClickEvent; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."ClickEvent" (id, "affiliateId", url, data) FROM stdin;
\.


--
-- Data for Name: Config; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Config" (id, "nomeSite", "valorMinimoSaque", "valorMinimoDeposito", "criadoEm", taxa, "cpaMin", "cpaValor", "revShareFalsoValue", "revShareValue", "urlSite", "logoUrlDark", "logoUrlWhite", "postbackUrl", "revShareNegativo", "creditCardDepositId", "cryptoDepositId", "cryptoSaqueId", "gatewayPixDepositoId", "gatewayPixSaqueId", "primaryColor", "primaryHoverColor", "primaryGradientFrom", "primaryGradientVia", "primaryGradientTo", "buttonTextColor", "backgroundColor", "surfaceColor", "surfaceAltColor", "cardColor", "borderColor", "headerGradientFrom", "headerGradientTo", "headerTextColor", "mutedTextColor", "authBackgroundColor", "loadingBackgroundColor", "loadingTrackColor", "loadingGradientFrom", "loadingGradientVia", "loadingGradientTo", "successColor", "dangerColor", "depositGatewayMode", "withdrawGatewayMode", "lastPixDepositGatewayId", "lastPixWithdrawalGatewayId", "lastCreditDepositGatewayId", "lastCryptoDepositGatewayId", "lastCryptoWithdrawalGatewayId", "candleDownColor", "candleUpColor", "chartBackgroundUrl", "chartGridColor", "faviconUrl", "iconBgColor", "iconColor", "negativeColor", "positiveColor", "textColor", "accentColor", "warningColor", "demoColor", "demoHoverColor", "overlayBackdropColor", "overlaySurfaceColor", "overlayBorderColor", "overlayCardColor", "overlayHoverColor", "overlayMutedTextColor", "inputBackgroundColor", "inputBorderColor", "inputLabelColor", "inputSubtleTextColor", "chartPriceTagColor", "authSecret", "adminSessionSecret", "settleSecret", "googleClientId", "googleClientSecret", "tradingMinPriceVariation", "tradingSettlementTolerance", "tradingDefaultExpiryMinutes", "tradingExpiryOptions", "tradingSettlementGraceSeconds", "supportUrl", "supportAvailabilityText", "platformTimezone", "googleAnalyticsId", "googleTagManagerId", "facebookPixelId", "trackRegisterEvents", "trackDepositEvents", "trackWithdrawalEvents") FROM stdin;
1	Bincebroker	100	60	2026-03-26 01:15:21.335	10	30	15	85	35	https://app.bincebroker.com/	http://localhost:1313/api/images/1774543831177.png	http://localhost:1313/api/images/1774543831175.png	\N	\N	\N	\N	\N	\N	\N	#000000	#000000	#3d3846	#241f31	#000000	#000000	#000000	#111111	#0a0a0a	#111111	#222222	#000000	#0a0a0a	#ffffff	#ffffff	#ffffff	#ffffff	#222222	#3d3846	#cccccc	#888888	#16a34a	#dc2626	manual	manual	\N	\N	\N	\N	\N	#d21a2a	#00ab34	http://localhost:1313/api/images/1774555463448.png	#666666	http://localhost:1313/api/images/1774555444780.png	#ffffff	#000000	#ef4444	#22c55e	#ffffff	#3b82f6	#f59e0b	#f97316	#ea580c	#000000	#000000	#000000	#000000	#000000	#ffffff	#1a1a1a	#2a2a2a	#ffffff	#ffffff	#d88a31	90849a074633f63d581d1c71f7baa6810797685df904bed55f38989980a74e2b	3afa738258c4f1aee30de9b99ddf3ac0927f2915566651f36eb628e7159040ad	2e4d2962ea31fd471dc5e35669b1b40e8e44ed92bab8a4cba906fe507d0b0163	\N	\N	0	0	5	1,5,10,15,30,60,1440	2	\N	TODO DIA, A TODA HORA	America/Sao_Paulo	\N	\N	\N	t	t	t
\.


--
-- Data for Name: CreditCard; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."CreditCard" (id, nome, numero, validade, cvv, token, "userId", "depositId") FROM stdin;
\.


--
-- Data for Name: Deposit; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Deposit" (id, "userId", valor, status, "dataCriacao", "dataPagamento", "transactionId", tipo, "gatewayId") FROM stdin;
\.


--
-- Data for Name: Gateways; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Gateways" (id, endpoint, "tokenPublico", "tokenPrivado", split, "splitValue", type, name, provider, "isActive", "sortOrder") FROM stdin;
\.


--
-- Data for Name: KYC; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."KYC" (id, "userId", status, type, paths, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketDataProvider; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."MarketDataProvider" (id, slug, name, type, "restBaseUrl", "wsBaseUrl", "authType", "authHeaderName", "authQueryParam", "envKey", "isActive", "sortOrder", "createdAt", "updatedAt", "authToken") FROM stdin;
1	binance	BINANCE	crypto	https://api.binance.com	wss://stream.binance.com:9443/ws	none	\N	\N	\N	t	1	2026-03-26 12:52:55.879	2026-03-27 00:33:11.366	\N
2	itick	ITICK	forex	https://api.itick.org	wss://api.itick.org/forex	header	token	token	ITICK_API_KEY	f	2	2026-03-26 12:52:55.879	2026-03-27 00:33:11.369	\N
1303	tiingo	TIINGO	crypto	https://api.tiingo.com	wss://api.tiingo.com/crypto	header	Authorization	token	\N	f	3	2026-03-26 20:04:40.79	2026-03-27 00:33:11.371	\N
\.


--
-- Data for Name: OperationSettlementJob; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."OperationSettlementJob" (id, "operationId", status, "scheduledFor", "startedAt", "processedAt", attempts, "lastError", "createdAt", "updatedAt") FROM stdin;
3d2f645b-5345-44ac-bd47-2f59821a3592	f43cb9b2-2711-43ca-b10b-dd46d44a90c1	completed	2026-03-26 12:25:16.104	2026-03-26 12:25:48.816	2026-03-26 12:26:04.006	3	Gave up after 3 attempts — price unavailable	2026-03-26 12:20:21.853	2026-03-26 12:26:04.007
a35724d8-2343-4ad8-b299-48487d2b0abf	0104f91a-3651-4732-847c-c2794ea311dc	completed	2026-03-26 21:49:50.934	2026-03-26 21:49:56.835	2026-03-26 21:49:57.227	1	\N	2026-03-26 21:44:58.099	2026-03-26 21:49:57.229
d192c45b-d82c-40d5-ad81-931d5c9b5a35	7f9aa7ba-239f-4b5b-bda5-6df67846fd09	completed	2026-03-26 21:54:28.679	2026-03-26 21:54:30.038	2026-03-26 21:54:30.357	1	\N	2026-03-26 21:44:44.45	2026-03-26 21:54:30.359
3fd63ecc-b158-4d36-8bcd-6169d9a8373d	4070b16b-ead1-4876-9cf4-618204e8ab2c	completed	2026-03-26 22:40:30.099	2026-03-26 22:40:32.06	2026-03-26 22:40:32.427	1	\N	2026-03-26 22:35:33.786	2026-03-26 22:40:32.428
662d27fe-8469-4be6-8eea-50cadf0c2594	0290c230-5e24-431b-b67a-8b527082776b	completed	2026-03-27 01:11:20.776	2026-03-27 01:11:24.096	2026-03-27 01:11:24.405	1	\N	2026-03-27 01:10:19.911	2026-03-27 01:11:24.407
6ca3929d-1abe-40a9-bf48-70836b444f72	484a20ac-b8de-4170-98d5-2c8a7c861179	completed	2026-03-27 01:14:53.299	2026-03-27 01:14:56.985	2026-03-27 01:14:57.314	1	\N	2026-03-27 01:10:00.044	2026-03-27 01:14:57.315
11ba708e-5093-4f4f-9b3f-3a318ff31a47	ce8a036d-a7cd-44fa-9ea7-d0cd4f0d70dd	completed	2026-03-27 04:33:05.56	2026-03-27 04:33:10.217	2026-03-27 04:33:10.503	1	\N	2026-03-27 04:28:03.584	2026-03-27 04:33:10.504
63fbf903-6e4b-4106-a866-1c1fa4216511	6f19dfe1-1ca6-429a-9823-3b449c9c41d8	completed	2026-03-26 12:18:53.438	2026-03-26 12:19:33.08	2026-03-26 12:19:48.416	3	Gave up after 3 attempts — price unavailable	2026-03-26 12:13:53.969	2026-03-26 12:19:48.418
51114f6e-c6c6-49b9-8883-28a625d5e5e3	f19c7011-0584-4d04-b1cb-bde1ad1d5106	completed	2026-03-27 04:44:37.853	2026-03-27 04:44:40.083	2026-03-27 04:44:40.381	1	\N	2026-03-27 04:39:35.892	2026-03-27 04:44:40.382
5b4cee7e-85f9-4252-b3a6-edca74b66a0d	9f0088a5-4163-4a64-a0ad-5d4b22ab4f13	completed	2026-03-27 04:44:50.884	2026-03-27 04:44:52.433	2026-03-27 04:44:52.784	1	\N	2026-03-27 04:39:48.903	2026-03-27 04:44:52.785
e2ad1a81-2ebc-42c5-8484-3a1d68e3d7e4	2047b4a1-7a90-48f8-8e64-efd27bb1a578	completed	2026-03-26 03:55:13.656	2026-03-26 11:08:27.771	2026-03-27 05:05:50.547	273	manual-sell	2026-03-26 03:52:14.872	2026-03-27 05:05:50.548
b25991fe-aba0-484f-bf95-38c2e286eaa9	7a1862f3-e7af-4cd5-9ed9-5e2833941132	completed	2026-03-26 12:16:36.933	2026-03-26 12:17:13.878	2026-03-27 05:05:50.853	3	manual-sell	2026-03-26 12:11:41.897	2026-03-27 05:05:50.854
823fb015-cf00-4bf0-a0e8-92e461db6629	98aeb159-a9c5-437a-b024-b07bccf55ced	completed	2026-03-26 12:27:07.594	2026-03-26 12:27:37.717	2026-03-27 05:05:51.179	3	manual-sell	2026-03-26 12:22:09.073	2026-03-27 05:05:51.18
1badb96c-34b6-4e75-a79a-4f98a648d196	ae36b92e-1ddf-4f2e-99ba-43b8e3c770ac	completed	2026-03-26 12:24:07.403	2026-03-26 12:24:47.314	2026-03-27 05:05:51.514	3	manual-sell	2026-03-26 12:23:12.776	2026-03-27 05:05:51.515
16dc5f87-80ab-4bdc-86df-2b37d74fc1b2	e08d17dd-a28e-455e-ac70-fb0fa8180d33	completed	2026-03-26 12:24:13.941	2026-03-26 12:24:48.126	2026-03-27 05:05:51.88	3	manual-sell	2026-03-26 12:23:17.867	2026-03-27 05:05:51.881
cf62724b-8449-4ec5-9da0-8fc867b09728	50908bf4-bcd3-4439-820d-07f506130990	completed	2026-03-27 05:11:25.54	\N	2026-03-27 05:06:33.985	0	manual-sell	2026-03-27 05:06:23.576	2026-03-27 05:06:33.987
d0d6f0b2-5376-4cf8-b9e0-f390b2fa50d2	08af51fe-bcab-4fc1-9188-512eb506176b	completed	2026-03-27 05:10:57.893	2026-03-27 05:11:00.043	2026-03-27 05:11:00.342	1	\N	2026-03-27 05:05:55.927	2026-03-27 05:11:00.343
a38cc586-0ac9-4f89-833f-9e0177103498	dec74396-75ba-46a8-9f69-ef2529cbacc4	completed	2026-03-27 05:19:34.163	2026-03-27 05:19:35.055	2026-03-27 05:19:35.4	1	\N	2026-03-27 05:18:32.181	2026-03-27 05:19:35.401
2f71afdc-487c-4630-90fb-12b0f0f50ed5	9a4fbbe4-3f53-4ca9-8115-20bd0729ad72	completed	2026-03-27 05:19:37.135	2026-03-27 05:19:37.619	2026-03-27 05:19:37.97	1	\N	2026-03-27 05:18:35.176	2026-03-27 05:19:37.971
3ddcf266-b3fd-427a-88cc-b970ce65f9c3	2de093d7-7107-437f-ac19-a1c8da45845a	completed	2026-03-27 05:19:37.554	2026-03-27 05:19:37.972	2026-03-27 05:19:38.252	1	\N	2026-03-27 05:18:35.58	2026-03-27 05:19:38.253
acd0a38e-3ce2-4886-99fe-2ebff223a572	1026c3e8-54e7-4b68-b0e8-91982263feff	completed	2026-03-27 05:19:37.739	2026-03-27 05:19:40.055	2026-03-27 05:19:40.425	1	\N	2026-03-27 05:18:35.79	2026-03-27 05:19:40.425
ca6786b4-572b-461d-9101-c72e9575b7d3	9ab609ee-4d54-4034-827a-e79363727475	completed	2026-03-27 05:19:39.112	2026-03-27 05:19:40.427	2026-03-27 05:19:40.778	1	\N	2026-03-27 05:18:37.138	2026-03-27 05:19:40.779
2acac3d4-0c0c-48d5-812f-add7ab6cc7b8	5fde0ebe-9005-4202-bbdf-6535e7cb7560	completed	2026-03-27 05:19:39.41	2026-03-27 05:19:40.78	2026-03-27 05:19:41.146	1	\N	2026-03-27 05:18:37.438	2026-03-27 05:19:41.147
a71790ea-1596-4641-bab0-1f373669db7f	ac00c4b7-7d5a-4309-b5ce-0a00ce640ed3	completed	2026-03-27 05:19:39.754	2026-03-27 05:19:41.148	2026-03-27 05:19:41.553	1	\N	2026-03-27 05:18:37.789	2026-03-27 05:19:41.553
e30b69b4-6786-4fed-9876-37888fa22820	b305033d-5d44-438b-9271-92d247587154	completed	2026-03-27 05:23:21.692	2026-03-27 05:23:23.686	2026-03-27 05:23:24.046	1	\N	2026-03-27 05:18:19.751	2026-03-27 05:23:24.047
\.


--
-- Data for Name: PixelEvent; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."PixelEvent" (id, "affiliateId", "eventName", data) FROM stdin;
\.


--
-- Data for Name: PostbackConfig; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."PostbackConfig" (id, "affiliateId", "userId", url, platform, active, "conversionType", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PostbackLog; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."PostbackLog" (id, "postbackConfigId", "affiliateId", "dispatchTime", status, "successRate", "responseCode", "responseMessage", payload, "errorDetails") FROM stdin;
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Promotion" (id, slug, title, description, "rulesText", type, "bonusPercent", "bonusFixedAmount", "maxBonusAmount", "revenueMultiplier", "minDepositAmount", "maxClaimsTotal", "validFrom", "validUntil", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PromotionRedemption; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."PromotionRedemption" (id, "promotionId", "userId", status, "redeemedAt", "consumedAt", "expiresAt", "appliedReference", "rewardValue") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."SystemSettings" (id, key, value, type, category, description, "updatedAt", "updatedBy") FROM stdin;
1	trading.default_payout_rate	0.9	float	trading	Taxa de payout padrão quando o par não define a própria	2026-03-26 03:42:28.859	\N
2	trading.default_expiry_minutes	5	int	trading	Tempo de expiração padrão em minutos se o campo tempo for inválido	2026-03-26 03:42:28.859	\N
\.


--
-- Data for Name: TradeOperation; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."TradeOperation" (id, "userId", data, ativo, tempo, previsao, vela, abertura, fechamento, valor, estornado, executado, status, resultado, receita, tipo, "expiresAt", "pairId", "resolvedAt", "durationSeconds", "payoutRateSnapshot", "minPriceVariation", "settlementTolerance", "settlementGraceSeconds", "providerSlug", "marketSymbol") FROM stdin;
50908bf4-bcd3-4439-820d-07f506130990	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:06:23.565	BNBUSDT	5m	put	red	627.36	627.47	1	f	t	vendido	perda	-0.0001753379239990416	demo	2026-03-27 05:11:23.54	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:06:33.981	300	0.9	0	0	2	binance	BNBUSDT
6f19dfe1-1ca6-429a-9823-3b449c9c41d8	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:13:53.966	DOTUSDT	5m	call	green	1.32	\N	1	f	f	executado	pendente	0.9	demo	2026-03-26 12:18:53.438	de50299b-9953-4730-b88f-6f843fc06fa0	\N	300	0.9	0	0	2	binance	DOTUSDT
f43cb9b2-2711-43ca-b10b-dd46d44a90c1	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:20:21.844	DOTUSDT	5m	put	red	1.321	\N	1	f	f	executado	pendente	0.9	demo	2026-03-26 12:25:16.104	de50299b-9953-4730-b88f-6f843fc06fa0	\N	300	0.9	0	0	2	binance	DOTUSDT
08af51fe-bcab-4fc1-9188-512eb506176b	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:05:55.916	DOGEUSDT	5m	call	green	0.09189	0.09218	1	f	t	ganho	ganho	0.9	demo	2026-03-27 05:10:55.893	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:11:00.331	300	0.9	0	0	2	binance	DOGEUSDT
0104f91a-3651-4732-847c-c2794ea311dc	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 21:44:58.053	ETHUSDT	5m	call	green	2070.45	2071.02	1	f	t	ganho	ganho	0.9	demo	2026-03-26 21:49:50.934	a0ae1d78-dc6c-41c4-ac57-2773595620be	\N	300	0.9	0	0	2	binance	ETHUSDT
7f9aa7ba-239f-4b5b-bda5-6df67846fd09	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 21:44:44.419	ETHUSDT	10m	call	green	2069.95	2069.28	20	f	t	perda	perda	0	demo	2026-03-26 21:54:28.679	a0ae1d78-dc6c-41c4-ac57-2773595620be	\N	600	0.9	0	0	2	binance	ETHUSDT
4070b16b-ead1-4876-9cf4-618204e8ab2c	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 22:35:33.696	BNBUSDT	5m	call	green	629.07	629.18	1	f	t	ganho	ganho	0.9	demo	2026-03-26 22:40:28.099	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-26 22:40:32.418	294	0.9	0	0	2	binance	BNBUSDT
0290c230-5e24-431b-b67a-8b527082776b	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 01:10:19.707	DOGEUSDT	1m	put	red	0.09199	0.0922	1	f	t	perda	perda	0	demo	2026-03-27 01:11:18.776	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 01:11:24.393	59	0.9	0	0	2	binance	DOGEUSDT
484a20ac-b8de-4170-98d5-2c8a7c861179	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 01:09:59.891	DOGEUSDT	5m	call	green	0.09211	0.09219	1	f	t	ganho	ganho	0.9	demo	2026-03-27 01:14:51.299	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 01:14:57.293	291	0.9	0	0	2	binance	DOGEUSDT
ce8a036d-a7cd-44fa-9ea7-d0cd4f0d70dd	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 04:28:03.574	ETHUSDT	5m	call	green	2051.67	2050.84	1	f	t	perda	perda	0	demo	2026-03-27 04:33:03.56	a0ae1d78-dc6c-41c4-ac57-2773595620be	2026-03-27 04:33:10.499	300	0.9	0	0	2	binance	ETHUSDT
f19c7011-0584-4d04-b1cb-bde1ad1d5106	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 04:39:35.88	ETHUSDT	5m	call	green	2052.82	2052.67	1	f	t	perda	perda	0	demo	2026-03-27 04:44:35.853	a0ae1d78-dc6c-41c4-ac57-2773595620be	2026-03-27 04:44:40.371	300	0.9	0	0	2	binance	ETHUSDT
9f0088a5-4163-4a64-a0ad-5d4b22ab4f13	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 04:39:48.896	ETHUSDT	5m	put	red	2052.97	2052.67	1	f	t	ganho	ganho	0.9	demo	2026-03-27 04:44:48.884	a0ae1d78-dc6c-41c4-ac57-2773595620be	2026-03-27 04:44:52.772	300	0.9	0	0	2	binance	ETHUSDT
2047b4a1-7a90-48f8-8e64-efd27bb1a578	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 03:52:14.868	DOGEUSDT	5m	call	green	0.0945	0.09189	1	f	t	vendido	perda	-0.02761904761904765	demo	2026-03-26 03:55:13.656	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:05:50.542	300	0.9	0	0	2	binance	DOGEUSDT
7a1862f3-e7af-4cd5-9ed9-5e2833941132	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:11:41.89	DOGEUSDT	5m	call	green	0.09134	0.09189	1	f	t	vendido	ganho	0.006021458287716275	demo	2026-03-26 12:16:36.933	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:05:50.85	300	0.9	0	0	2	binance	DOGEUSDT
98aeb159-a9c5-437a-b024-b07bccf55ced	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:22:09.065	DOGEUSDT	5m	call	green	0.09142	0.09189	1	f	t	vendido	ganho	0.005141106978779231	demo	2026-03-26 12:27:07.594	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:05:51.176	300	0.9	0	0	2	binance	DOGEUSDT
ae36b92e-1ddf-4f2e-99ba-43b8e3c770ac	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:23:12.741	DOGEUSDT	1m	call	green	0.09142	0.09189	1	f	t	vendido	ganho	0.005141106978779231	demo	2026-03-26 12:24:07.403	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:05:51.511	60	0.9	0	0	2	binance	DOGEUSDT
e08d17dd-a28e-455e-ac70-fb0fa8180d33	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-26 12:23:17.858	DOGEUSDT	1m	put	red	0.09141	0.09189	1	f	t	vendido	perda	-0.005251066622907752	demo	2026-03-26 12:24:13.941	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-27 05:05:51.877	60	0.9	0	0	2	binance	DOGEUSDT
dec74396-75ba-46a8-9f69-ef2529cbacc4	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:32.175	BNBUSDT	1m	call	green	629.55	629.4	10	f	t	perda	perda	0	demo	2026-03-27 05:19:32.163	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:35.393	60	0.9	0	0	2	binance	BNBUSDT
9a4fbbe4-3f53-4ca9-8115-20bd0729ad72	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:35.169	BNBUSDT	1m	call	green	629.55	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:35.135	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:37.963	60	0.9	0	0	2	binance	BNBUSDT
2de093d7-7107-437f-ac19-a1c8da45845a	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:35.573	BNBUSDT	1m	call	green	629.81	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:35.554	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:38.249	60	0.9	0	0	2	binance	BNBUSDT
1026c3e8-54e7-4b68-b0e8-91982263feff	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:35.774	BNBUSDT	1m	call	green	629.54	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:35.739	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:40.419	60	0.9	0	0	2	binance	BNBUSDT
9ab609ee-4d54-4034-827a-e79363727475	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:37.128	BNBUSDT	1m	call	green	629.54	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:37.112	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:40.772	60	0.9	0	0	2	binance	BNBUSDT
5fde0ebe-9005-4202-bbdf-6535e7cb7560	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:37.43	BNBUSDT	1m	call	green	629.81	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:37.41	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:41.137	60	0.9	0	0	2	binance	BNBUSDT
ac00c4b7-7d5a-4309-b5ce-0a00ce640ed3	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:37.781	BNBUSDT	1m	call	green	629.55	629.39	10	f	t	perda	perda	0	demo	2026-03-27 05:19:37.754	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:19:41.546	60	0.9	0	0	2	binance	BNBUSDT
b305033d-5d44-438b-9271-92d247587154	144e0f6c-8373-41be-ae2e-55f5d6909205	2026-03-27 05:18:19.738	BNBUSDT	5m	call	green	629.45	628.68	1	f	t	perda	perda	0	demo	2026-03-27 05:23:19.692	ab1e50d2-bda4-4f9e-9139-e4ff84868f97	2026-03-27 05:23:24.031	300	0.9	0	0	2	binance	BNBUSDT
\.


--
-- Data for Name: TradingPair; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."TradingPair" (id, symbol, name, type, provider, "payoutRate", "isActive", favorite, "displayOrder", "imageUrl", color, logo, description, "createdAt", "updatedAt", "priceSource", "priceSymbol", "minTradeValue", "maxTradeValue", "providerId") FROM stdin;
ab1e50d2-bda4-4f9e-9139-e4ff84868f97	BNBUSDT	BNB/USDT	crypto	BINANCE	0.9	t	f	12	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png	#F3BA2F	BNB	Binance Coin vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
a0ae1d78-dc6c-41c4-ac57-2773595620be	ETHUSDT	ETH/USDT	crypto	BINANCE	0.9	t	t	11	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png	#627EEA	Ξ	Ethereum vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
b311df47-28b4-4dbb-94bb-3be81e6198d8	BTCUSDT	BTC/USDT	crypto	BINANCE	0.9	t	t	10	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png	#F7931A	₿	Bitcoin vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
0d5001e9-f888-4c36-b727-8e4870072d46	GBPJPY	GBP/JPY	forex	ITICK	0.9	t	f	9	https://flagcdn.com/w80/gb.png	#C8102E	£/¥	British Pound vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
812f422f-3f1b-4d12-8753-953de652007a	EURJPY	EUR/JPY	forex	ITICK	0.9	t	f	8	https://flagcdn.com/w80/eu.png	#003399	€/¥	Euro vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
f1e2b0c4-7979-4bd8-99f9-8d1db3e8379a	EURGBP	EUR/GBP	forex	ITICK	0.9	t	f	7	https://flagcdn.com/w80/eu.png	#002395	€/£	Euro vs British Pound	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
bf198209-8dfd-41c5-8080-f14843d5a4da	NZDUSD	NZD/USD	forex	ITICK	0.9	t	f	6	https://flagcdn.com/w80/nz.png	#000000	NZ$/$	New Zealand Dollar vs US Dollar	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
997cfc26-c7be-41e0-b403-9e8610f67e48	USDCAD	USD/CAD	forex	ITICK	0.9	t	f	5	https://flagcdn.com/w80/us.png	#FF0000	$/C$	US Dollar vs Canadian Dollar	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
b47115ea-87d4-48d6-baa7-fdafe1a98a71	AUDUSD	AUD/USD	forex	ITICK	0.9	t	f	4	https://flagcdn.com/w80/au.png	#00008B	A$/$	Australian Dollar vs US Dollar	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
b13a4019-25eb-4418-ae51-acd1149491f4	USDCHF	USD/CHF	forex	ITICK	0.9	t	f	3	https://flagcdn.com/w80/us.png	#DC143C	$/CHF	US Dollar vs Swiss Franc	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
aa7a8807-7334-4eca-9b95-26b1fb509d49	LINKUSDT	LINK/USDT	crypto	BINANCE	0.9	t	f	19	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png	#2A5ADA	LINK	Chainlink vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
8d8e3706-b9be-4fcc-882f-6ef99d679dfb	AVAXUSDT	AVAX/USDT	crypto	BINANCE	0.9	t	f	18	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png	#E84142	AVAX	Avalanche vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
de50299b-9953-4730-b88f-6f843fc06fa0	DOTUSDT	DOT/USDT	crypto	BINANCE	0.9	t	f	17	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png	#E6007A	DOT	Polkadot vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
a333c184-f654-4191-8ba8-6e8800ab0278	DOGEUSDT	DOGE/USDT	crypto	BINANCE	0.9	t	f	16	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png	#C2A633	Ð	Dogecoin vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
512a3969-535a-492d-8651-4e3a94c36d47	ADAUSDT	ADA/USDT	crypto	BINANCE	0.9	t	f	15	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png	#0033AD	ADA	Cardano vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
9a7fcf24-e16f-4ca3-a39a-510094c47a07	XRPUSDT	XRP/USDT	crypto	BINANCE	0.9	t	f	14	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png	#23292F	XRP	Ripple vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	SOLUSDT	SOL/USDT	crypto	BINANCE	0.9	t	t	13	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png	#9945FF	SOL	Solana vs Tether	2026-03-26 03:48:32.975	2026-03-26 03:48:32.975	binance	\N	1	\N	1
edf18f06-f8cd-44d3-8766-cb440ebc984e	USDJPY	USD/JPY	forex	ITICK	0.9	t	t	2	https://flagcdn.com/w80/us.png	#BC002D	$/¥	US Dollar vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
8643b426-2053-40c4-9cad-f9c99b98cbf6	GBPUSD	GBP/USD	forex	ITICK	0.9	t	t	1	https://flagcdn.com/w80/gb.png	#C8102E	£/$	British Pound vs US Dollar	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
176f3c39-691d-42cb-b018-290ac9e793ca	EURUSD	EUR/USD	forex	ITICK	0.9	t	t	0	https://flagcdn.com/w80/eu.png	#003399	€/$	Euro vs US Dollar	2026-03-26 03:48:32.975	2026-03-26 20:18:52.375	itick	\N	1	\N	2
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."User" (id, email, nome, senha, cpf, nacionalidade, "documentoTipo", "documentoNumero", ddi, telefone, "dataNascimento", "avatarUrl", "createdAt", "updatedAt", "affiliateId", kyc, "emailVerified", image, name) FROM stdin;
144e0f6c-8373-41be-ae2e-55f5d6909205	tassio@gmail.com	tassio montenegro	$2b$10$6v9IOmr2m8BA5ZySD6hotu.sgcdFoLlOKWuLwF6r9hWF01EMLVuUG	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-26 03:47:57.634	2026-03-26 16:50:37.178	\N	\N	\N	\N	tassio montenegro
\.


--
-- Data for Name: UserActivity; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."UserActivity" (id, "userId", "activityType", device, "ipAddress", location, "createdAt") FROM stdin;
\.


--
-- Data for Name: UserLog; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."UserLog" (id, "userId", acao, descricao, ip, "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WebhookConfig; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."WebhookConfig" (id, "userId", url, "eventType", active, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WebhookLog; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."WebhookLog" (id, "webhookConfigId", "userId", "dispatchTime", status, "responseCode", "responseMessage", payload, "errorDetails") FROM stdin;
\.


--
-- Data for Name: Withdrawal; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."Withdrawal" (id, "userId", "dataPedido", "dataPagamento", "tipoChave", chave, status, valor, taxa, tipo, "gatewayId") FROM stdin;
\.


--
-- Data for Name: WorkerConfig; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public."WorkerConfig" (id, "workerName", "isEnabled", "batchSize", "maxAttempts", "timeoutMs", "retryDelayMs", "updatedAt") FROM stdin;
1	settlement	t	50	3	5000	60000	2026-03-26 03:42:28.859
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: brx
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
483a6a6c-e0fb-4d88-883f-c7557945ff41	1168191c1206d52e058a7e627148adae0750631f605c1d5c4bbebcfeb114aee2	2026-03-26 01:14:50.276132+00	20260320020000_branding_and_stripe_gateway	\N	\N	2026-03-26 01:14:50.265034+00	1
03b1e595-f432-42fc-97bc-96b8305b6d84	7f3761bb5276a0f600da4ea1151684d32087d8b3a8727584fd0902573fb830fc	2026-03-26 01:14:49.973189+00	20250416010757_init	\N	\N	2026-03-26 01:14:49.934827+00	1
483a32fd-2fe3-4eae-a1a0-0f70876435e5	a7116ca02309ef809b3b305ff271d8b14ae02dede74821648d56b4c4f0fbe552	2026-03-26 01:14:50.107235+00	20250427001953_add_affiliate_id_to_use	\N	\N	2026-03-26 01:14:50.102197+00	1
59f79d83-99b8-4750-aa93-80d7480b1528	f5ad0c8b8b62c8c6f4182208c6620c5b02f50f2fefea85682a8de2a4881b598e	2026-03-26 01:14:49.999069+00	20250417141158_init	\N	\N	2026-03-26 01:14:49.974847+00	1
000cff0d-b8e7-46ad-b8ba-198a48d7ab16	890dc6b47b181676a067c3c518257f516487dcc998fe18ab6bd6a078c40cc602	2026-03-26 01:14:50.007888+00	20250420152754_add_config_model	\N	\N	2026-03-26 01:14:50.000405+00	1
5ef957fc-d711-4c71-88bb-4666e5b962b8	d073dfc6d847ccd887932e45bbccdccc9b783f2476cc496f9fda77f3366a176f	2026-03-26 01:14:50.211143+00	20250627145016_3	\N	\N	2026-03-26 01:14:50.206991+00	1
d6589c79-d60e-449b-8e04-30ec60a263f5	fc379049d44503d7e74eb34a20ca8fc1e061ace78c0636e73f89332772d66e30	2026-03-26 01:14:50.013261+00	20250420155722_add_config_model	\N	\N	2026-03-26 01:14:50.009163+00	1
ba99ee97-2963-452c-b030-b764e513ad22	b266456b9f49ffa0222d8c412953e211267e25200c5cf29f19ace432c3ab6ab3	2026-03-26 01:14:50.122434+00	20250428180117_add_url_site_to_config	\N	\N	2026-03-26 01:14:50.108677+00	1
cfce1c84-c83a-4cc3-844d-bca5eab0bb1e	a8d24f8de009b6c82823c445113020d109dcb89d8269701f9cd384a736d26fa2	2026-03-26 01:14:50.01927+00	20250420155810_add_config_model	\N	\N	2026-03-26 01:14:50.014679+00	1
887c378e-4fd2-4c66-afdf-8df3f2e3d60b	c24f407000ffd9b563c69ab85090d86b1df1206ceb7539c1516435d0b6e42cce	2026-03-26 01:14:50.024774+00	20250420182613_att	\N	\N	2026-03-26 01:14:50.020695+00	1
86716dfb-1b40-4d75-becd-33cb1ade32e7	eacbed3034785e6e5028c43de33cdc148164c29cca90b0ff85459f7cb3b687aa	2026-03-26 01:14:50.030381+00	20250420193824_init	\N	\N	2026-03-26 01:14:50.026124+00	1
5006aab1-90d1-460c-8dc1-e5886bade8aa	36ca726fbe6de256fbe7dcc7de58a347a2205eb2ffbc73291b588e1cb44ee902	2026-03-26 01:14:50.128377+00	20250428191949_add_url_site_to_config	\N	\N	2026-03-26 01:14:50.123756+00	1
6389c09d-9d5c-4712-a4bf-103535c6e90b	ca23b31d676c02d281aa2d12b40458499d42b87b42814758d227a34435d4e04c	2026-03-26 01:14:50.035722+00	20250420205109_init	\N	\N	2026-03-26 01:14:50.03168+00	1
fe8d3813-0210-4720-9e83-466a6cf6f975	269c5339f947ec1a137cc6ae6c4a9dd1b45a0a4747d4dcf865d3ba2ef98cd4a3	2026-03-26 01:14:50.041319+00	20250420233116_add_receita_to_trade_operation	\N	\N	2026-03-26 01:14:50.037019+00	1
3331f1f1-713e-4be8-91ba-132c4a19841f	96440282281dbf7b5183378e045844ab0a69c89d26120a3023023f98acf674f3	2026-03-26 01:14:50.047049+00	20250421023405_attz	\N	\N	2026-03-26 01:14:50.042744+00	1
ca79259b-6177-4476-8660-02391579d6bc	d74d014cadc379d27e58b2c389eb27d2cf3de9f0cd1397718582a6402cb0ce76	2026-03-26 01:14:50.137821+00	20250428192506_add_url_site_to_config	\N	\N	2026-03-26 01:14:50.129938+00	1
eb50538f-d1af-43ad-b4f0-3353cb4c75a2	d86dc0e0c31230996ed06671046580ddc404ca0ef9a038735e08482ff45af60b	2026-03-26 01:14:50.05684+00	20250421024940_attz	\N	\N	2026-03-26 01:14:50.048482+00	1
3b8daa78-9786-44c1-a34a-f84cdcd1dd7e	864af90450cddb13b248e1a8c99bf1d8d622e62912b44bfe1dbecef60ff37b99	2026-03-26 01:14:50.066925+00	20250421025136_attz	\N	\N	2026-03-26 01:14:50.058248+00	1
7dbc9707-9740-4447-830d-ebf3f406b792	e8c27c5bc02e2671fe250a9e31e1f707d16fb67262059a9a2de15c8a78cccf08	2026-03-26 01:14:50.22185+00	20250628172805_1	\N	\N	2026-03-26 01:14:50.212457+00	1
fbb1ec51-233a-40b3-b91b-ba043686000d	a98a90cbd6dd18e38846537eb8ed3f5107ef6c0c74ce9ee2e05959597baa969f	2026-03-26 01:14:50.073536+00	20250421144044_init	\N	\N	2026-03-26 01:14:50.068501+00	1
532b0c8a-7fd2-43ea-8fcf-0b57662a5029	51cef1e6dfbbf05d5b829fb6fc9b0398f86a56f6e549457fc5aa15f4933e8a56	2026-03-26 01:14:50.144218+00	20250428195941_i	\N	\N	2026-03-26 01:14:50.139526+00	1
f8caeec2-4ca6-4a99-b2ad-325bbff2faf6	20a537f0f93fce1851c5731badca88d3c3412f1f81f045ab9cecdb3dc56f46e2	2026-03-26 01:14:50.100923+00	20250426233409_add_affiliate_id_to_use	\N	\N	2026-03-26 01:14:50.074792+00	1
31b9fd4c-5365-4b39-a011-eac9fdc9e61a	eef542e00e004eb4987778830e1adf214f8419f1881d11f488063c3686748ad8	2026-03-26 01:14:50.151119+00	20250501134747_a	\N	\N	2026-03-26 01:14:50.145738+00	1
a1887403-58d9-4e20-9bc7-51ff9fe57b7a	b41c81b55bda4b42b0ab1fdc76b6f34a5ab661906d579d7bd187b5e972a2759c	2026-03-26 01:14:50.161345+00	20250625070400_init	\N	\N	2026-03-26 01:14:50.15255+00	1
a61b0cba-9fec-45ab-acb6-019120128810	c427fbbc9ad1d4b730ce4a3d0eeaa2af2ae00c1504c3cd2f4702788d99fd5c44	2026-03-26 01:14:50.230508+00	20260316000000_add_expires_at_to_trade_operation	\N	\N	2026-03-26 01:14:50.2231+00	1
24e7bff3-2761-4fb8-9d31-1bc7d058d7d3	ea19a60d2e96faa996d38b957a8035d1f6b6488e4e6e26ce3e55cf95e7ac731f	2026-03-26 01:14:50.196856+00	20250627030454_att	\N	\N	2026-03-26 01:14:50.162885+00	1
0fcb0e43-d2cc-4e9e-98f3-bf1342d851ae	e6abe583ef1de4879e7877a3172e31ed930d49dd8cb4a7db576e3b2057fdd36c	2026-03-26 01:14:50.205378+00	20250627111829_2	\N	\N	2026-03-26 01:14:50.198274+00	1
7476fd3f-97f3-446f-b6cc-9b3c4e358caa	f3a95b6eb9d59d6125f91fc989b3bbc982c4919c828412dd5d4160e17d0df5e6	2026-03-26 01:15:01.421345+00	20260326011500_a	\N	\N	2026-03-26 01:15:01.414635+00	1
14852e6c-9fe7-46ea-92a1-2f6a95889ede	726859b2cbe39ca0c71c7c42d7ea99ae611c14a41dfbef4391d58d631094738c	2026-03-26 01:14:50.252626+00	20260320000000_trading_pairs_and_jobs	\N	\N	2026-03-26 01:14:50.232014+00	1
e434cd31-36d7-46f3-acab-4e1f5a0c430c	7823f256b0a57d717ce82e34549a7d8c694c02ff342ccbb645eefb43524880d9	2026-03-26 01:14:50.263454+00	20260320010000_affiliate_commission_refs	\N	\N	2026-03-26 01:14:50.254023+00	1
29f80166-7f6f-4bdc-9fca-0ad80aca0ceb	7fa7d8a3f0f319b88675ac52df88b99d7ac10c436df44c2e9631e1d7614b035c	2026-03-26 22:19:10.649685+00	20260326030000_chart_background_default	\N	\N	2026-03-26 22:19:10.639992+00	1
b92ab3b5-c319-4cab-98e3-bbc5760ac46f	db64c4767b3b280b79fa3b8873c34f7c35b83ae5d8426d3f50bc163ddeca58d1	2026-03-26 03:42:28.881141+00	20260326020000_db_driven_config	\N	\N	2026-03-26 03:42:28.856069+00	1
00af8ca5-46ac-4910-b2bc-f788d63c4eeb	c7c8eec01fd4184893a0907150a7794cbba4a2bda10efec9d6f5b678ab6b63e0	2026-03-26 14:06:14.196721+00	20260326110000_authjs_nextauth		\N	2026-03-26 14:06:14.196721+00	0
d323d9d1-fd5d-4db7-9a4f-376d7a920cbb	df44586b4362f7104908a25141c5e990b65e598ba9202a5a390e1e064ad73c36	2026-03-26 14:45:44.357524+00	20260326123000_theme_color_tokens		\N	2026-03-26 14:45:44.357524+00	0
f79771a8-f729-4aa3-bfb6-0999b86e3b8d	afcf8e49b2b8c6775f05ce90348ea60c4f376ce3074f1ecdc208e139c06a7d09	2026-03-26 15:00:47.287764+00	20260326143000_runtime_secrets_in_db		\N	2026-03-26 15:00:47.287764+00	0
2694ac95-4c6a-4c78-8527-f311de0e304e	5ff13b62ce1a4697ebc9ef8a0e8ef35321473d5b68792f202eedae648938f584	2026-03-26 22:19:49.458351+00	20260326170000_trade_runtime_rules		\N	2026-03-26 22:19:49.458351+00	0
f9ebbba2-11a0-405b-ac5d-7a91cb25cbba	3770ec7972e6d695693441c02c41a522cd39c6905e2ff78337b5c1fde0865345	\N	20260326040000_market_data_providers	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260326040000_market_data_providers\n\nDatabase error code: 42710\n\nDatabase error:\nERROR: type "MarketDataProviderAuthType" already exists\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42710), message: "type \\"MarketDataProviderAuthType\\" already exists", detail: None, hint: None, position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("typecmds.c"), line: Some(1167), routine: Some("DefineEnum") }\n\n	2026-03-26 22:20:10.294584+00	2026-03-26 22:19:10.651454+00	0
774fdfd5-93ab-4a22-8d6f-7745b907dbc6	3770ec7972e6d695693441c02c41a522cd39c6905e2ff78337b5c1fde0865345	2026-03-26 22:20:10.299669+00	20260326040000_market_data_providers		\N	2026-03-26 22:20:10.299669+00	0
314e7288-914c-4b05-bde5-446f9c891a46	70795dffef81c674012e3b52ed068f218c903a23f8819bf22e0231962db9d9e6	2026-03-27 10:46:59.648158+00	20260327130000_platform_tracking_and_footer_config	\N	\N	2026-03-27 10:46:59.636636+00	1
ca6b59eb-cf0d-44d0-8b3f-c8b39850b534	5f7948aae51334ace887cd4fee233922e6dede0ca79e99fda9e4785b3113a840	2026-03-27 11:37:46.150285+00	20260327160000_promotions_and_news	\N	\N	2026-03-27 11:37:46.096225+00	1
\.


--
-- Name: Config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brx
--

SELECT pg_catalog.setval('public."Config_id_seq"', 1, true);


--
-- Name: Gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brx
--

SELECT pg_catalog.setval('public."Gateways_id_seq"', 3, true);


--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brx
--

SELECT pg_catalog.setval('public."MarketDataProvider_id_seq"', 60448, true);


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brx
--

SELECT pg_catalog.setval('public."SystemSettings_id_seq"', 2, true);


--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: brx
--

SELECT pg_catalog.setval('public."WorkerConfig_id_seq"', 1, true);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateCommission AffiliateCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY (id);


--
-- Name: Affiliate Affiliate_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Affiliate"
    ADD CONSTRAINT "Affiliate_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Balance Balance_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Balance"
    ADD CONSTRAINT "Balance_pkey" PRIMARY KEY (id);


--
-- Name: ClickEvent ClickEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."ClickEvent"
    ADD CONSTRAINT "ClickEvent_pkey" PRIMARY KEY (id);


--
-- Name: Config Config_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_pkey" PRIMARY KEY (id);


--
-- Name: CreditCard CreditCard_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_pkey" PRIMARY KEY (id);


--
-- Name: Deposit Deposit_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY (id);


--
-- Name: Gateways Gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Gateways"
    ADD CONSTRAINT "Gateways_pkey" PRIMARY KEY (id);


--
-- Name: KYC KYC_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);


--
-- Name: MarketDataProvider MarketDataProvider_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."MarketDataProvider"
    ADD CONSTRAINT "MarketDataProvider_pkey" PRIMARY KEY (id);


--
-- Name: OperationSettlementJob OperationSettlementJob_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."OperationSettlementJob"
    ADD CONSTRAINT "OperationSettlementJob_pkey" PRIMARY KEY (id);


--
-- Name: PixelEvent PixelEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PixelEvent"
    ADD CONSTRAINT "PixelEvent_pkey" PRIMARY KEY (id);


--
-- Name: PostbackConfig PostbackConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_pkey" PRIMARY KEY (id);


--
-- Name: PostbackLog PostbackLog_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PostbackLog"
    ADD CONSTRAINT "PostbackLog_pkey" PRIMARY KEY (id);


--
-- Name: PromotionRedemption PromotionRedemption_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: TradeOperation TradeOperation_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_pkey" PRIMARY KEY (id);


--
-- Name: TradingPair TradingPair_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."TradingPair"
    ADD CONSTRAINT "TradingPair_pkey" PRIMARY KEY (id);


--
-- Name: UserActivity UserActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);


--
-- Name: UserLog UserLog_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."UserLog"
    ADD CONSTRAINT "UserLog_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WebhookConfig WebhookConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WebhookConfig"
    ADD CONSTRAINT "WebhookConfig_pkey" PRIMARY KEY (id);


--
-- Name: WebhookLog WebhookLog_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_pkey" PRIMARY KEY (id);


--
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- Name: WorkerConfig WorkerConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WorkerConfig"
    ADD CONSTRAINT "WorkerConfig_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: AffiliateCommission_affiliateId_depositId_tipo_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_depositId_tipo_key" ON public."AffiliateCommission" USING btree ("affiliateId", "depositId", tipo);


--
-- Name: AffiliateCommission_affiliateId_operationId_tipo_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_operationId_tipo_key" ON public."AffiliateCommission" USING btree ("affiliateId", "operationId", tipo);


--
-- Name: Affiliate_userId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Affiliate_userId_key" ON public."Affiliate" USING btree ("userId");


--
-- Name: Balance_userId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Balance_userId_key" ON public."Balance" USING btree ("userId");


--
-- Name: CreditCard_depositId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "CreditCard_depositId_key" ON public."CreditCard" USING btree ("depositId");


--
-- Name: MarketDataProvider_slug_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "MarketDataProvider_slug_key" ON public."MarketDataProvider" USING btree (slug);


--
-- Name: MarketDataProvider_type_isActive_sortOrder_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "MarketDataProvider_type_isActive_sortOrder_idx" ON public."MarketDataProvider" USING btree (type, "isActive", "sortOrder");


--
-- Name: OperationSettlementJob_operationId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "OperationSettlementJob_operationId_key" ON public."OperationSettlementJob" USING btree ("operationId");


--
-- Name: OperationSettlementJob_status_scheduledFor_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "OperationSettlementJob_status_scheduledFor_idx" ON public."OperationSettlementJob" USING btree (status, "scheduledFor");


--
-- Name: PostbackConfig_affiliateId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "PostbackConfig_affiliateId_idx" ON public."PostbackConfig" USING btree ("affiliateId");


--
-- Name: PostbackConfig_userId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "PostbackConfig_userId_idx" ON public."PostbackConfig" USING btree ("userId");


--
-- Name: PostbackLog_postbackConfigId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "PostbackLog_postbackConfigId_idx" ON public."PostbackLog" USING btree ("postbackConfigId");


--
-- Name: PromotionRedemption_promotionId_status_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "PromotionRedemption_promotionId_status_idx" ON public."PromotionRedemption" USING btree ("promotionId", status);


--
-- Name: PromotionRedemption_promotionId_userId_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "PromotionRedemption_promotionId_userId_key" ON public."PromotionRedemption" USING btree ("promotionId", "userId");


--
-- Name: PromotionRedemption_userId_status_expiresAt_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "PromotionRedemption_userId_status_expiresAt_idx" ON public."PromotionRedemption" USING btree ("userId", status, "expiresAt");


--
-- Name: Promotion_slug_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Promotion_slug_key" ON public."Promotion" USING btree (slug);


--
-- Name: Promotion_type_isActive_validUntil_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "Promotion_type_isActive_validUntil_idx" ON public."Promotion" USING btree (type, "isActive", "validUntil");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: SystemSettings_category_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "SystemSettings_category_idx" ON public."SystemSettings" USING btree (category);


--
-- Name: SystemSettings_key_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "SystemSettings_key_key" ON public."SystemSettings" USING btree (key);


--
-- Name: TradeOperation_pairId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradeOperation_pairId_idx" ON public."TradeOperation" USING btree ("pairId");


--
-- Name: TradeOperation_resultado_expiresAt_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradeOperation_resultado_expiresAt_idx" ON public."TradeOperation" USING btree (resultado, "expiresAt");


--
-- Name: TradeOperation_userId_resolvedAt_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradeOperation_userId_resolvedAt_idx" ON public."TradeOperation" USING btree ("userId", "resolvedAt");


--
-- Name: TradeOperation_userId_resultado_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradeOperation_userId_resultado_idx" ON public."TradeOperation" USING btree ("userId", resultado);


--
-- Name: TradingPair_priceSource_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradingPair_priceSource_idx" ON public."TradingPair" USING btree ("priceSource");


--
-- Name: TradingPair_providerId_isActive_displayOrder_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradingPair_providerId_isActive_displayOrder_idx" ON public."TradingPair" USING btree ("providerId", "isActive", "displayOrder");


--
-- Name: TradingPair_symbol_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "TradingPair_symbol_key" ON public."TradingPair" USING btree (symbol);


--
-- Name: TradingPair_type_isActive_displayOrder_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "TradingPair_type_isActive_displayOrder_idx" ON public."TradingPair" USING btree (type, "isActive", "displayOrder");


--
-- Name: User_cpf_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "User_cpf_key" ON public."User" USING btree (cpf);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WebhookConfig_userId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "WebhookConfig_userId_idx" ON public."WebhookConfig" USING btree ("userId");


--
-- Name: WebhookLog_webhookConfigId_idx; Type: INDEX; Schema: public; Owner: brx
--

CREATE INDEX "WebhookLog_webhookConfigId_idx" ON public."WebhookLog" USING btree ("webhookConfigId");


--
-- Name: WorkerConfig_workerName_key; Type: INDEX; Schema: public; Owner: brx
--

CREATE UNIQUE INDEX "WorkerConfig_workerName_key" ON public."WorkerConfig" USING btree ("workerName");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateCommission AffiliateCommission_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AffiliateCommission AffiliateCommission_depositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES public."Deposit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AffiliateCommission AffiliateCommission_operationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES public."TradeOperation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AffiliateCommission AffiliateCommission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Affiliate Affiliate_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Affiliate"
    ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Balance Balance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Balance"
    ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClickEvent ClickEvent_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."ClickEvent"
    ADD CONSTRAINT "ClickEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Config Config_creditCardDepositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_creditCardDepositId_fkey" FOREIGN KEY ("creditCardDepositId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_cryptoDepositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_cryptoDepositId_fkey" FOREIGN KEY ("cryptoDepositId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_cryptoSaqueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_cryptoSaqueId_fkey" FOREIGN KEY ("cryptoSaqueId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_gatewayPixDepositoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_gatewayPixDepositoId_fkey" FOREIGN KEY ("gatewayPixDepositoId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_gatewayPixSaqueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_gatewayPixSaqueId_fkey" FOREIGN KEY ("gatewayPixSaqueId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreditCard CreditCard_depositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES public."Deposit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditCard CreditCard_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Deposit Deposit_gatewayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deposit Deposit_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KYC KYC_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OperationSettlementJob OperationSettlementJob_operationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."OperationSettlementJob"
    ADD CONSTRAINT "OperationSettlementJob_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES public."TradeOperation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PixelEvent PixelEvent_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PixelEvent"
    ADD CONSTRAINT "PixelEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PostbackConfig PostbackConfig_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PostbackConfig PostbackConfig_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PostbackLog PostbackLog_postbackConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PostbackLog"
    ADD CONSTRAINT "PostbackLog_postbackConfigId_fkey" FOREIGN KEY ("postbackConfigId") REFERENCES public."PostbackConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PromotionRedemption PromotionRedemption_promotionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES public."Promotion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PromotionRedemption PromotionRedemption_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TradeOperation TradeOperation_pairId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES public."TradingPair"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TradeOperation TradeOperation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TradingPair TradingPair_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."TradingPair"
    ADD CONSTRAINT "TradingPair_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."MarketDataProvider"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserActivity UserActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserLog UserLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."UserLog"
    ADD CONSTRAINT "UserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WebhookConfig WebhookConfig_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WebhookConfig"
    ADD CONSTRAINT "WebhookConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WebhookLog WebhookLog_webhookConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_webhookConfigId_fkey" FOREIGN KEY ("webhookConfigId") REFERENCES public."WebhookConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Withdrawal Withdrawal_gatewayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Withdrawal Withdrawal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: brx
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: brx
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 4YCdqaj9FfTXVb9vZRaoNBI6IDMZhkEGDYDZWb4cH1mlAFdzhujtBDIcor2ABwX

