--
-- PostgreSQL database dump
--

\restrict oceHDPxWsIepV1jj8fKEoNtZSSdgCct3qP09PcONo84yidbcT29CfZWCoN4Gg2H

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AcaoAuditoria; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AcaoAuditoria" AS ENUM (
    'create',
    'update',
    'delete'
);


--
-- Name: CommissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionStatus" AS ENUM (
    'pendente',
    'paga',
    'cancelada'
);


--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'concluido',
    'pendente',
    'cancelado',
    'processando'
);


--
-- Name: DispatchStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DispatchStatus" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PENDING'
);


--
-- Name: GatewayType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GatewayType" AS ENUM (
    'credit',
    'pix',
    'crypto'
);


--
-- Name: KYCStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KYCStatus" AS ENUM (
    'APPROVED',
    'PENDING',
    'REJECT'
);


--
-- Name: KYCType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."KYCType" AS ENUM (
    'CNH',
    'RG',
    'PASSAPORTE'
);


--
-- Name: MarketDataProviderAuthType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MarketDataProviderAuthType" AS ENUM (
    'none',
    'header',
    'query'
);


--
-- Name: Platform; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Platform" AS ENUM (
    'GOOGLE',
    'TIKTOK',
    'FACEBOOK',
    'KWAI',
    'CUSTOM'
);


--
-- Name: PromotionRedemptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromotionRedemptionStatus" AS ENUM (
    'active',
    'consumed',
    'expired',
    'cancelled'
);


--
-- Name: PromotionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PromotionType" AS ENUM (
    'deposit_bonus',
    'revenue_multiplier'
);


--
-- Name: Resultado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Resultado" AS ENUM (
    'ganho',
    'perda',
    'pendente'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'SUPER_ADMIN',
    'ADMIN',
    'ASSISTANT_ADMIN'
);


--
-- Name: SettlementJobStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SettlementJobStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);


--
-- Name: Status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Status" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: TipoComissao; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoComissao" AS ENUM (
    'cpa',
    'revShare'
);


--
-- Name: TradingPairType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TradingPairType" AS ENUM (
    'forex',
    'crypto'
);


--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'concluido',
    'pendente',
    'cancelado',
    'processando'
);


--
-- Name: WithdrawalTipo; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalTipo" AS ENUM (
    'afiliado',
    'usuario'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Account; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Admin; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Affiliate; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: AffiliateCommission; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: AuditLog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Balance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Balance" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "saldoDemo" double precision DEFAULT 0.0 NOT NULL,
    "saldoReal" double precision DEFAULT 0.0 NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "saldoComissao" double precision DEFAULT 0.0 NOT NULL
);


--
-- Name: ClickEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ClickEvent" (
    id text NOT NULL,
    "affiliateId" text NOT NULL,
    url text NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Config; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Config_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Config_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Config_id_seq" OWNED BY public."Config".id;


--
-- Name: CreditCard; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Deposit; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Gateways; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Gateways_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Gateways_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Gateways_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Gateways_id_seq" OWNED BY public."Gateways".id;


--
-- Name: KYC; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: MarketDataProvider; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."MarketDataProvider_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."MarketDataProvider_id_seq" OWNED BY public."MarketDataProvider".id;


--
-- Name: OperationSettlementJob; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: PixelEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PixelEvent" (
    id text NOT NULL,
    "affiliateId" text NOT NULL,
    "eventName" text NOT NULL,
    data timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: PostbackConfig; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: PostbackLog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Promotion; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: PromotionRedemption; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."SystemSettings_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."SystemSettings_id_seq" OWNED BY public."SystemSettings".id;


--
-- Name: TradeOperation; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: TradingPair; Type: TABLE; Schema: public; Owner: -
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
    "priceSource" text DEFAULT ''::text NOT NULL,
    "priceSymbol" text,
    "minTradeValue" double precision DEFAULT 1 NOT NULL,
    "maxTradeValue" double precision,
    "providerId" integer
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: UserActivity; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: UserLog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: VerificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


--
-- Name: WebhookConfig; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: WebhookLog; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Withdrawal; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: WorkerConfig; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."WorkerConfig_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."WorkerConfig_id_seq" OWNED BY public."WorkerConfig".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: Config id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config" ALTER COLUMN id SET DEFAULT nextval('public."Config_id_seq"'::regclass);


--
-- Name: Gateways id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gateways" ALTER COLUMN id SET DEFAULT nextval('public."Gateways_id_seq"'::regclass);


--
-- Name: MarketDataProvider id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MarketDataProvider" ALTER COLUMN id SET DEFAULT nextval('public."MarketDataProvider_id_seq"'::regclass);


--
-- Name: SystemSettings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSettings" ALTER COLUMN id SET DEFAULT nextval('public."SystemSettings_id_seq"'::regclass);


--
-- Name: WorkerConfig id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkerConfig" ALTER COLUMN id SET DEFAULT nextval('public."WorkerConfig_id_seq"'::regclass);


--
-- Data for Name: Account; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Account" (id, "userId", type, provider, "providerAccountId", refresh_token, access_token, expires_at, token_type, scope, id_token, session_state) FROM stdin;
\.


--
-- Data for Name: Admin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Admin" (id, email, senha, nome, telefone, "dataCriacao", nivel) FROM stdin;
c9dc91e1-63ae-44fe-b269-50245bdf91d9	admin@bincebroker.com	$2a$12$dgfVHEOFkY5z0SnDQLBhT.V/PiVzbaXOiXj2Ev3k4xwqrbqVf05Xa	admin	11911223344	2026-03-26 01:15:21.389	SUPER_ADMIN
08de506b-b8b7-486f-9095-f37490b01815	admin@bincetech.pro	$2b$10$2bps.LFl2Qn4ZoGF9utO/eipWwRRA3mEQ7kozUxZyDNExiH3YFeNO	Admin	11900000000	2026-03-28 01:27:04.3	SUPER_ADMIN
\.


--
-- Data for Name: Affiliate; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Affiliate" (id, "userId", "tipoComissao", "createdAt", "updatedAt", split, "splitValue") FROM stdin;
54421d3a-7933-4e34-bcb8-4d1d60646e35	144e0f6c-8373-41be-ae2e-55f5d6909205	\N	2026-03-26 03:47:57.634	2026-03-26 03:47:57.634	\N	\N
b3aab49f-b448-4309-abe6-f350a24652d7	e314e4fb-5355-46d8-b591-13fee3b68979	\N	2026-03-28 01:33:10.406	2026-03-28 01:33:10.406	\N	\N
2a6751b2-c296-4a7a-9af0-2351c7801e9a	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	\N	2026-03-28 17:27:39.378	2026-03-28 17:27:39.378	\N	\N
ad6a4dfa-a6f8-4ffc-a9e0-3a4bdaa84e57	871eddac-50e8-4602-93b2-ec52c0f66d35	\N	2026-03-30 17:07:22.877	2026-03-30 17:07:22.877	\N	\N
e207aa53-1779-4caf-8888-3f227a57c388	282c8605-e105-4d65-84d5-7a7e9671b029	\N	2026-03-30 21:24:22.387	2026-03-30 21:24:22.387	\N	\N
4f0febfe-4c3c-4d3c-88d3-cb42abfbe1f5	d0c4e85b-c057-4c19-a46a-653a37a51018	\N	2026-03-30 21:26:27.016	2026-03-30 21:26:27.016	\N	\N
70b53dc4-bd33-495a-86a2-a781bfa648f1	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	\N	2026-03-31 02:38:54.273	2026-03-31 02:38:54.273	\N	\N
\.


--
-- Data for Name: AffiliateCommission; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AffiliateCommission" (id, "affiliateId", tipo, valor, data, status, "userId", "depositId", "operationId", percentual, descricao) FROM stdin;
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "userId", entidade, "entidadeId", acao, "valoresAntigos", "valoresNovos", "createdAt") FROM stdin;
6545d083-8198-47c8-b9ef-710f81a33f0a	144e0f6c-8373-41be-ae2e-55f5d6909205	User	144e0f6c-8373-41be-ae2e-55f5d6909205	create	{}	{"nome": "tassio montenegro", "email": "tassio@gmail.com"}	2026-03-26 03:47:57.634
f3a3dfa2-ff58-408c-9dd0-d89334a3648f	e314e4fb-5355-46d8-b591-13fee3b68979	User	e314e4fb-5355-46d8-b591-13fee3b68979	create	{}	{"nome": "MONTENEGRO", "email": "montenegro@gmail.com"}	2026-03-28 01:33:10.406
32327a46-e991-49de-bb30-16ce9c4154b8	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	User	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	create	{}	{"nome": "jadeucerto2026@gmail.com", "email": "jadeucerto2026@gmail.com"}	2026-03-28 17:27:39.378
0d25de8d-9b51-41a4-a5d6-aebd40571f84	871eddac-50e8-4602-93b2-ec52c0f66d35	User	871eddac-50e8-4602-93b2-ec52c0f66d35	create	{}	{"nome": "teste7766@gmail.com", "email": "teste7766@gmail.com"}	2026-03-30 17:07:22.877
ae8aee61-b265-44a9-b208-f96ce0fcd976	282c8605-e105-4d65-84d5-7a7e9671b029	User	282c8605-e105-4d65-84d5-7a7e9671b029	create	{}	{"nome": "isaiasFantasma007@gmail.com", "email": "isaiasFantasma007@gmail.com"}	2026-03-30 21:24:22.387
a7a12af0-8bbd-4277-8295-99d2589711f1	d0c4e85b-c057-4c19-a46a-653a37a51018	User	d0c4e85b-c057-4c19-a46a-653a37a51018	create	{}	{"nome": "teste5566@gmail.com", "email": "teste5566@gmail.com"}	2026-03-30 21:26:27.016
cc4269bc-edee-4506-b274-0a15a30af2ad	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	User	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	create	{}	{"nome": "Henry", "email": "hm246127@gmail.com"}	2026-03-31 02:38:54.273
\.


--
-- Data for Name: Balance; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Balance" (id, "userId", "saldoDemo", "saldoReal", "updatedAt", "saldoComissao") FROM stdin;
99144ec5-b5d9-4680-aa0f-8cce7264bb4a	144e0f6c-8373-41be-ae2e-55f5d6909205	9909.483258220076	0	2026-03-27 05:18:37.783	0
763d4337-d7e0-49fb-99e6-8141461a3a1d	d0c4e85b-c057-4c19-a46a-653a37a51018	76000	0	2026-03-31 10:58:09.01	0
b3e6ebb0-26c3-4e32-959e-4be890bada41	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	5799	0	2026-03-29 00:53:36.905	0
2ac53cb0-34c2-45e2-b8d2-9f9f42e648a4	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	9990.9	0	2026-03-31 14:52:06.921	0
b1d56054-39fd-44a4-8d98-274c11e29196	e314e4fb-5355-46d8-b591-13fee3b68979	9998.900012610584	0	2026-03-29 06:46:55.003	0
607122f9-5005-4b0b-a391-90ebd99196fa	282c8605-e105-4d65-84d5-7a7e9671b029	10000	0	2026-03-30 21:24:22.387	0
fd203fe8-a6ec-462d-82be-df91143d2bc4	871eddac-50e8-4602-93b2-ec52c0f66d35	14170	0	2026-03-30 21:32:56.287	0
\.


--
-- Data for Name: ClickEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ClickEvent" (id, "affiliateId", url, data) FROM stdin;
\.


--
-- Data for Name: Config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Config" (id, "nomeSite", "valorMinimoSaque", "valorMinimoDeposito", "criadoEm", taxa, "cpaMin", "cpaValor", "revShareFalsoValue", "revShareValue", "urlSite", "logoUrlDark", "logoUrlWhite", "postbackUrl", "revShareNegativo", "creditCardDepositId", "cryptoDepositId", "cryptoSaqueId", "gatewayPixDepositoId", "gatewayPixSaqueId", "primaryColor", "primaryHoverColor", "primaryGradientFrom", "primaryGradientVia", "primaryGradientTo", "buttonTextColor", "backgroundColor", "surfaceColor", "surfaceAltColor", "cardColor", "borderColor", "headerGradientFrom", "headerGradientTo", "headerTextColor", "mutedTextColor", "authBackgroundColor", "loadingBackgroundColor", "loadingTrackColor", "loadingGradientFrom", "loadingGradientVia", "loadingGradientTo", "successColor", "dangerColor", "depositGatewayMode", "withdrawGatewayMode", "lastPixDepositGatewayId", "lastPixWithdrawalGatewayId", "lastCreditDepositGatewayId", "lastCryptoDepositGatewayId", "lastCryptoWithdrawalGatewayId", "candleDownColor", "candleUpColor", "chartBackgroundUrl", "chartGridColor", "faviconUrl", "iconBgColor", "iconColor", "negativeColor", "positiveColor", "textColor", "accentColor", "warningColor", "demoColor", "demoHoverColor", "overlayBackdropColor", "overlaySurfaceColor", "overlayBorderColor", "overlayCardColor", "overlayHoverColor", "overlayMutedTextColor", "inputBackgroundColor", "inputBorderColor", "inputLabelColor", "inputSubtleTextColor", "chartPriceTagColor", "authSecret", "adminSessionSecret", "settleSecret", "googleClientId", "googleClientSecret", "tradingMinPriceVariation", "tradingSettlementTolerance", "tradingDefaultExpiryMinutes", "tradingExpiryOptions", "tradingSettlementGraceSeconds", "supportUrl", "supportAvailabilityText", "platformTimezone", "googleAnalyticsId", "googleTagManagerId", "facebookPixelId", "trackRegisterEvents", "trackDepositEvents", "trackWithdrawalEvents") FROM stdin;
1	Nextbroker	100	60	2026-03-26 01:15:21.335	10	30	15	85	35	https://bincetech.pro/	https://admin.bincetech.pro/api/images/1774543831177.png	https://admin.bincetech.pro/api/images/1774543831175.png	\N	\N	\N	\N	\N	\N	\N	#000000	#000000	#3d3846	#241f31	#000000	#000000	#000000	#111111	#0a0a0a	#111111	#222222	#000000	#0a0a0a	#ffffff	#ffffff	#ffffff	#ffffff	#222222	#3d3846	#cccccc	#888888	#16a34a	#dc2626	manual	manual	\N	\N	\N	\N	\N	#d21a2a	#00ab34	https://admin.bincetech.pro/api/images/1774720633577.png	#666666	https://admin.bincetech.pro/api/images/1774555444780.png	#ffffff	#000000	#ef4444	#22c55e	#ffffff	#3b82f6	#f59e0b	#f97316	#ea580c	#000000	#000000	#000000	#000000	#000000	#ffffff	#1a1a1a	#2a2a2a	#ffffff	#ffffff	#d88a31	90849a074633f63d581d1c71f7baa6810797685df904bed55f38989980a74e2b	3afa738258c4f1aee30de9b99ddf3ac0927f2915566651f36eb628e7159040ad	2e4d2962ea31fd471dc5e35669b1b40e8e44ed92bab8a4cba906fe507d0b0163	\N	\N	0	0	5	1,5,10,15,30,60,1440	2	\N	TODO DIA, A TODA HORA	America/Sao_Paulo	\N	\N	\N	t	t	t
\.


--
-- Data for Name: CreditCard; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CreditCard" (id, nome, numero, validade, cvv, token, "userId", "depositId") FROM stdin;
\.


--
-- Data for Name: Deposit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Deposit" (id, "userId", valor, status, "dataCriacao", "dataPagamento", "transactionId", tipo, "gatewayId") FROM stdin;
\.


--
-- Data for Name: Gateways; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Gateways" (id, endpoint, "tokenPublico", "tokenPrivado", split, "splitValue", type, name, provider, "isActive", "sortOrder") FROM stdin;
\.


--
-- Data for Name: KYC; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."KYC" (id, "userId", status, type, paths, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: MarketDataProvider; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MarketDataProvider" (id, slug, name, type, "restBaseUrl", "wsBaseUrl", "authType", "authHeaderName", "authQueryParam", "envKey", "isActive", "sortOrder", "createdAt", "updatedAt", "authToken") FROM stdin;
2	itick	ITICK	forex	https://api.itick.org	wss://api.itick.org/forex	header	token	token	\N	f	3	2026-03-26 12:52:55.879	2026-03-28 17:57:13.594	\N
1303	tiingo	TIINGO	forex	https://api.tiingo.com	wss://api.tiingo.com/fx	header	Authorization	token	TIINGO_API_KEY	t	2	2026-03-26 20:04:40.79	2026-03-28 18:37:18.098	c9c18576306b575251b6c139b8aecffb27f8ba10
1	binance	BINANCE	crypto	https://api.binance.com	wss://stream.binance.com:9443/ws	none	\N	\N	\N	t	1	2026-03-26 12:52:55.879	2026-03-28 18:37:23.504	\N
\.


--
-- Data for Name: OperationSettlementJob; Type: TABLE DATA; Schema: public; Owner: -
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
e8cdb280-4e40-446e-b175-1b42b9b405b5	96b3796d-e307-4d70-aa64-e34a9de5b030	completed	2026-03-28 17:37:19.926	\N	2026-03-28 17:36:32.521	0	manual-sell	2026-03-28 17:36:20.491	2026-03-28 17:36:32.522
04947098-4ad4-42e1-99c7-66e91deba86a	b7526c91-a73a-45b5-9149-ab03283ca942	completed	2026-03-29 00:49:50.581	2026-03-29 00:49:50.845	2026-03-29 00:49:50.869	3	Binance price request failed for DOGEUSDT (HTTP 451) | Binance candles request failed for DOGEUSDT (HTTP 451) | Binance candles request failed for DOGEUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:46:47.424	2026-03-29 00:49:50.87
f0d6df98-6cd5-4257-a65b-70a7b0257093	2dd43ec3-5f11-48a8-869d-41d0e77600d6	completed	2026-03-29 00:50:10.61	2026-03-29 00:50:10.842	2026-03-29 00:50:10.866	3	Binance price request failed for DOGEUSDT (HTTP 451) | Binance candles request failed for DOGEUSDT (HTTP 451) | Binance candles request failed for DOGEUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:47:04.799	2026-03-29 00:50:10.867
d1efddb0-1fdc-4066-8fe4-d1c75a22b193	d0dc3e87-3b7f-4a52-9281-652453aaee1d	completed	2026-03-29 00:52:35.59	2026-03-29 00:52:35.851	2026-03-29 00:52:35.876	3	Binance price request failed for DOGEUSDT (HTTP 451) | Binance price request failed for DOGEUSDT (HTTP 451) | Binance candles request failed for DOGEUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:45:32.096	2026-03-29 00:52:35.877
fcc98e72-b64e-47b7-8c51-78c00f093cb9	b6914a7d-3b34-4a9a-b495-6e5146abfa0a	completed	2026-03-29 00:53:55.738	2026-03-29 00:53:55.849	2026-03-29 00:53:55.874	3	Binance price request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:50:54.116	2026-03-29 00:53:55.875
cf433f67-810c-4124-8888-c85b01a7a403	8745f7d2-fa34-4671-8cc2-bc0df8c42ee0	completed	2026-03-29 00:55:40.562	2026-03-29 00:55:40.853	2026-03-29 00:55:40.872	3	Binance price request failed for SOLUSDT (HTTP 451) | Binance price request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:52:36.93	2026-03-29 00:55:40.872
a4ef6132-0581-4b73-a57a-4258f1c9920f	ff7613f5-9c54-4405-9032-45baa67f0c73	completed	2026-03-29 00:55:50.864	2026-03-29 00:55:54.217	2026-03-29 00:55:54.239	3	Binance price request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:52:49.119	2026-03-29 00:55:54.24
19dfc9a0-6712-499c-ac12-e42e9576f5d6	331f2187-60d8-4d03-8c94-4439592d14c1	completed	2026-03-29 00:56:40.572	2026-03-29 00:56:40.856	2026-03-29 00:56:40.883	3	Binance price request failed for SOLUSDT (HTTP 451) | Binance price request failed for SOLUSDT (HTTP 451) | Binance candles request failed for SOLUSDT (HTTP 451) | fallback:entry-price	2026-03-29 00:53:36.908	2026-03-29 00:56:40.883
b39907b6-15e0-4111-8f26-cc782c33d157	67b9e6aa-e77f-4ee2-8cd8-30dc46819aaa	completed	2026-03-29 06:18:40.827	2026-03-29 06:18:41.952	2026-03-29 06:18:41.982	1	\N	2026-03-29 06:17:38.942	2026-03-29 06:18:41.983
1e6d2fa6-9e2b-4109-9e24-e6a8b4335213	789b9a07-c145-4ede-afee-8aaa3540f5c4	completed	2026-03-29 06:22:33.706	2026-03-29 06:22:35.763	2026-03-29 06:22:35.802	1	\N	2026-03-29 06:17:31.83	2026-03-29 06:22:35.802
8f4bed89-c1fd-4163-a46b-a27066e03290	86e77bf1-3ab5-4c54-9784-32a620bcf47a	completed	2026-03-29 06:23:54.448	2026-03-29 06:23:55.579	2026-03-29 06:23:55.602	1	\N	2026-03-29 06:22:52.573	2026-03-29 06:23:55.603
2c28c14d-44df-48af-963b-02f9fa7110a9	00c35eea-8806-4770-b967-8ed6525e347f	completed	2026-03-29 06:51:05.68	\N	2026-03-29 06:46:55.001	0	manual-sell	2026-03-29 06:46:03.791	2026-03-29 06:46:55.002
2ae90f22-4721-425a-9329-19b3430adc82	2a8a269f-32dc-4a34-b756-553f1447e3a5	completed	2026-03-30 18:10:54.026	2026-03-30 18:10:57.398	2026-03-30 18:10:57.516	1	\N	2026-03-30 18:09:41.165	2026-03-30 18:10:57.516
a029e9e3-34a2-4939-a30d-bc19266eb6d7	d6549d78-e01d-4f8e-9251-acf1ac9b5672	completed	2026-03-30 18:12:33.438	2026-03-30 18:12:37.389	2026-03-30 18:12:37.508	1	\N	2026-03-30 18:11:20.575	2026-03-30 18:12:37.509
f48793e7-b440-4608-aabd-b389ad1d52c7	a3ad2d7f-315a-45f9-b587-20709c882b01	completed	2026-03-30 21:05:52.019	2026-03-30 21:05:52.228	2026-03-30 21:05:52.302	1	\N	2026-03-30 21:04:50.112	2026-03-30 21:05:52.303
21ca1014-ac49-462e-9d65-ee6c0fb85610	31c2d770-e85e-450b-aeef-2ee5a5b34995	completed	2026-03-31 10:51:14.397	2026-03-31 10:51:16.487	2026-03-31 10:51:16.493	1	\N	2026-03-31 10:50:11.309	2026-03-31 10:51:16.494
0e1e5151-b5d7-4faf-9303-e498bb5949f6	f3db7f59-dadf-4b2a-b1aa-a2bd9231ae77	completed	2026-03-30 21:09:19.476	2026-03-30 21:09:20.063	2026-03-30 21:09:20.345	1	\N	2026-03-30 21:08:17.568	2026-03-30 21:09:20.346
cb448c55-ff3e-4d41-90c7-f0f7b5fa6528	d3b864f0-f3be-499a-922e-18ede3938afc	completed	2026-03-30 21:07:08.567	2026-03-30 21:07:10.056	2026-03-30 21:07:10.063	1	\N	2026-03-30 21:06:06.649	2026-03-30 21:07:10.064
be939a1d-1292-4364-b23b-205d2c39f8f4	83700174-10a8-4911-965e-015fe0d57d0a	completed	2026-03-31 10:51:15.236	2026-03-31 10:51:16.501	2026-03-31 10:51:16.507	1	\N	2026-03-31 10:50:12.14	2026-03-31 10:51:16.508
b5ef4785-3b3d-4b95-8434-bd520e00f2b8	03b1bed8-6312-4db7-804a-7d9bba47557d	completed	2026-03-31 10:51:17.858	2026-03-31 10:51:18.929	2026-03-31 10:51:19	1	\N	2026-03-31 10:50:14.773	2026-03-31 10:51:19.001
3f166035-3239-4030-b5d5-f88793d0100c	df6780e0-8424-4f6c-b0e4-69d2d3cf49ea	completed	2026-03-30 21:14:19.965	2026-03-30 21:14:20.077	2026-03-30 21:14:20.116	1	\N	2026-03-30 21:13:18.045	2026-03-30 21:14:20.116
f7d786fc-74f0-4725-ae75-72a1daae5cd9	f1377916-c91c-43e3-80ea-7679c80fa957	completed	2026-03-31 10:54:31.774	2026-03-31 10:54:33.891	2026-03-31 10:54:34.007	1	\N	2026-03-31 10:53:28.679	2026-03-31 10:54:34.007
c36a51d6-f93e-41ba-94c8-4df4decf7fc7	8f9094be-cdca-4fb5-bc1e-d66d961ecdbc	completed	2026-03-30 21:14:55.559	2026-03-30 21:14:59.215	2026-03-30 21:14:59.248	1	\N	2026-03-30 21:13:53.637	2026-03-30 21:14:59.248
5c538fe2-75bc-4f2f-b22d-c41a9acd9fcf	a8deb985-ff0c-4cc2-a25f-0548dc2f6ca4	completed	2026-03-31 10:51:20.643	2026-03-31 10:51:23.943	2026-03-31 10:51:24.066	1	\N	2026-03-31 10:50:17.549	2026-03-31 10:51:24.066
fb1d96f9-3285-4638-adb6-69e3e9a55b2f	7a666dba-927b-42d1-9682-7622c42319a8	completed	2026-03-30 21:15:04.871	2026-03-30 21:15:05.08	2026-03-30 21:15:05.107	1	\N	2026-03-30 21:14:02.966	2026-03-30 21:15:05.107
c53ab241-4878-42a2-b7d9-15f5a2d3a947	50df87f9-2402-4251-afda-a8d9062ab05b	completed	2026-03-30 21:17:06.835	2026-03-30 21:17:09.767	2026-03-30 21:17:09.833	1	\N	2026-03-30 21:12:04.932	2026-03-30 21:17:09.833
1831ae32-98f7-44b3-b9fc-d92c2055daa5	cee4d3ed-caec-452f-a9aa-1c860010455c	completed	2026-03-31 10:51:30.886	2026-03-31 10:51:34.042	2026-03-31 10:51:34.055	1	\N	2026-03-31 10:50:27.794	2026-03-31 10:51:34.056
6d5344e4-8d44-4f9c-8c54-0b641a980b56	14fe50d4-51a7-40cd-a9cb-ca02182c4f4d	completed	2026-03-31 10:50:27.946	\N	2026-03-31 10:45:54.255	0	manual-sell	2026-03-31 10:45:24.861	2026-03-31 10:45:54.255
7a76089a-f275-404d-912d-453d99621314	ef849655-ccd4-414d-a44a-4ba32434847a	completed	2026-03-31 10:54:34.945	2026-03-31 10:54:38.909	2026-03-31 10:54:38.917	1	\N	2026-03-31 10:53:31.853	2026-03-31 10:54:38.917
bfa9117e-7d99-4b13-950f-7d83744e2d3b	dd5a5392-bd0d-416a-906d-b2c0e7919867	completed	2026-03-31 10:51:31.867	2026-03-31 10:51:34.055	2026-03-31 10:51:34.064	1	\N	2026-03-31 10:50:28.774	2026-03-31 10:51:34.065
ac52ee3d-df0c-4c0d-b732-53ef0672241c	bf0f4f99-0d36-40db-90cf-4c5cc5b14578	completed	2026-03-31 10:51:33.54	2026-03-31 10:51:34.067	2026-03-31 10:51:34.073	1	\N	2026-03-31 10:50:30.452	2026-03-31 10:51:34.074
0210db87-9003-459a-aa77-42f454a59a90	e47aed79-6b13-4e0c-a535-4c61f0af28cd	completed	2026-03-31 10:51:35.943	2026-03-31 10:51:38.93	2026-03-31 10:51:38.97	1	\N	2026-03-31 10:50:32.853	2026-03-31 10:51:38.97
cfc96465-55d2-426d-a4ce-0b6a3d590656	096f40ac-5878-4087-bd9a-60fd026ecc96	completed	2026-03-31 10:55:19.076	2026-03-31 10:55:23.906	2026-03-31 10:55:23.969	1	\N	2026-03-31 10:54:15.979	2026-03-31 10:55:23.97
38d60f68-0da3-4599-9ce9-622a0b6fe3e4	671e3ba4-8f65-41a2-b212-7b25a0a09372	completed	2026-03-31 10:48:35.748	2026-03-31 10:48:38.913	2026-03-31 10:48:39.029	1	\N	2026-03-31 10:47:32.654	2026-03-31 10:48:39.03
3db0042d-c772-4526-af31-a6da9259ea54	015d1e7c-42c5-4165-837e-77f37a1d1fe7	completed	2026-03-31 10:51:40.124	2026-03-31 10:51:43.931	2026-03-31 10:51:44.023	1	\N	2026-03-31 10:50:37.032	2026-03-31 10:51:44.023
cb4b1f45-4b91-45e1-aea6-78d3cab1a7c9	68f63c88-6527-4ffb-b8cb-a4d01bf979aa	completed	2026-03-31 10:48:38.585	2026-03-31 10:48:39.031	2026-03-31 10:48:39.037	1	\N	2026-03-31 10:47:35.506	2026-03-31 10:48:39.038
b907b91e-7e07-4332-966b-76325066b012	aa3d9d80-571d-472f-b539-a79af2fd33c6	completed	2026-03-31 10:48:41.57	2026-03-31 10:48:43.915	2026-03-31 10:48:43.994	1	\N	2026-03-31 10:47:38.483	2026-03-31 10:48:43.994
57301f63-02f7-4cb0-b297-2cca68bea4ca	8a723dd5-5369-4cce-9611-d83969f5447e	completed	2026-03-31 10:51:41.486	2026-03-31 10:51:44.026	2026-03-31 10:51:44.032	1	\N	2026-03-31 10:50:38.392	2026-03-31 10:51:44.033
4b9be047-6a08-4205-b581-108afe2bea6c	eb6ad75e-493e-4f1f-a2cb-7c9b11e43957	completed	2026-03-31 10:48:47.649	2026-03-31 10:48:48.922	2026-03-31 10:48:48.994	1	\N	2026-03-31 10:47:44.559	2026-03-31 10:48:48.994
ed046e7b-4964-4555-a0e3-c0d2e519514e	54a23ada-2d29-4e1e-aba9-dbbb4f04f1be	completed	2026-03-31 10:48:46.78	2026-03-31 10:48:48.908	2026-03-31 10:48:48.994	1	\N	2026-03-31 10:47:43.688	2026-03-31 10:48:48.994
c2c31d6b-6bf1-4e23-9d22-80f1a5f77b28	514fe95b-e32a-4f32-877f-87e5c703f3ff	completed	2026-03-31 10:51:43.353	2026-03-31 10:51:44.041	2026-03-31 10:51:44.052	1	\N	2026-03-31 10:50:40.269	2026-03-31 10:51:44.053
0c788348-4f92-46aa-bdb7-f1e5453e5a9f	e7c1151a-cacb-4d87-add8-e2b8859da769	completed	2026-03-31 10:51:44.638	2026-03-31 10:51:48.931	2026-03-31 10:51:48.987	1	\N	2026-03-31 10:50:41.543	2026-03-31 10:51:48.988
6cc2b1c6-bcd3-40ff-8782-e3c2ae688736	bef8b8e8-0835-47fc-a72d-76676a53c515	completed	2026-03-31 10:48:51.521	2026-03-31 10:48:53.914	2026-03-31 10:48:53.991	1	\N	2026-03-31 10:47:48.426	2026-03-31 10:48:53.991
81244d5f-99f1-4a68-bbd2-28020e361443	6659ea64-ecf1-47f6-ada5-31a2b7ef79cf	completed	2026-03-31 10:49:52.33	2026-03-31 10:49:53.92	2026-03-31 10:49:54.004	1	\N	2026-03-31 10:48:49.242	2026-03-31 10:49:54.005
88990c3f-8a6c-4b7a-bfd1-9434a2b850bd	546891f4-0a49-46b0-9b4b-fab2c4559566	completed	2026-03-31 10:49:53.217	2026-03-31 10:49:53.927	2026-03-31 10:49:54.004	1	\N	2026-03-31 10:48:50.125	2026-03-31 10:49:54.004
39d96875-8111-4998-aa1f-75d9ad9624e5	5a7a781a-cb0d-453a-b96c-88f15524637d	completed	2026-03-31 10:53:16.714	2026-03-31 10:53:18.94	2026-03-31 10:53:18.986	1	\N	2026-03-31 10:52:13.62	2026-03-31 10:53:18.986
0dd02da6-8d80-40cb-9cf7-fbd1aba713dc	1cc61870-38f8-487a-8c8e-26d946305f5c	completed	2026-03-31 10:49:53.89	2026-03-31 10:49:54.006	2026-03-31 10:49:54.014	1	\N	2026-03-31 10:48:50.799	2026-03-31 10:49:54.014
8d8d2fae-ccbc-417a-ad89-04b9b78f3c1f	fa894eea-f96b-42d6-a42f-6bbf596ca17e	completed	2026-03-31 10:49:57.481	2026-03-31 10:49:58.922	2026-03-31 10:49:59.022	1	\N	2026-03-31 10:48:54.387	2026-03-31 10:49:59.023
0062544f-3305-43ed-ac05-faf60a751d02	cfa70782-5128-4eee-8415-5aa15d7ffeb6	completed	2026-03-31 10:53:17.552	2026-03-31 10:53:18.989	2026-03-31 10:53:18.996	1	\N	2026-03-31 10:52:14.461	2026-03-31 10:53:18.997
85a76363-d5c8-4228-82ed-fc86928fa341	d187cb77-8444-4d2c-8ee3-2f7100963a89	completed	2026-03-31 10:50:05.829	2026-03-31 10:50:08.928	2026-03-31 10:50:09.029	1	\N	2026-03-31 10:49:02.739	2026-03-31 10:50:09.03
54d51919-4d0f-471a-90af-fad739805d3d	2c72bd7c-eaee-4217-8e50-29412e9f2f29	completed	2026-03-31 10:50:10.415	2026-03-31 10:50:13.905	2026-03-31 10:50:13.983	1	\N	2026-03-31 10:49:07.322	2026-03-31 10:50:13.983
2d8d5a94-3cb6-4914-8ff2-161890d14c99	7ab7cca3-014d-4984-8384-22ceb32b3b56	completed	2026-03-31 10:50:13.717	2026-03-31 10:50:13.984	2026-03-31 10:50:13.99	1	\N	2026-03-31 10:49:10.635	2026-03-31 10:50:13.991
41f8c746-2187-4f21-9278-7df7b6d99b00	6966ff39-eb48-4c6a-8fd0-e7e0b09eca4f	completed	2026-03-31 10:50:19.107	2026-03-31 10:50:23.907	2026-03-31 10:50:23.914	1	\N	2026-03-31 10:49:16.016	2026-03-31 10:50:23.915
99417765-09de-49cb-9d77-799e3f9e2375	87f0597c-41a8-46f0-acc9-995e008d5bda	completed	2026-03-31 10:50:23.441	2026-03-31 10:50:23.927	2026-03-31 10:50:23.934	1	\N	2026-03-31 10:49:20.353	2026-03-31 10:50:23.935
ccb01ec4-2e62-45d8-a485-1f76e9d394c3	30288c20-5fe5-4991-9e7f-bd931592bb21	completed	2026-03-31 10:53:26.609	2026-03-31 10:53:28.984	2026-03-31 10:53:28.99	1	\N	2026-03-31 10:52:23.519	2026-03-31 10:53:28.991
4ed97b13-2441-44f8-a4a8-af6ab3ff49cd	f17520f2-33f6-4eac-a115-a9505a89bd0e	completed	2026-03-31 10:50:26.931	2026-03-31 10:50:28.928	2026-03-31 10:50:28.997	1	\N	2026-03-31 10:49:23.839	2026-03-31 10:50:28.998
96bb993a-31f7-40d4-9ca4-3320747544b8	84046ac6-9c6c-4d95-8eaf-0dcd938dda42	completed	2026-03-31 10:50:30.213	2026-03-31 10:50:33.922	2026-03-31 10:50:33.93	1	\N	2026-03-31 10:49:27.135	2026-03-31 10:50:33.931
58967a20-f9f1-457a-a5d5-2fda4e15f82c	c5bed1c7-2cd1-452e-bc1e-4f3d03a2668a	completed	2026-03-31 10:53:33.017	2026-03-31 10:53:33.941	2026-03-31 10:53:34.03	1	\N	2026-03-31 10:52:29.923	2026-03-31 10:53:34.031
8dcff86a-c78d-41ff-bcaa-395fcbae66ef	506aaff1-0c3c-43a3-ae46-e84dfa373e0c	completed	2026-03-31 10:53:33.424	2026-03-31 10:53:34.032	2026-03-31 10:53:34.043	1	\N	2026-03-31 10:52:30.333	2026-03-31 10:53:34.044
ffe3753a-69a1-47f2-b5b7-2c9b977970d1	cfdb9276-56b5-4cb7-b5fa-662e18e047c8	completed	2026-03-31 10:53:33.681	2026-03-31 10:53:34.04	2026-03-31 10:53:34.049	1	\N	2026-03-31 10:52:30.585	2026-03-31 10:53:34.049
e9d66d0d-f0e7-429f-868d-84253dc46348	bee3d76e-ccd9-472b-9321-9c49824ca726	completed	2026-03-31 10:53:34.252	2026-03-31 10:53:38.903	2026-03-31 10:53:38.965	1	\N	2026-03-31 10:52:31.155	2026-03-31 10:53:38.966
ba16281f-9a8d-46ee-81e5-0767d129f599	d4365e11-dd8f-4f41-87c1-0c1d69a2d6df	completed	2026-03-30 21:07:06.519	2026-03-30 21:07:07.225	2026-03-30 21:07:07.33	1	\N	2026-03-30 21:06:04.613	2026-03-30 21:07:07.331
dcf5f94b-3a6d-4337-bdd8-b7600f571472	9ad0230a-1ab0-4b7e-92c0-3b860fbc6a59	completed	2026-03-30 21:09:11.61	2026-03-30 21:09:12.209	2026-03-30 21:09:12.289	1	\N	2026-03-30 21:08:09.692	2026-03-30 21:09:12.29
8a133c1f-60d5-4f6c-867d-6f75b96da10f	be41b0d1-fa68-41ed-9206-367f5398792a	completed	2026-03-31 10:51:14.183	2026-03-31 10:51:16.212	2026-03-31 10:51:16.486	1	\N	2026-03-31 10:50:11.095	2026-03-31 10:51:16.487
78ce5f8d-242a-411f-8dd8-8bbb466cb57d	508e6b69-46eb-458b-87cd-454d4cb13340	completed	2026-03-31 10:51:14.851	2026-03-31 10:51:16.494	2026-03-31 10:51:16.5	1	\N	2026-03-31 10:50:11.759	2026-03-31 10:51:16.501
40605368-17f2-4aed-a98f-35c58d69965f	b9b514f4-d8ff-4492-afb4-28b7ad584901	completed	2026-03-31 10:54:28.386	2026-03-31 10:54:28.917	2026-03-31 10:54:28.926	1	\N	2026-03-31 10:53:25.293	2026-03-31 10:54:28.927
5b6b483b-fed3-42c2-a35e-08b01db58033	8110e192-29a2-4816-8424-c4741d761fbd	completed	2026-03-31 10:51:16.655	2026-03-31 10:51:18.908	2026-03-31 10:51:18.999	1	\N	2026-03-31 10:50:13.563	2026-03-31 10:51:19
345fb1dd-9f99-44fb-9858-aec78ce1fa76	23e6287d-cd02-4536-ae85-9f707fe920bc	completed	2026-03-30 21:14:36.197	2026-03-30 21:14:39.206	2026-03-30 21:14:39.235	1	\N	2026-03-30 21:13:34.279	2026-03-30 21:14:39.235
ce5576ab-0b19-4c76-a434-21902cc8e28d	be5eb1b7-8d19-40ed-97e9-4a8e2dc09d31	completed	2026-03-30 21:14:39.843	2026-03-30 21:14:40.082	2026-03-30 21:14:40.1	1	\N	2026-03-30 21:13:37.918	2026-03-30 21:14:40.101
60432347-3438-4053-a07d-ac145c36f5b9	6dad58f3-bf91-469c-86da-de0e3e8c47b2	completed	2026-03-31 10:51:19.374	2026-03-31 10:51:23.937	2026-03-31 10:51:24.065	1	\N	2026-03-31 10:50:16.282	2026-03-31 10:51:24.066
8deb0644-d080-47d5-a7fe-c8048ee65643	b7a960b5-6b68-4990-9eae-1f30f0ca4de9	completed	2026-03-30 21:14:56.515	2026-03-30 21:14:59.249	2026-03-30 21:14:59.268	1	\N	2026-03-30 21:13:54.591	2026-03-30 21:14:59.269
5957e4f0-e463-4079-8972-06f351410184	eb0451c7-734b-4e8e-8c2b-918289855eeb	completed	2026-03-31 10:54:38.396	2026-03-31 10:54:38.918	2026-03-31 10:54:38.924	1	\N	2026-03-31 10:53:35.306	2026-03-31 10:54:38.925
18227980-2950-49f1-8dca-809632eb1def	de88af0c-92b6-48f3-b139-ec07d4d90c6f	completed	2026-03-30 21:18:12.461	2026-03-30 21:18:15.086	2026-03-30 21:18:15.117	1	\N	2026-03-30 21:13:10.567	2026-03-30 21:18:15.118
d81cc267-43a1-4507-826e-916af52c91e5	0e638ee8-9d3b-4280-be32-2873c39a1a2c	completed	2026-03-31 10:51:21.972	2026-03-31 10:51:24.067	2026-03-31 10:51:24.08	1	\N	2026-03-31 10:50:18.878	2026-03-31 10:51:24.081
12ed3eef-bcc9-4f3a-bce7-9383d6a91a60	b83ab878-5288-461c-a7a6-cc034fe4f0df	completed	2026-03-30 21:32:55.442	2026-03-30 21:32:56.252	2026-03-30 21:32:56.289	1	\N	2026-03-30 21:31:53.515	2026-03-30 21:32:56.289
c8fb3e4e-ed21-444f-8fb7-92ba767f83a7	222cbb6f-b1ee-4db8-a244-868da51ffb8c	completed	2026-03-31 10:51:25.37	2026-03-31 10:51:28.916	2026-03-31 10:51:28.997	1	\N	2026-03-31 10:50:22.277	2026-03-31 10:51:28.998
9e386f56-8c51-4d4d-bed8-935c5c4a3c22	27c75ba4-c00a-4773-b897-969e0e150439	completed	2026-03-31 10:47:11.85	2026-03-31 10:47:13.898	2026-03-31 10:47:13.909	1	\N	2026-03-31 10:46:08.763	2026-03-31 10:47:13.91
64343ec6-6ccb-4c16-86f7-2930baf412fd	30f8f8fd-e7c3-4dd0-a441-7ebac547e3ff	completed	2026-03-31 10:51:29.44	2026-03-31 10:51:33.931	2026-03-31 10:51:34.039	1	\N	2026-03-31 10:50:26.348	2026-03-31 10:51:34.04
fc155cfa-cca3-4edf-b031-0734060e1153	715c02a8-7bcc-499c-adc8-436cb3175063	completed	2026-03-31 10:47:18.35	2026-03-31 10:47:18.904	2026-03-31 10:47:18.911	1	\N	2026-03-31 10:46:15.258	2026-03-31 10:47:18.912
735a7007-d363-4cda-b095-b20d0e19df92	4cebb766-65b2-4f39-a7d9-c11ce297b035	completed	2026-03-31 10:51:29.249	2026-03-31 10:51:33.919	2026-03-31 10:51:34.039	1	\N	2026-03-31 10:50:26.155	2026-03-31 10:51:34.04
d3ef4391-60f5-454e-a336-2c2d1162f3e7	ac3bc218-64d7-419d-a623-b5d4f0a20a13	completed	2026-03-31 10:51:29.632	2026-03-31 10:51:34.04	2026-03-31 10:51:34.052	1	\N	2026-03-31 10:50:26.549	2026-03-31 10:51:34.052
5dada69e-d006-4387-921e-03391b98a5ed	49e98b57-3835-485a-9e98-647fa1d5bc01	completed	2026-03-31 10:48:37.503	2026-03-31 10:48:38.921	2026-03-31 10:48:39.029	1	\N	2026-03-31 10:47:34.416	2026-03-31 10:48:39.03
c5cc1a54-0f28-4d27-a98e-d9c22db167ae	671c18f6-594f-41a1-ad77-1160a24dc10c	completed	2026-03-31 10:51:32.717	2026-03-31 10:51:34.058	2026-03-31 10:51:34.066	1	\N	2026-03-31 10:50:29.624	2026-03-31 10:51:34.067
dbed6382-10a3-47ea-bd32-79dd757435ab	f0f58495-74b3-4474-b376-eaeb8a121f18	completed	2026-03-31 10:48:43.773	2026-03-31 10:48:43.922	2026-03-31 10:48:43.993	1	\N	2026-03-31 10:47:40.695	2026-03-31 10:48:43.994
9619fc84-f6b7-4651-abfa-9b24a76d815a	4c460589-f824-42e0-bd5c-941ec5e1f6f2	completed	2026-03-31 10:51:34.563	2026-03-31 10:51:38.907	2026-03-31 10:51:38.969	1	\N	2026-03-31 10:50:31.47	2026-03-31 10:51:38.97
4163e309-faad-4f24-a27a-d9130d0cf71b	3a17e238-b7c0-4ba6-aa05-3c102860a68f	completed	2026-03-31 10:51:39.712	2026-03-31 10:51:43.905	2026-03-31 10:51:44.023	1	\N	2026-03-31 10:50:36.622	2026-03-31 10:51:44.023
106fb09a-d71f-4c36-b7f0-c176c7b0ede6	4bde13c8-ec69-46f2-ad7f-6c911bf81ec8	completed	2026-03-31 10:51:40.377	2026-03-31 10:51:44.024	2026-03-31 10:51:44.03	1	\N	2026-03-31 10:50:37.282	2026-03-31 10:51:44.03
014b92db-74be-4030-9ea3-42d8716c4ebd	27084a58-1eb5-48ec-af5f-e65c3877b9a8	completed	2026-03-31 10:51:42.01	2026-03-31 10:51:44.032	2026-03-31 10:51:44.039	1	\N	2026-03-31 10:50:38.948	2026-03-31 10:51:44.039
fcab4bef-9ab7-489f-9b00-19c9fef4903a	7972edfd-5b2d-4abe-b977-aae1bc379065	completed	2026-03-31 10:51:42.708	2026-03-31 10:51:44.035	2026-03-31 10:51:44.045	1	\N	2026-03-31 10:50:39.62	2026-03-31 10:51:44.045
a61409a0-3930-48af-b83f-885aee03d072	0fd16c62-8adb-4074-9623-fc2f8abf70d6	completed	2026-03-31 10:51:44.007	2026-03-31 10:51:48.916	2026-03-31 10:51:48.987	1	\N	2026-03-31 10:50:40.946	2026-03-31 10:51:48.988
d3e59ff1-2ace-4707-b3a0-8c92b0b91e90	8fd61ba6-27dd-43d5-9949-3ebcfe57f1c8	completed	2026-03-31 10:49:41.269	2026-03-31 10:49:43.901	2026-03-31 10:49:43.975	1	\N	2026-03-31 10:48:38.178	2026-03-31 10:49:43.976
77ddc0bc-649f-4a88-abc6-343f2e5cf9dc	2fc47115-89cc-4180-955c-d41c897a612d	completed	2026-03-31 10:49:42.204	2026-03-31 10:49:43.927	2026-03-31 10:49:43.975	1	\N	2026-03-31 10:48:39.116	2026-03-31 10:49:43.976
fe21dd62-d3e7-4000-9bef-d6e9f39979d0	8c8e5628-d610-4ef1-8751-88375c8ad5c9	completed	2026-03-31 10:50:04.604	2026-03-31 10:50:08.924	2026-03-31 10:50:09.029	1	\N	2026-03-31 10:49:01.521	2026-03-31 10:50:09.03
ed13de62-f1ea-4c4a-9245-605adb1cb906	76e4019a-1aac-43c7-be7a-fd4db3f40522	completed	2026-03-31 10:51:45.278	2026-03-31 10:51:48.988	2026-03-31 10:51:48.994	1	\N	2026-03-31 10:50:42.184	2026-03-31 10:51:48.994
02a00238-1ce4-4e61-b41e-7f31a953ba3e	5606f702-84fe-4b2b-a731-ae6f17e10b44	completed	2026-03-31 10:50:06.507	2026-03-31 10:50:09.03	2026-03-31 10:50:09.039	1	\N	2026-03-31 10:49:03.418	2026-03-31 10:50:09.04
9db937f8-2201-4c4b-b42b-712761873baf	8f1133b8-91ff-431a-b230-dafd8086be86	completed	2026-03-31 10:50:11.949	2026-03-31 10:50:13.926	2026-03-31 10:50:13.983	1	\N	2026-03-31 10:49:08.857	2026-03-31 10:50:13.983
0206e50b-9834-48ae-a5ca-8848445e7047	5c06c64a-8b9b-423f-affc-29e8f64a1985	completed	2026-03-31 10:50:18.342	2026-03-31 10:50:18.927	2026-03-31 10:50:19.005	1	\N	2026-03-31 10:49:15.25	2026-03-31 10:50:19.006
64829e93-f29e-4889-8412-bc60930747b0	90991802-5e72-495b-8ad8-b7c148cf1fc7	completed	2026-03-31 10:50:19.782	2026-03-31 10:50:23.915	2026-03-31 10:50:23.921	1	\N	2026-03-31 10:49:16.696	2026-03-31 10:50:23.922
570ee5b4-13b9-4b5b-a516-1e1c0fadf39b	282b4e8d-e29b-45db-921f-7663eb87ebdb	completed	2026-03-31 10:50:22.01	2026-03-31 10:50:23.922	2026-03-31 10:50:23.928	1	\N	2026-03-31 10:49:18.915	2026-03-31 10:50:23.928
1845b826-c7e9-49b3-8a24-adbca7f002af	c4ea11ed-dad9-478a-b62e-01dcc27866a7	completed	2026-03-31 10:50:24.917	2026-03-31 10:50:28.907	2026-03-31 10:50:28.997	1	\N	2026-03-31 10:49:21.826	2026-03-31 10:50:28.998
6940e317-7924-4d07-96c6-97fba6723245	c2071308-d7c1-4932-b958-a5190b5fbd36	completed	2026-03-31 10:50:28.95	2026-03-31 10:50:33.912	2026-03-31 10:50:33.92	1	\N	2026-03-31 10:49:25.856	2026-03-31 10:50:33.921
0a1b7bbd-4f56-4c7d-9fcc-6fc743feaa3b	dba158c9-c290-477d-b498-4cd7b6e04595	completed	2026-03-31 10:50:32.071	2026-03-31 10:50:33.927	2026-03-31 10:50:33.935	1	\N	2026-03-31 10:49:28.98	2026-03-31 10:50:33.935
4759808f-cc02-4d50-9305-0bc210dc3c16	8342def2-1f3b-42e5-9276-c8274112929d	completed	2026-03-31 10:53:16.248	2026-03-31 10:53:18.903	2026-03-31 10:53:18.986	1	\N	2026-03-31 10:52:13.156	2026-03-31 10:53:18.987
86354d4d-58d2-48a0-9d33-ebeba13099ff	a4e7c01f-1c8b-4a32-be96-04a5af522c7e	completed	2026-03-31 10:53:17.122	2026-03-31 10:53:18.987	2026-03-31 10:53:18.994	1	\N	2026-03-31 10:52:14.03	2026-03-31 10:53:18.995
ff8cbd71-413e-4170-9329-3b8d8e214e85	ee99d17a-bea6-4e58-a741-e664bdeb4169	completed	2026-03-31 10:53:19.167	2026-03-31 10:53:23.936	2026-03-31 10:53:24.062	1	\N	2026-03-31 10:52:16.073	2026-03-31 10:53:24.063
2e0265a7-46d7-4c41-a36f-86111ac4ccb7	625e6e1a-3a3b-4154-84b4-f96883981014	completed	2026-03-31 10:53:25.206	2026-03-31 10:53:28.901	2026-03-31 10:53:28.98	1	\N	2026-03-31 10:52:22.112	2026-03-31 10:53:28.981
9beb481d-aea1-4676-9bda-64d96ef55db8	2ac27a10-7bef-4fe3-8642-995b763f3a02	completed	2026-03-31 10:53:26.238	2026-03-31 10:53:28.982	2026-03-31 10:53:28.988	1	\N	2026-03-31 10:52:23.144	2026-03-31 10:53:28.988
725e0f8f-0d14-40ed-a38b-d63fc7763e44	3a9c662e-e70b-4786-bbbb-465e8d6d789e	completed	2026-03-31 10:53:27.916	2026-03-31 10:53:28.99	2026-03-31 10:53:28.997	1	\N	2026-03-31 10:52:24.821	2026-03-31 10:53:28.998
5ab9ed33-782c-4ed5-9d91-3d46a989f606	9359a5a4-265b-4149-a6f0-b3955a89c39a	completed	2026-03-31 10:53:25.818	2026-03-31 10:53:28.941	2026-03-31 10:53:28.981	1	\N	2026-03-31 10:52:22.725	2026-03-31 10:53:28.981
b8f66a29-77bb-4e81-861d-349aa3164793	92839ac8-7564-4ede-91d4-628d542e0a1e	completed	2026-03-31 14:52:04.3	2026-03-31 14:52:06.863	2026-03-31 14:52:06.925	1	\N	2026-03-31 14:51:02.447	2026-03-31 14:52:06.925
83ddc3c9-3265-4e0c-8bfd-ea2460f8df1a	7ec065fc-62e5-4abe-8b7f-97d222f1d8ab	completed	2026-03-31 10:53:32.658	2026-03-31 10:53:33.902	2026-03-31 10:53:34.03	1	\N	2026-03-31 10:52:29.564	2026-03-31 10:53:34.031
d306e359-f8cd-48c4-bfea-2a45f9b114fc	6daf9ab1-55bf-49c7-8b24-03eb38fc3233	completed	2026-03-31 10:54:20.095	2026-03-31 10:54:23.903	2026-03-31 10:54:23.98	1	\N	2026-03-31 10:53:16.998	2026-03-31 10:54:23.981
35780f8a-bfbf-4ba0-ab43-769456238af0	1f75fc16-ce4c-41c6-a433-252d69a7a51b	completed	2026-03-31 10:55:18.106	2026-03-31 10:55:18.925	2026-03-31 10:55:19.008	1	\N	2026-03-31 10:54:15.009	2026-03-31 10:55:19.008
605cd5c5-e73b-4c7c-adcf-cc6b82337e06	769048bf-2f10-437c-a820-63e35c27c957	completed	2026-03-31 10:55:19.694	2026-03-31 10:55:23.949	2026-03-31 10:55:23.969	1	\N	2026-03-31 10:54:16.599	2026-03-31 10:55:23.97
a87677f8-027e-4128-b58a-ea6d64ac2b2b	580a2a76-07d3-4c9b-9ca7-3d5ee7633e81	completed	2026-03-31 10:55:49.545	2026-03-31 10:55:53.91	2026-03-31 10:55:53.979	1	\N	2026-03-31 10:54:46.451	2026-03-31 10:55:53.98
eb4bd560-4207-4f21-8e2f-016f9be95906	140018c8-f434-47dd-805d-94f446588d65	completed	2026-03-31 10:56:02.978	2026-03-31 10:56:03.908	2026-03-31 10:56:03.985	1	\N	2026-03-31 10:54:59.887	2026-03-31 10:56:03.986
05d59ea5-b222-4525-b133-618a6ad37adc	1e25ead1-c87d-4349-a349-f47450074f5e	completed	2026-03-31 10:56:24.437	2026-03-31 10:56:28.896	2026-03-31 10:56:28.964	1	\N	2026-03-31 10:55:21.344	2026-03-31 10:56:28.964
cd95d70c-3bfe-4261-961e-71a52c4eb21a	460c5db6-cc6a-4d3c-9a29-ab4f1694d029	completed	2026-03-31 10:56:27.646	2026-03-31 10:56:28.953	2026-03-31 10:56:28.964	1	\N	2026-03-31 10:55:24.553	2026-03-31 10:56:28.965
48015808-702a-48e0-a9c1-0e492dfce577	a841b203-85bf-40f7-b033-60d296ff0e25	completed	2026-03-31 10:56:40.649	2026-03-31 10:56:43.896	2026-03-31 10:56:43.902	1	\N	2026-03-31 10:55:37.555	2026-03-31 10:56:43.903
c51fb3e8-b942-4ace-a34a-5fbd6b850179	a1fdc416-1eb9-4d5a-8900-0e72cc002b53	completed	2026-03-31 10:58:08.394	2026-03-31 10:58:08.904	2026-03-31 10:58:09.011	1	\N	2026-03-31 10:57:05.3	2026-03-31 10:58:09.012
57923685-a033-4b92-83cd-a6117060db8f	ead8075c-198f-42b4-876c-7d65ed75e588	completed	2026-03-31 10:53:36.221	2026-03-31 10:53:38.942	2026-03-31 10:53:38.965	1	\N	2026-03-31 10:52:33.127	2026-03-31 10:53:38.966
47f9ad99-4cbe-4f2b-bdd9-6ce6bc7542f2	63d2ba0e-a0cd-4749-9ca6-963e70f9d0df	completed	2026-04-01 14:47:21.445	2026-04-01 14:47:25.978	2026-04-01 14:47:26.253	1	\N	2026-03-31 14:47:19.574	2026-04-01 14:47:26.254
1198ad52-ddc7-472f-bd88-b61c2645aa44	631e52df-4343-4cff-bb57-bc2bc9069f1b	completed	2026-03-31 10:54:24.681	2026-03-31 10:54:28.905	2026-03-31 10:54:28.915	1	\N	2026-03-31 10:53:21.589	2026-03-31 10:54:28.916
88dc2c9b-aad5-41fd-8358-a7e63e693f57	74d385ca-0cc7-4522-b268-e76377affad2	completed	2026-03-31 10:54:51.706	2026-03-31 10:54:53.958	2026-03-31 10:54:54.081	1	\N	2026-03-31 10:53:48.615	2026-03-31 10:54:54.082
ffceb8f9-69c6-4339-88e5-0906b13090ec	e4ab9c99-30aa-4eb8-8e72-c29eba685d01	completed	2026-03-31 10:54:57.582	2026-03-31 10:54:58.917	2026-03-31 10:54:58.998	1	\N	2026-03-31 10:53:54.487	2026-03-31 10:54:58.999
e6631382-9a60-44b6-9b55-e95b672785e4	688ea3cc-36e1-4cd2-b7a6-62518ed703d2	completed	2026-03-31 10:55:02.996	2026-03-31 10:55:03.918	2026-03-31 10:55:04.024	1	\N	2026-03-31 10:53:59.9	2026-03-31 10:55:04.024
1f73b616-09cf-41f7-a346-e34668cb1567	31e6f253-b5b7-4082-9b52-d76b1626192e	completed	2026-03-31 10:55:16.108	2026-03-31 10:55:16.112	2026-03-31 10:55:16.203	1	\N	2026-03-31 10:54:13.013	2026-03-31 10:55:16.203
4af9c76b-4a51-43cd-a400-d7eb0eae8aa1	1b72a1b1-3db1-450c-88df-005a99a00678	completed	2026-03-31 10:55:21.835	2026-03-31 10:55:23.971	2026-03-31 10:55:23.978	1	\N	2026-03-31 10:54:18.739	2026-03-31 10:55:23.979
23641972-fa81-4768-bfea-db7606a8f683	e878cfd6-1d5f-4bba-8140-3a13d0913bd0	completed	2026-03-31 10:55:27.146	2026-03-31 10:55:28.955	2026-03-31 10:55:29.013	1	\N	2026-03-31 10:54:24.052	2026-03-31 10:55:29.014
bbaaef4f-bbc7-47de-b91b-c093d7e6258a	0c315451-df4a-47b8-88e0-d28a44e0171b	completed	2026-03-31 10:55:27.79	2026-03-31 10:55:29.014	2026-03-31 10:55:29.022	1	\N	2026-03-31 10:54:24.696	2026-03-31 10:55:29.023
8ae82e20-473b-42e7-97e2-fb9d2c60c6f5	af9cd884-6c0c-4b0d-802a-d76e3acbd035	completed	2026-03-31 10:56:06.624	2026-03-31 10:56:08.906	2026-03-31 10:56:09.011	1	\N	2026-03-31 10:55:03.537	2026-03-31 10:56:09.012
9d6026f2-f365-4ac9-a12f-238a1f3f68b0	b516f982-d386-49af-8d6a-ee222c1a9f1b	completed	2026-03-31 10:56:14.02	2026-03-31 10:56:16.263	2026-03-31 10:56:16.341	1	\N	2026-03-31 10:55:10.928	2026-03-31 10:56:16.342
dea9ae09-41dd-424e-bb13-653fa9618aab	be9927f6-b8bc-49d0-b0b3-93dfaac90a4d	completed	2026-03-31 10:56:43.33	2026-03-31 10:56:43.903	2026-03-31 10:56:43.907	1	\N	2026-03-31 10:55:40.267	2026-03-31 10:56:43.908
16d437b8-caea-4e81-816e-8d1bd4a0eef8	0d2a68eb-e6bc-4239-8b59-bf42cc09b477	completed	2026-03-31 10:56:50.149	2026-03-31 10:56:53.899	2026-03-31 10:56:53.903	1	\N	2026-03-31 10:55:47.058	2026-03-31 10:56:53.904
cf2b2eed-25da-4632-a3ef-9b305ec0c515	730d3656-6ae5-4861-b3d6-11cb7bbc1095	completed	2026-03-31 10:56:53.948	2026-03-31 10:56:53.954	2026-03-31 10:56:53.959	1	\N	2026-03-31 10:55:50.856	2026-03-31 10:56:53.96
0a144b1d-831d-4d4e-9cbd-df2eb82cf18b	127c2062-c9f5-4bd6-8d0d-5bdcf234d61d	completed	2026-03-31 10:57:11.925	2026-03-31 10:57:13.902	2026-03-31 10:57:14.022	1	\N	2026-03-31 10:56:08.831	2026-03-31 10:57:14.022
eaa98efa-357c-4643-98e6-5354edfb0487	c7285791-346e-48d3-83fd-3ccc5a1c8d60	completed	2026-03-31 10:57:31.616	2026-03-31 10:57:33.907	2026-03-31 10:57:33.976	1	\N	2026-03-31 10:56:28.52	2026-03-31 10:57:33.977
3ea3a6bd-5885-4286-ad10-0067d89cc5a6	9c68adde-8e9a-43db-a5d7-0e269ae5c4e7	completed	2026-03-31 10:57:38.045	2026-03-31 10:57:38.9	2026-03-31 10:57:38.974	1	\N	2026-03-31 10:56:34.948	2026-03-31 10:57:38.975
c7a82aab-187a-41fe-b34a-d7a3215b1972	35f9fb27-edbe-461f-8a3c-cd4f5b98975e	completed	2026-03-31 10:53:41.114	2026-03-31 10:53:43.908	2026-03-31 10:53:43.985	1	\N	2026-03-31 10:52:38.018	2026-03-31 10:53:43.986
1c5207bd-ef86-47c8-b6e3-cb62ec948e67	9172ec80-6a77-4dc2-9c03-dd1c2ab25c70	completed	2026-03-31 10:54:42.289	2026-03-31 10:54:43.912	2026-03-31 10:54:44.012	1	\N	2026-03-31 10:53:39.195	2026-03-31 10:54:44.012
a9791f1a-f30b-4b5d-84ad-d82354e836fd	dca36046-b65d-4741-86dd-d282e205deb9	completed	2026-03-31 10:55:06.72	2026-03-31 10:55:08.912	2026-03-31 10:55:08.991	1	\N	2026-03-31 10:54:03.623	2026-03-31 10:55:08.991
20abedf7-975b-45f0-9bbb-7c89d397b1e9	4503c3cc-fe6d-4691-a1c0-330deb9866a8	completed	2026-03-31 10:55:26.261	2026-03-31 10:55:28.904	2026-03-31 10:55:29.013	1	\N	2026-03-31 10:54:23.17	2026-03-31 10:55:29.014
5d999926-4c0b-4833-a0df-ff5c387ca0bd	c5025698-b188-4e0c-ae1d-cbdca5dd2fe0	completed	2026-03-31 10:55:57.527	2026-03-31 10:55:58.901	2026-03-31 10:55:58.98	1	\N	2026-03-31 10:54:54.433	2026-03-31 10:55:58.981
cdff1df1-4786-4994-8dc3-4bff280e5e98	7ca81760-8427-49d9-bc64-db2216095f62	completed	2026-03-31 10:56:10.45	2026-03-31 10:56:13.9	2026-03-31 10:56:13.96	1	\N	2026-03-31 10:55:07.358	2026-03-31 10:56:13.96
57d2d5af-af30-47db-82b3-1727fe13da78	6b720310-d268-4a55-b62c-c767c08fba17	completed	2026-03-31 10:56:17.593	2026-03-31 10:56:18.901	2026-03-31 10:56:18.984	1	\N	2026-03-31 10:55:14.496	2026-03-31 10:56:18.984
19606cf3-5a9c-4e1e-93a9-45b48deb0803	f0f9cb67-ff6a-4505-aed5-67cefa17b347	completed	2026-03-31 10:56:20.836	2026-03-31 10:56:23.906	2026-03-31 10:56:23.967	1	\N	2026-03-31 10:55:17.743	2026-03-31 10:56:23.967
89713541-c982-4e84-bb25-387ea6d9145f	392d1894-aefe-4c74-ac66-76db1b732899	completed	2026-03-31 10:56:30.65	2026-03-31 10:56:33.907	2026-03-31 10:56:33.913	1	\N	2026-03-31 10:55:27.557	2026-03-31 10:56:33.914
db4e55ba-fe92-477c-9d31-1f50fe747eca	d758039e-12eb-4072-a2dd-a3e5945ef0f3	completed	2026-03-31 10:56:34.26	2026-03-31 10:56:38.927	2026-03-31 10:56:38.932	1	\N	2026-03-31 10:55:31.167	2026-03-31 10:56:38.933
6d662975-2127-468c-92e2-dabae7b75401	5a2c34a4-1e9c-408e-8de5-ffc997b96c1f	completed	2026-03-31 10:56:46.79	2026-03-31 10:56:48.898	2026-03-31 10:56:49.004	1	\N	2026-03-31 10:55:43.694	2026-03-31 10:56:49.004
5f1c383a-bf9d-4676-af83-9a400a71b046	5ae71842-9300-43c4-8e0c-b76cfe13597e	completed	2026-03-31 10:57:15.654	2026-03-31 10:57:16.146	2026-03-31 10:57:16.153	1	\N	2026-03-31 10:56:12.56	2026-03-31 10:57:16.154
4402319d-6ee7-469b-88b8-196b72030168	50cf155a-9140-453a-8549-7723365ebad1	completed	2026-03-31 10:57:19.997	2026-03-31 10:57:23.907	2026-03-31 10:57:24.032	1	\N	2026-03-31 10:56:16.904	2026-03-31 10:57:24.033
04b4e499-c63b-455e-b57b-0ad74ca6bc21	725663a6-5495-4142-b30f-2a2abb832acf	completed	2026-03-31 10:57:57.639	2026-03-31 10:57:58.962	2026-03-31 10:57:59.081	1	\N	2026-03-31 10:56:54.544	2026-03-31 10:57:59.082
\.


--
-- Data for Name: PixelEvent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PixelEvent" (id, "affiliateId", "eventName", data) FROM stdin;
\.


--
-- Data for Name: PostbackConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PostbackConfig" (id, "affiliateId", "userId", url, platform, active, "conversionType", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PostbackLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PostbackLog" (id, "postbackConfigId", "affiliateId", "dispatchTime", status, "successRate", "responseCode", "responseMessage", payload, "errorDetails") FROM stdin;
\.


--
-- Data for Name: Promotion; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Promotion" (id, slug, title, description, "rulesText", type, "bonusPercent", "bonusFixedAmount", "maxBonusAmount", "revenueMultiplier", "minDepositAmount", "maxClaimsTotal", "validFrom", "validUntil", "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: PromotionRedemption; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PromotionRedemption" (id, "promotionId", "userId", status, "redeemedAt", "consumedAt", "expiresAt", "appliedReference", "rewardValue") FROM stdin;
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Session" (id, "sessionToken", "userId", expires) FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSettings" (id, key, value, type, category, description, "updatedAt", "updatedBy") FROM stdin;
1	trading.default_payout_rate	0.9	float	trading	Taxa de payout padrão quando o par não define a própria	2026-03-26 03:42:28.859	\N
2	trading.default_expiry_minutes	5	int	trading	Tempo de expiração padrão em minutos se o campo tempo for inválido	2026-03-26 03:42:28.859	\N
\.


--
-- Data for Name: TradeOperation; Type: TABLE DATA; Schema: public; Owner: -
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
96b3796d-e307-4d70-aa64-e34a9de5b030	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-28 17:36:20.485	GBPUSD	1m	put	red	1.32623	1.32623	1	f	t	vendido	perda	0	demo	2026-03-28 17:37:17.926	655ac70d-2740-4334-a33b-3cd2da7156bd	2026-03-28 17:36:32.519	57	0.9	0	0	2	tiingo	GBPUSD
b7526c91-a73a-45b5-9149-ab03283ca942	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:46:47.419	DOGEUSDT	1m	put	red	0.09072	0.09072	1	f	t	perda	perda	0	demo	2026-03-29 00:47:46.485	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-29 00:49:50.865	59	0.9	0	0	2	binance	DOGEUSDT
2dd43ec3-5f11-48a8-869d-41d0e77600d6	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:47:04.793	DOGEUSDT	1m	put	red	0.09073	0.09073	100	f	t	perda	perda	0	demo	2026-03-29 00:48:03.864	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-29 00:50:10.863	59	0.9	0	0	2	binance	DOGEUSDT
d0dc3e87-3b7f-4a52-9281-652453aaee1d	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:45:32.088	DOGEUSDT	5m	put	red	0.09069	0.09069	100	f	t	perda	perda	0	demo	2026-03-29 00:50:31.155	a333c184-f654-4191-8ba8-6e8800ab0278	2026-03-29 00:52:35.873	299	0.9	0	0	2	binance	DOGEUSDT
b6914a7d-3b34-4a9a-b495-6e5146abfa0a	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:50:54.11	SOLUSDT	1m	put	red	82.12	82.12	1000	f	t	perda	perda	0	demo	2026-03-29 00:51:53.179	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-29 00:53:55.872	59	0.9	0	0	2	binance	SOLUSDT
8745f7d2-fa34-4671-8cc2-bc0df8c42ee0	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:52:36.925	SOLUSDT	1m	call	green	82.16	82.16	1000	f	t	perda	perda	0	demo	2026-03-29 00:53:36.006	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-29 00:55:40.867	59	0.9	0	0	2	binance	SOLUSDT
ff7613f5-9c54-4405-9032-45baa67f0c73	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:52:49.114	SOLUSDT	1m	call	green	82.17	82.17	1000	f	t	perda	perda	0	demo	2026-03-29 00:53:48.206	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-29 00:55:54.237	59	0.9	0	0	2	binance	SOLUSDT
331f2187-60d8-4d03-8c94-4439592d14c1	3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	2026-03-29 00:53:36.904	SOLUSDT	1m	put	red	82.11	82.11	1000	f	t	perda	perda	0	demo	2026-03-29 00:54:35.992	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-29 00:56:40.88	59	0.9	0	0	2	binance	SOLUSDT
67b9e6aa-e77f-4ee2-8cd8-30dc46819aaa	e314e4fb-5355-46d8-b591-13fee3b68979	2026-03-29 06:17:38.937	BTCUSDT	1m	call	green	66789.22	66795.01	1	f	t	ganho	ganho	0.9	demo	2026-03-29 06:18:38.827	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-03-29 06:18:41.977	60	0.9	0	0	2	binance	BTCUSDT
789b9a07-c145-4ede-afee-8aaa3540f5c4	e314e4fb-5355-46d8-b591-13fee3b68979	2026-03-29 06:17:31.823	BTCUSDT	5m	call	green	66780.85	66756	1	f	t	perda	perda	0	demo	2026-03-29 06:22:31.706	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-03-29 06:22:35.797	300	0.9	0	0	2	binance	BTCUSDT
86e77bf1-3ab5-4c54-9784-32a620bcf47a	e314e4fb-5355-46d8-b591-13fee3b68979	2026-03-29 06:22:52.561	BTCUSDT	1m	call	green	66755.99	66706.23	1	f	t	perda	perda	0	demo	2026-03-29 06:23:52.448	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-03-29 06:23:55.599	60	0.9	0	0	2	binance	BTCUSDT
00c35eea-8806-4770-b967-8ed6525e347f	e314e4fb-5355-46d8-b591-13fee3b68979	2026-03-29 06:46:03.785	BTCUSDT	5m	call	green	66610.71	66611.55	1	f	t	vendido	ganho	1.261058469426146e-05	demo	2026-03-29 06:51:03.68	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-03-29 06:46:54.999	300	0.9	0	0	2	binance	BTCUSDT
2a8a269f-32dc-4a34-b756-553f1447e3a5	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 18:09:41.158	AUDUSD	1m	put	red	0.68554	0.68557	1000	f	t	perda	perda	0	demo	2026-03-30 18:10:52.026	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 18:10:57.512	71	0.9	0	0	2	tiingo	AUDUSD
d6549d78-e01d-4f8e-9251-acf1ac9b5672	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 18:11:20.57	AUDUSD	1m	call	green	0.68557	0.68556	1000	f	t	perda	perda	0	demo	2026-03-30 18:12:31.438	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 18:12:37.505	71	0.9	0	0	2	tiingo	AUDUSD
a3ad2d7f-315a-45f9-b587-20709c882b01	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:04:50.103	AUDUSD	1m	call	green	0.68525	0.68525	2000	f	t	perda	perda	0	demo	2026-03-30 21:05:50.019	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 21:05:52.299	60	0.9	0	0	2	tiingo	AUDUSD
d4365e11-dd8f-4f41-87c1-0c1d69a2d6df	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:06:04.608	AUDUSD	1m	call	green	0.68525	0.68525	2000	f	t	perda	perda	0	demo	2026-03-30 21:07:04.519	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 21:07:07.325	60	0.9	0	0	2	tiingo	AUDUSD
d3b864f0-f3be-499a-922e-18ede3938afc	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:06:06.644	AUDUSD	1m	call	green	0.68525	0.68525	2000	f	t	perda	perda	0	demo	2026-03-30 21:07:06.567	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 21:07:10.06	60	0.9	0	0	2	tiingo	AUDUSD
9ad0230a-1ab0-4b7e-92c0-3b860fbc6a59	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:08:09.687	AUDUSD	1m	call	green	0.68525	0.68525	1000	f	t	perda	perda	0	demo	2026-03-30 21:09:09.61	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 21:09:12.286	60	0.9	0	0	2	tiingo	AUDUSD
f3db7f59-dadf-4b2a-b1aa-a2bd9231ae77	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:08:17.562	SOLUSDT	1m	call	green	82.67	82.83	1000	f	t	ganho	ganho	900	demo	2026-03-30 21:09:17.476	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:09:20.341	60	0.9	0	0	2	binance	SOLUSDT
23e6287d-cd02-4536-ae85-9f707fe920bc	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:34.276	SOLUSDT	1m	call	green	83.19	83.21	100	f	t	ganho	ganho	90	demo	2026-03-30 21:14:34.197	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:14:39.23	60	0.9	0	0	2	binance	SOLUSDT
be5eb1b7-8d19-40ed-97e9-4a8e2dc09d31	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:37.915	SOLUSDT	1m	call	green	83.19	83.21	100	f	t	ganho	ganho	90	demo	2026-03-30 21:14:37.843	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:14:40.096	60	0.9	0	0	2	binance	SOLUSDT
8f9094be-cdca-4fb5-bc1e-d66d961ecdbc	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:53.634	SOLUSDT	1m	call	green	83.1128	83.2271	1000	f	t	ganho	ganho	900	demo	2026-03-30 21:14:53.559	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:14:59.244	60	0.9	0	0	2	binance	SOLUSDT
b7a960b5-6b68-4990-9eae-1f30f0ca4de9	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:54.588	SOLUSDT	1m	call	green	83.11	83.2271	1000	f	t	ganho	ganho	900	demo	2026-03-30 21:14:54.515	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:14:59.265	60	0.9	0	0	2	binance	SOLUSDT
50df87f9-2402-4251-afda-a8d9062ab05b	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:12:04.924	AUDUSD	5m	call	green	0.6848	0.68475	1500	f	t	perda	perda	0	demo	2026-03-30 21:17:04.835	9e4690b8-9e85-4903-a2e4-16d0e8db90b8	2026-03-30 21:17:09.829	300	0.9	0	0	2	tiingo	AUDUSD
de88af0c-92b6-48f3-b139-ec07d4d90c6f	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:10.562	SOLUSDT	5m	call	green	83.24	83.28	100	f	t	ganho	ganho	90	demo	2026-03-30 21:18:10.461	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:18:15.113	300	0.9	0	0	2	binance	SOLUSDT
7a666dba-927b-42d1-9682-7622c42319a8	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:14:02.96	SOLUSDT	1m	call	green	83.1166	83.2	1000	f	t	ganho	ganho	900	demo	2026-03-30 21:15:02.871	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:15:05.103	60	0.9	0	0	2	binance	SOLUSDT
8342def2-1f3b-42e5-9276-c8274112929d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:13.152	USDCHF	1m	call	green	0.801075	0.80094	1000	f	t	perda	perda	0	demo	2026-03-31 10:53:14.248	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:18.981	61	0.9	0	0	2	tiingo	USDCHF
a4e7c01f-1c8b-4a32-be96-04a5af522c7e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:14.025	USDCHF	1m	call	green	0.801075	0.80094	1000	f	t	perda	perda	0	demo	2026-03-31 10:53:15.122	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:18.991	61	0.9	0	0	2	tiingo	USDCHF
ee99d17a-bea6-4e58-a741-e664bdeb4169	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:16.07	USDCHF	1m	call	green	0.801075	0.80094	1000	f	t	perda	perda	0	demo	2026-03-31 10:53:17.167	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:24.06	61	0.9	0	0	2	tiingo	USDCHF
625e6e1a-3a3b-4154-84b4-f96883981014	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:22.109	USDCHF	1m	call	green	0.801075	0.80094	2250	f	t	perda	perda	0	demo	2026-03-31 10:53:23.206	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:28.977	61	0.9	0	0	2	tiingo	USDCHF
2ac27a10-7bef-4fe3-8642-995b763f3a02	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:23.141	USDCHF	1m	call	green	0.801075	0.80094	2250	f	t	perda	perda	0	demo	2026-03-31 10:53:24.238	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:28.985	61	0.9	0	0	2	tiingo	USDCHF
3a9c662e-e70b-4786-bbbb-465e8d6d789e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:24.817	USDCHF	1m	call	green	0.801075	0.80094	2250	f	t	perda	perda	0	demo	2026-03-31 10:53:25.916	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:28.994	61	0.9	0	0	2	tiingo	USDCHF
ead8075c-198f-42b4-876c-7d65ed75e588	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:33.123	USDCHF	1m	call	green	0.801045	0.800955	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:34.221	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:38.961	61	0.9	0	0	2	tiingo	USDCHF
35f9fb27-edbe-461f-8a3c-cd4f5b98975e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:38.015	USDCHF	1m	call	green	0.800975	0.800955	950	f	t	perda	perda	0	demo	2026-03-31 10:53:39.114	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:43.981	61	0.9	0	0	2	tiingo	USDCHF
631e52df-4343-4cff-bb57-bc2bc9069f1b	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:21.585	USDCHF	1m	call	green	0.800935	0.800895	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:22.681	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:28.911	61	0.9	0	0	2	tiingo	USDCHF
ef849655-ccd4-414d-a44a-4ba32434847a	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:31.849	USDCHF	1m	call	green	0.800935	0.800875	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:32.945	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:38.914	61	0.9	0	0	2	tiingo	USDCHF
74d385ca-0cc7-4522-b268-e76377affad2	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:48.612	USDCHF	1m	call	green	0.800955	0.80082	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:49.706	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:54.075	61	0.9	0	0	2	tiingo	USDCHF
e4ab9c99-30aa-4eb8-8e72-c29eba685d01	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:54.485	USDCHF	1m	call	green	0.800955	0.80081	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:55.582	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:58.993	61	0.9	0	0	2	tiingo	USDCHF
688ea3cc-36e1-4cd2-b7a6-62518ed703d2	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:59.896	USDCHF	1m	call	green	0.800965	0.80084	10000	f	t	perda	perda	0	demo	2026-03-31 10:55:00.996	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:04.021	61	0.9	0	0	2	tiingo	USDCHF
31e6f253-b5b7-4082-9b52-d76b1626192e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:13.01	USDCHF	1m	call	green	0.800935	0.800835	500	f	t	perda	perda	0	demo	2026-03-31 10:55:14.108	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:16.189	61	0.9	0	0	2	tiingo	USDCHF
096f40ac-5878-4087-bd9a-60fd026ecc96	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:15.976	USDCHF	1m	call	green	0.800935	0.80081	500	f	t	perda	perda	0	demo	2026-03-31 10:55:17.076	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:23.966	61	0.9	0	0	2	tiingo	USDCHF
4503c3cc-fe6d-4691-a1c0-330deb9866a8	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:23.167	USDCHF	1m	call	green	0.80091	0.800865	500	f	t	perda	perda	0	demo	2026-03-31 10:55:24.261	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:29.01	61	0.9	0	0	2	tiingo	USDCHF
c5025698-b188-4e0c-ae1d-cbdca5dd2fe0	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:54.43	USDCHF	1m	put	red	0.8008	0.80094	10000	f	t	perda	perda	0	demo	2026-03-31 10:55:55.527	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:58.977	61	0.9	0	0	2	tiingo	USDCHF
1e25ead1-c87d-4349-a349-f47450074f5e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:21.339	USDCHF	1m	put	red	0.800805	0.800945	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:22.437	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:28.961	61	0.9	0	0	2	tiingo	USDCHF
460c5db6-cc6a-4d3c-9a29-ab4f1694d029	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:24.55	USDCHF	1m	put	red	0.800805	0.800945	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:25.646	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:28.961	61	0.9	0	0	2	tiingo	USDCHF
a841b203-85bf-40f7-b033-60d296ff0e25	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:37.551	USDCHF	1m	put	red	0.800865	0.800945	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:38.649	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:43.9	61	0.9	0	0	2	tiingo	USDCHF
5a2c34a4-1e9c-408e-8de5-ffc997b96c1f	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:43.689	USDCHF	1m	put	red	0.800875	0.800935	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:44.79	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:49	61	0.9	0	0	2	tiingo	USDCHF
5ae71842-9300-43c4-8e0c-b76cfe13597e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:12.556	USDCHF	1m	call	green	0.800935	0.80091	10000	f	t	perda	perda	0	demo	2026-03-31 10:57:13.654	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:16.15	61	0.9	0	0	2	tiingo	USDCHF
50cf155a-9140-453a-8549-7723365ebad1	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:16.9	USDCHF	1m	call	green	0.800935	0.8009	10000	f	t	perda	perda	0	demo	2026-03-31 10:57:17.997	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:24.028	61	0.9	0	0	2	tiingo	USDCHF
725663a6-5495-4142-b30f-2a2abb832acf	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:54.541	USDCHF	1m	call	green	0.800945	0.80107	10000	f	t	ganho	ganho	9000	demo	2026-03-31 10:57:55.639	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:59.077	61	0.9	0	0	2	tiingo	USDCHF
df6780e0-8424-4f6c-b0e4-69d2d3cf49ea	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:13:18.04	SOLUSDT	1m	call	green	83.232	83.19	100	f	t	perda	perda	0	demo	2026-03-30 21:14:17.965	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:14:20.112	60	0.9	0	0	2	binance	SOLUSDT
b83ab878-5288-461c-a7a6-cc034fe4f0df	871eddac-50e8-4602-93b2-ec52c0f66d35	2026-03-30 21:31:53.511	SOLUSDT	1m	call	green	83.27	83.29	1000	f	t	ganho	ganho	900	demo	2026-03-30 21:32:53.442	5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	2026-03-30 21:32:56.285	60	0.9	0	0	2	binance	SOLUSDT
14fe50d4-51a7-40cd-a9cb-ca02182c4f4d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:45:24.853	USDCHF	5m	put	red	0.800825	0.800845	1000	f	t	vendido	perda	-0.0249742453095223	demo	2026-03-31 10:50:25.946	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:45:54.253	301	0.9	0	0	2	tiingo	USDCHF
27c75ba4-c00a-4773-b897-969e0e150439	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:46:08.758	USDCHF	1m	put	red	0.800885	0.800895	1000	f	t	perda	perda	0	demo	2026-03-31 10:47:09.85	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:47:13.903	61	0.9	0	0	2	tiingo	USDCHF
715c02a8-7bcc-499c-adc8-436cb3175063	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:46:15.254	USDCHF	1m	put	red	0.800885	0.8009	1000	f	t	perda	perda	0	demo	2026-03-31 10:47:16.35	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:47:18.908	61	0.9	0	0	2	tiingo	USDCHF
5a7a781a-cb0d-453a-b96c-88f15524637d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:13.616	USDCHF	1m	call	green	0.801075	0.80094	1000	f	t	perda	perda	0	demo	2026-03-31 10:53:14.714	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:18.982	61	0.9	0	0	2	tiingo	USDCHF
cfa70782-5128-4eee-8415-5aa15d7ffeb6	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:14.456	USDCHF	1m	call	green	0.801075	0.80094	1000	f	t	perda	perda	0	demo	2026-03-31 10:53:15.552	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:18.994	61	0.9	0	0	2	tiingo	USDCHF
7ec065fc-62e5-4abe-8b7f-97d222f1d8ab	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:29.56	USDCHF	1m	call	green	0.801045	0.800945	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:30.658	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:34.025	61	0.9	0	0	2	tiingo	USDCHF
506aaff1-0c3c-43a3-ae46-e84dfa373e0c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:30.329	USDCHF	1m	call	green	0.801045	0.800945	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:31.424	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:34.039	61	0.9	0	0	2	tiingo	USDCHF
bee3d76e-ccd9-472b-9321-9c49824ca726	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:31.152	USDCHF	1m	call	green	0.801045	0.800955	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:32.252	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:38.96	61	0.9	0	0	2	tiingo	USDCHF
671e3ba4-8f65-41a2-b212-7b25a0a09372	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:32.65	USDCHF	1m	put	red	0.800895	0.800995	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:33.748	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:39.025	61	0.9	0	0	2	tiingo	USDCHF
49e98b57-3835-485a-9e98-647fa1d5bc01	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:34.412	USDCHF	1m	put	red	0.800895	0.800995	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:35.503	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:39.026	61	0.9	0	0	2	tiingo	USDCHF
68f63c88-6527-4ffb-b8cb-a4d01bf979aa	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:35.503	USDCHF	1m	put	red	0.800895	0.800995	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:36.585	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:39.035	61	0.9	0	0	2	tiingo	USDCHF
6daf9ab1-55bf-49c7-8b24-03eb38fc3233	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:16.995	USDCHF	1m	call	green	0.800935	0.800905	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:18.095	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:23.976	61	0.9	0	0	2	tiingo	USDCHF
aa3d9d80-571d-472f-b539-a79af2fd33c6	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:38.478	USDCHF	1m	put	red	0.800895	0.800995	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:39.57	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:43.989	61	0.9	0	0	2	tiingo	USDCHF
f0f58495-74b3-4474-b376-eaeb8a121f18	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:40.681	USDCHF	1m	put	red	0.8009	0.800995	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:41.773	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:43.989	61	0.9	0	0	2	tiingo	USDCHF
54a23ada-2d29-4e1e-aba9-dbbb4f04f1be	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:43.685	USDCHF	1m	put	red	0.8009	0.800985	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:44.78	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:48.99	61	0.9	0	0	2	tiingo	USDCHF
eb6ad75e-493e-4f1f-a2cb-7c9b11e43957	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:44.554	USDCHF	1m	put	red	0.8009	0.800985	1000	f	t	perda	perda	0	demo	2026-03-31 10:48:45.649	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:48.99	61	0.9	0	0	2	tiingo	USDCHF
b9b514f4-d8ff-4492-afb4-28b7ad584901	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:25.289	USDCHF	1m	call	green	0.800935	0.800895	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:26.386	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:28.922	61	0.9	0	0	2	tiingo	USDCHF
bef8b8e8-0835-47fc-a72d-76676a53c515	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:47:48.423	USDCHF	1m	put	red	0.8009	0.80099	970	f	t	perda	perda	0	demo	2026-03-31 10:48:49.521	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:48:53.989	61	0.9	0	0	2	tiingo	USDCHF
8fd61ba6-27dd-43d5-9949-3ebcfe57f1c8	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:38.173	USDCHF	1m	put	red	0.800995	0.801035	5000	f	t	perda	perda	0	demo	2026-03-31 10:49:39.269	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:43.972	61	0.9	0	0	2	tiingo	USDCHF
2fc47115-89cc-4180-955c-d41c897a612d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:39.112	USDCHF	1m	put	red	0.800995	0.801035	5000	f	t	perda	perda	0	demo	2026-03-31 10:49:40.204	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:43.973	61	0.9	0	0	2	tiingo	USDCHF
546891f4-0a49-46b0-9b4b-fab2c4559566	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:50.121	USDCHF	1m	put	red	0.800995	0.80104	1000	f	t	perda	perda	0	demo	2026-03-31 10:49:51.217	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:53.999	61	0.9	0	0	2	tiingo	USDCHF
fa894eea-f96b-42d6-a42f-6bbf596ca17e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:54.385	USDCHF	1m	put	red	0.800985	0.801065	1000	f	t	perda	perda	0	demo	2026-03-31 10:49:55.481	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:59.02	61	0.9	0	0	2	tiingo	USDCHF
c5bed1c7-2cd1-452e-bc1e-4f3d03a2668a	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:29.919	USDCHF	1m	call	green	0.801045	0.800945	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:31.017	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:34.025	61	0.9	0	0	2	tiingo	USDCHF
6659ea64-ecf1-47f6-ada5-31a2b7ef79cf	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:49.238	USDCHF	1m	put	red	0.800995	0.80104	1000	f	t	perda	perda	0	demo	2026-03-31 10:49:50.33	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:53.999	61	0.9	0	0	2	tiingo	USDCHF
1cc61870-38f8-487a-8c8e-26d946305f5c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:48:50.796	USDCHF	1m	put	red	0.800985	0.80104	1000	f	t	perda	perda	0	demo	2026-03-31 10:49:51.89	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:49:54.011	61	0.9	0	0	2	tiingo	USDCHF
d187cb77-8444-4d2c-8ee3-2f7100963a89	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:02.735	USDCHF	1m	put	red	0.801	0.8011	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:03.829	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:09.025	61	0.9	0	0	2	tiingo	USDCHF
8c8e5628-d610-4ef1-8751-88375c8ad5c9	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:01.515	USDCHF	1m	put	red	0.801	0.8011	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:02.604	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:09.026	61	0.9	0	0	2	tiingo	USDCHF
5606f702-84fe-4b2b-a731-ae6f17e10b44	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:03.414	USDCHF	1m	put	red	0.801	0.8011	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:04.507	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:09.036	61	0.9	0	0	2	tiingo	USDCHF
2c72bd7c-eaee-4217-8e50-29412e9f2f29	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:07.319	USDCHF	1m	put	red	0.801	0.801085	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:08.415	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:13.979	61	0.9	0	0	2	tiingo	USDCHF
8f1133b8-91ff-431a-b230-dafd8086be86	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:08.853	USDCHF	1m	put	red	0.801	0.801085	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:09.949	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:13.979	61	0.9	0	0	2	tiingo	USDCHF
7ab7cca3-014d-4984-8384-22ceb32b3b56	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:10.632	USDCHF	1m	put	red	0.801	0.801085	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:11.717	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:13.988	61	0.9	0	0	2	tiingo	USDCHF
6966ff39-eb48-4c6a-8fd0-e7e0b09eca4f	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:16.012	USDCHF	1m	put	red	0.80103	0.801065	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:17.107	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:23.911	61	0.9	0	0	2	tiingo	USDCHF
90991802-5e72-495b-8ad8-b7c148cf1fc7	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:16.691	USDCHF	1m	put	red	0.80103	0.801065	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:17.782	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:23.918	61	0.9	0	0	2	tiingo	USDCHF
282b4e8d-e29b-45db-921f-7663eb87ebdb	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:18.912	USDCHF	1m	put	red	0.80103	0.801065	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:20.01	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:23.926	61	0.9	0	0	2	tiingo	USDCHF
87f0597c-41a8-46f0-acc9-995e008d5bda	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:20.348	USDCHF	1m	put	red	0.80103	0.801065	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:21.441	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:23.932	61	0.9	0	0	2	tiingo	USDCHF
c2071308-d7c1-4932-b958-a5190b5fbd36	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:25.853	USDCHF	1m	put	red	0.80104	0.801095	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:26.95	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:33.916	61	0.9	0	0	2	tiingo	USDCHF
84046ac6-9c6c-4d95-8eaf-0dcd938dda42	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:27.129	USDCHF	1m	put	red	0.80104	0.801095	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:28.213	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:33.926	61	0.9	0	0	2	tiingo	USDCHF
dba158c9-c290-477d-b498-4cd7b6e04595	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:28.976	USDCHF	1m	put	red	0.80104	0.801095	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:30.071	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:33.932	61	0.9	0	0	2	tiingo	USDCHF
be41b0d1-fa68-41ed-9206-367f5398792a	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:11.089	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:12.183	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:16.481	61	0.9	0	0	2	tiingo	USDCHF
31c2d770-e85e-450b-aeef-2ee5a5b34995	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:11.304	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:12.397	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:16.49	61	0.9	0	0	2	tiingo	USDCHF
508e6b69-46eb-458b-87cd-454d4cb13340	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:11.755	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:12.851	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:16.497	61	0.9	0	0	2	tiingo	USDCHF
83700174-10a8-4911-965e-015fe0d57d0a	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:12.137	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:13.236	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:16.504	61	0.9	0	0	2	tiingo	USDCHF
8110e192-29a2-4816-8424-c4741d761fbd	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:13.56	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:14.655	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:18.994	61	0.9	0	0	2	tiingo	USDCHF
03b1bed8-6312-4db7-804a-7d9bba47557d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:14.769	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:15.858	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:18.994	61	0.9	0	0	2	tiingo	USDCHF
6dad58f3-bf91-469c-86da-de0e3e8c47b2	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:16.279	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:17.374	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:24.059	61	0.9	0	0	2	tiingo	USDCHF
a8deb985-ff0c-4cc2-a25f-0548dc2f6ca4	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:17.545	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:18.643	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:24.06	61	0.9	0	0	2	tiingo	USDCHF
dd5a5392-bd0d-416a-906d-b2c0e7919867	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:28.769	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:29.867	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.06	61	0.9	0	0	2	tiingo	USDCHF
9359a5a4-265b-4149-a6f0-b3955a89c39a	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:22.722	USDCHF	1m	call	green	0.801075	0.80094	2250	f	t	perda	perda	0	demo	2026-03-31 10:53:23.818	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:28.977	61	0.9	0	0	2	tiingo	USDCHF
cfdb9276-56b5-4cb7-b5fa-662e18e047c8	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:30.582	USDCHF	1m	call	green	0.801045	0.800945	3150	f	t	perda	perda	0	demo	2026-03-31 10:53:31.681	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:34.046	61	0.9	0	0	2	tiingo	USDCHF
f17520f2-33f6-4eac-a115-a9505a89bd0e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:23.836	USDCHF	1m	put	red	0.80104	0.801105	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:24.931	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:28.993	61	0.9	0	0	2	tiingo	USDCHF
f1377916-c91c-43e3-80ea-7679c80fa957	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:28.676	USDCHF	1m	call	green	0.800935	0.80088	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:29.774	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:34.003	61	0.9	0	0	2	tiingo	USDCHF
0e638ee8-9d3b-4280-be32-2873c39a1a2c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:18.875	USDCHF	1m	call	green	0.80109	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:19.972	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:24.072	61	0.9	0	0	2	tiingo	USDCHF
222cbb6f-b1ee-4db8-a244-868da51ffb8c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:22.274	USDCHF	1m	call	green	0.80109	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:23.37	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:28.992	61	0.9	0	0	2	tiingo	USDCHF
4cebb766-65b2-4f39-a7d9-c11ce297b035	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:26.152	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:27.249	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.034	61	0.9	0	0	2	tiingo	USDCHF
30f8f8fd-e7c3-4dd0-a441-7ebac547e3ff	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:26.344	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:27.44	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.035	61	0.9	0	0	2	tiingo	USDCHF
ac3bc218-64d7-419d-a623-b5d4f0a20a13	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:26.545	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:27.632	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.044	61	0.9	0	0	2	tiingo	USDCHF
671c18f6-594f-41a1-ad77-1160a24dc10c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:29.618	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:30.717	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.061	61	0.9	0	0	2	tiingo	USDCHF
4c460589-f824-42e0-bd5c-941ec5e1f6f2	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:31.467	USDCHF	1m	call	green	0.801065	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:32.563	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:38.965	61	0.9	0	0	2	tiingo	USDCHF
3a17e238-b7c0-4ba6-aa05-3c102860a68f	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:36.617	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:37.712	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.019	61	0.9	0	0	2	tiingo	USDCHF
4bde13c8-ec69-46f2-ad7f-6c911bf81ec8	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:37.278	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:38.377	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.027	61	0.9	0	0	2	tiingo	USDCHF
1f75fc16-ce4c-41c6-a433-252d69a7a51b	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:15.006	USDCHF	1m	call	green	0.800935	0.800805	500	f	t	perda	perda	0	demo	2026-03-31 10:55:16.106	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:19.004	61	0.9	0	0	2	tiingo	USDCHF
769048bf-2f10-437c-a820-63e35c27c957	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:16.596	USDCHF	1m	call	green	0.800935	0.80081	500	f	t	perda	perda	0	demo	2026-03-31 10:55:17.694	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:23.965	61	0.9	0	0	2	tiingo	USDCHF
580a2a76-07d3-4c9b-9ca7-3d5ee7633e81	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:46.448	USDCHF	1m	put	red	0.800875	0.80089	500	f	t	perda	perda	0	demo	2026-03-31 10:55:47.545	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:53.977	61	0.9	0	0	2	tiingo	USDCHF
7ca81760-8427-49d9-bc64-db2216095f62	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:07.353	USDCHF	1m	put	red	0.80081	0.80094	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:08.45	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:13.957	61	0.9	0	0	2	tiingo	USDCHF
6b720310-d268-4a55-b62c-c767c08fba17	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:14.493	USDCHF	1m	put	red	0.80084	0.800935	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:15.593	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:18.982	61	0.9	0	0	2	tiingo	USDCHF
f0f9cb67-ff6a-4505-aed5-67cefa17b347	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:17.738	USDCHF	1m	put	red	0.80084	0.80094	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:18.836	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:23.964	61	0.9	0	0	2	tiingo	USDCHF
392d1894-aefe-4c74-ac66-76db1b732899	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:27.553	USDCHF	1m	put	red	0.800805	0.80094	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:28.65	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:33.91	61	0.9	0	0	2	tiingo	USDCHF
d758039e-12eb-4072-a2dd-a3e5945ef0f3	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:31.163	USDCHF	1m	put	red	0.800865	0.80093	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:32.26	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:38.93	61	0.9	0	0	2	tiingo	USDCHF
a1fdc416-1eb9-4d5a-8900-0e72cc002b53	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:57:05.295	USDCHF	1m	call	green	0.800955	0.801115	10000	f	t	ganho	ganho	9000	demo	2026-03-31 10:58:06.394	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:58:09.007	61	0.9	0	0	2	tiingo	USDCHF
5c06c64a-8b9b-423f-affc-29e8f64a1985	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:15.247	USDCHF	1m	put	red	0.80103	0.801075	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:16.342	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:19.003	61	0.9	0	0	2	tiingo	USDCHF
30288c20-5fe5-4991-9e7f-bd931592bb21	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:52:23.516	USDCHF	1m	call	green	0.801075	0.80094	2250	f	t	perda	perda	0	demo	2026-03-31 10:53:24.609	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:53:28.987	61	0.9	0	0	2	tiingo	USDCHF
cee4d3ed-caec-452f-a9aa-1c860010455c	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:27.791	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:28.886	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.049	61	0.9	0	0	2	tiingo	USDCHF
eb0451c7-734b-4e8e-8c2b-918289855eeb	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:35.301	USDCHF	1m	call	green	0.800935	0.800875	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:36.396	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:38.921	61	0.9	0	0	2	tiingo	USDCHF
9172ec80-6a77-4dc2-9c03-dd1c2ab25c70	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:53:39.192	USDCHF	1m	call	green	0.800945	0.80085	10000	f	t	perda	perda	0	demo	2026-03-31 10:54:40.289	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:54:44.008	61	0.9	0	0	2	tiingo	USDCHF
140018c8-f434-47dd-805d-94f446588d65	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:59.882	USDCHF	1m	put	red	0.80081	0.800935	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:00.978	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:03.981	61	0.9	0	0	2	tiingo	USDCHF
af9cd884-6c0c-4b0d-802a-d76e3acbd035	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:03.53	USDCHF	1m	put	red	0.80081	0.80093	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:04.624	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:09.008	61	0.9	0	0	2	tiingo	USDCHF
b516f982-d386-49af-8d6a-ee222c1a9f1b	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:10.923	USDCHF	1m	put	red	0.80084	0.80094	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:12.02	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:16.338	61	0.9	0	0	2	tiingo	USDCHF
730d3656-6ae5-4861-b3d6-11cb7bbc1095	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:50.852	USDCHF	1m	put	red	0.8009	0.800955	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:51.948	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:53.957	61	0.9	0	0	2	tiingo	USDCHF
9c68adde-8e9a-43db-a5d7-0e269ae5c4e7	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:34.945	USDCHF	1m	call	green	0.80094	0.80105	10000	f	t	ganho	ganho	9000	demo	2026-03-31 10:57:36.045	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:38.97	61	0.9	0	0	2	tiingo	USDCHF
63d2ba0e-a0cd-4749-9ca6-963e70f9d0df	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	2026-03-31 14:47:19.567	BTCUSDT	1d	put	red	67069.2	68333.94	10	f	t	perda	perda	0	demo	2026-04-01 14:47:19.445	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-04-01 14:47:26.247	86400	0.9	0	0	2	binance	BTCUSDT
c4ea11ed-dad9-478a-b62e-01dcc27866a7	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:49:21.822	USDCHF	1m	put	red	0.80104	0.801105	1000	f	t	perda	perda	0	demo	2026-03-31 10:50:22.917	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:50:28.992	61	0.9	0	0	2	tiingo	USDCHF
dca36046-b65d-4741-86dd-d282e205deb9	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:03.619	USDCHF	1m	call	green	0.800965	0.80084	10000	f	t	perda	perda	0	demo	2026-03-31 10:55:04.72	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:08.987	61	0.9	0	0	2	tiingo	USDCHF
1b72a1b1-3db1-450c-88df-005a99a00678	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:18.736	USDCHF	1m	call	green	0.80091	0.80081	500	f	t	perda	perda	0	demo	2026-03-31 10:55:19.835	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:23.975	61	0.9	0	0	2	tiingo	USDCHF
e878cfd6-1d5f-4bba-8140-3a13d0913bd0	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:24.048	USDCHF	1m	call	green	0.80091	0.800865	500	f	t	perda	perda	0	demo	2026-03-31 10:55:25.146	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:29.01	61	0.9	0	0	2	tiingo	USDCHF
0c315451-df4a-47b8-88e0-d28a44e0171b	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:54:24.692	USDCHF	1m	call	green	0.80091	0.800865	500	f	t	perda	perda	0	demo	2026-03-31 10:55:25.79	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:55:29.018	61	0.9	0	0	2	tiingo	USDCHF
bf0f4f99-0d36-40db-90cf-4c5cc5b14578	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:30.446	USDCHF	1m	call	green	0.801065	0.8011	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:31.54	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:34.07	61	0.9	0	0	2	tiingo	USDCHF
e47aed79-6b13-4e0c-a535-4c61f0af28cd	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:32.85	USDCHF	1m	call	green	0.801065	0.801105	1000	f	t	ganho	ganho	900	demo	2026-03-31 10:51:33.943	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:38.965	61	0.9	0	0	2	tiingo	USDCHF
015d1e7c-42c5-4165-837e-77f37a1d1fe7	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:37.029	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:38.124	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.019	61	0.9	0	0	2	tiingo	USDCHF
8a723dd5-5369-4cce-9611-d83969f5447e	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:38.388	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:39.486	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.029	61	0.9	0	0	2	tiingo	USDCHF
27084a58-1eb5-48ec-af5f-e65c3877b9a8	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:38.939	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:40.01	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.036	61	0.9	0	0	2	tiingo	USDCHF
7972edfd-5b2d-4abe-b977-aae1bc379065	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:39.616	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:40.708	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.04	61	0.9	0	0	2	tiingo	USDCHF
514fe95b-e32a-4f32-877f-87e5c703f3ff	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:40.262	USDCHF	1m	call	green	0.801095	0.801035	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:41.353	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:44.048	61	0.9	0	0	2	tiingo	USDCHF
e7c1151a-cacb-4d87-add8-e2b8859da769	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:41.54	USDCHF	1m	call	green	0.801095	0.801045	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:42.638	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:48.984	61	0.9	0	0	2	tiingo	USDCHF
0fd16c62-8adb-4074-9623-fc2f8abf70d6	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:40.93	USDCHF	1m	call	green	0.801095	0.801045	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:42.007	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:48.985	61	0.9	0	0	2	tiingo	USDCHF
76e4019a-1aac-43c7-be7a-fd4db3f40522	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:50:42.18	USDCHF	1m	call	green	0.801095	0.801045	1000	f	t	perda	perda	0	demo	2026-03-31 10:51:43.278	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:51:48.992	61	0.9	0	0	2	tiingo	USDCHF
be9927f6-b8bc-49d0-b0b3-93dfaac90a4d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:40.258	USDCHF	1m	put	red	0.800865	0.800945	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:41.33	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:43.905	61	0.9	0	0	2	tiingo	USDCHF
0d2a68eb-e6bc-4239-8b59-bf42cc09b477	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:55:47.055	USDCHF	1m	put	red	0.800875	0.800955	10000	f	t	perda	perda	0	demo	2026-03-31 10:56:48.149	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:56:53.901	61	0.9	0	0	2	tiingo	USDCHF
127c2062-c9f5-4bd6-8d0d-5bdcf234d61d	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:08.828	USDCHF	1m	call	green	0.80094	0.800915	10000	f	t	perda	perda	0	demo	2026-03-31 10:57:09.925	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:14.02	61	0.9	0	0	2	tiingo	USDCHF
c7285791-346e-48d3-83fd-3ccc5a1c8d60	d0c4e85b-c057-4c19-a46a-653a37a51018	2026-03-31 10:56:28.517	USDCHF	1m	call	green	0.800935	0.80098	10000	f	t	ganho	ganho	9000	demo	2026-03-31 10:57:29.616	da21923b-ec9e-4563-9253-a5ec08de8f6f	2026-03-31 10:57:33.97	61	0.9	0	0	2	tiingo	USDCHF
92839ac8-7564-4ede-91d4-628d542e0a1e	76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	2026-03-31 14:51:02.439	BTCUSDT	1m	put	red	66846.31	66482.9374	1	f	t	ganho	ganho	0.9	demo	2026-03-31 14:52:02.3	b311df47-28b4-4dbb-94bb-3be81e6198d8	2026-03-31 14:52:06.918	60	0.9	0	0	2	binance	BTCUSDT
\.


--
-- Data for Name: TradingPair; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TradingPair" (id, symbol, name, type, provider, "payoutRate", "isActive", favorite, "displayOrder", "imageUrl", color, logo, description, "createdAt", "updatedAt", "priceSource", "priceSymbol", "minTradeValue", "maxTradeValue", "providerId") FROM stdin;
655ac70d-2740-4334-a33b-3cd2da7156bd	GBPUSD	GBP/USD	forex	TIINGO	0.9	t	t	21	https://flagcdn.com/w80/gb.png	#C8102E	£/$	British Pound vs US Dollar	2026-03-28 01:27:04.231	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
679dbb04-aef4-44ae-944d-dec3ff4f917d	USDJPY	USD/JPY	forex	TIINGO	0.9	t	t	22	https://flagcdn.com/w80/us.png	#BC002D	$/¥	US Dollar vs Japanese Yen	2026-03-28 01:27:04.233	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
da21923b-ec9e-4563-9253-a5ec08de8f6f	USDCHF	USD/CHF	forex	TIINGO	0.9	t	f	23	https://flagcdn.com/w80/us.png	#DC143C	$/CHF	US Dollar vs Swiss Franc	2026-03-28 01:27:04.235	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
9e4690b8-9e85-4903-a2e4-16d0e8db90b8	AUDUSD	AUD/USD	forex	TIINGO	0.9	t	f	24	https://flagcdn.com/w80/au.png	#00008B	A$/$	Australian Dollar vs US Dollar	2026-03-28 01:27:04.236	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
87bb39cf-5e06-464a-afd4-4c269fba04e3	EURGBP	EUR/GBP	forex	TIINGO	0.9	t	f	27	https://flagcdn.com/w80/eu.png	#002395	€/£	Euro vs British Pound	2026-03-28 01:27:04.242	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
053bde20-c55f-42d8-864f-c0d810da6735	EURJPY	EUR/JPY	forex	TIINGO	0.9	t	f	28	https://flagcdn.com/w80/eu.png	#003399	€/¥	Euro vs Japanese Yen	2026-03-28 01:27:04.243	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
a8f0fc74-f743-402c-af4a-e4252ad50ea9	GBPJPY	GBP/JPY	forex	TIINGO	0.9	t	f	29	https://flagcdn.com/w80/gb.png	#C8102E	£/¥	British Pound vs Japanese Yen	2026-03-28 01:27:04.245	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
789cf003-4196-4c56-b773-1ebad460799a	EURUSD	EUR/USD	forex	TIINGO	0.9	t	t	20	https://flagcdn.com/w80/eu.png	#003399	€/$	Euro vs US Dollar	2026-03-28 01:27:04.228	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
a0ae1d78-dc6c-41c4-ac57-2773595620be	ETHUSDT	ETH/USDT	crypto	BINANCE	0.9	t	t	11	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png	#627EEA	Ξ	Ethereum vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:23.507	binance	\N	1	\N	1
b311df47-28b4-4dbb-94bb-3be81e6198d8	BTCUSDT	BTC/USDT	crypto	BINANCE	0.9	t	t	10	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png	#F7931A	₿	Bitcoin vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:23.507	binance	\N	1	\N	1
edf18f06-f8cd-44d3-8766-cb440ebc984e	USDJPY	USD/JPY	forex	ITICK	0.9	f	t	2	https://flagcdn.com/w80/us.png	#BC002D	$/¥	US Dollar vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-28 01:45:56.665	itick	\N	1	\N	2
b13a4019-25eb-4418-ae51-acd1149491f4	USDCHF	USD/CHF	forex	ITICK	0.9	f	f	3	https://flagcdn.com/w80/us.png	#DC143C	$/CHF	US Dollar vs Swiss Franc	2026-03-26 03:48:32.975	2026-03-28 01:45:56.667	itick	\N	1	\N	2
b47115ea-87d4-48d6-baa7-fdafe1a98a71	AUDUSD	AUD/USD	forex	ITICK	0.9	f	f	4	https://flagcdn.com/w80/au.png	#00008B	A$/$	Australian Dollar vs US Dollar	2026-03-26 03:48:32.975	2026-03-28 01:45:56.67	itick	\N	1	\N	2
997cfc26-c7be-41e0-b403-9e8610f67e48	USDCAD	USD/CAD	forex	ITICK	0.9	f	f	5	https://flagcdn.com/w80/us.png	#FF0000	$/C$	US Dollar vs Canadian Dollar	2026-03-26 03:48:32.975	2026-03-28 01:45:56.675	itick	\N	1	\N	2
bf198209-8dfd-41c5-8080-f14843d5a4da	NZDUSD	NZD/USD	forex	ITICK	0.9	f	f	6	https://flagcdn.com/w80/nz.png	#000000	NZ$/$	New Zealand Dollar vs US Dollar	2026-03-26 03:48:32.975	2026-03-28 01:45:56.678	itick	\N	1	\N	2
f1e2b0c4-7979-4bd8-99f9-8d1db3e8379a	EURGBP	EUR/GBP	forex	ITICK	0.9	f	f	7	https://flagcdn.com/w80/eu.png	#002395	€/£	Euro vs British Pound	2026-03-26 03:48:32.975	2026-03-28 01:45:56.682	itick	\N	1	\N	2
812f422f-3f1b-4d12-8753-953de652007a	EURJPY	EUR/JPY	forex	ITICK	0.9	f	f	8	https://flagcdn.com/w80/eu.png	#003399	€/¥	Euro vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-28 01:45:56.684	itick	\N	1	\N	2
9be71b8b-f2ac-4c54-91ac-d1ae48695446	NZDUSD	NZD/USD	forex	TIINGO	0.9	t	f	26	https://flagcdn.com/w80/nz.png	#000000	NZ$/$	New Zealand Dollar vs US Dollar	2026-03-28 01:27:04.24	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
2161f0ac-cedf-4b5c-8c47-70392aedceab	USDCAD	USD/CAD	forex	TIINGO	0.9	t	f	25	https://flagcdn.com/w80/us.png	#FF0000	$/C$	US Dollar vs Canadian Dollar	2026-03-28 01:27:04.238	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
ab1e50d2-bda4-4f9e-9139-e4ff84868f97	BNBUSDT	BNB/USDT	crypto	BINANCE	0.9	t	f	12	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png	#F3BA2F	BNB	Binance Coin vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:23.507	binance	\N	1	\N	1
5bcfccd7-ea1e-4693-8a08-8acc7c5f7708	SOLUSDT	SOL/USDT	crypto	BINANCE	0.9	t	t	13	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png	#9945FF	SOL	Solana vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:23.507	binance	\N	1	\N	1
176f3c39-691d-42cb-b018-290ac9e793ca	EURUSD	EUR/USD	forex	ITICK	0.9	f	t	0	https://flagcdn.com/w80/eu.png	#003399	€/$	Euro vs US Dollar	2026-03-26 03:48:32.975	2026-03-28 01:45:56.659	itick	\N	1	\N	2
8643b426-2053-40c4-9cad-f9c99b98cbf6	GBPUSD	GBP/USD	forex	ITICK	0.9	f	t	1	https://flagcdn.com/w80/gb.png	#C8102E	£/$	British Pound vs US Dollar	2026-03-26 03:48:32.975	2026-03-28 01:45:56.663	itick	\N	1	\N	2
0d5001e9-f888-4c36-b727-8e4870072d46	GBPJPY	GBP/JPY	forex	ITICK	0.9	f	f	9	https://flagcdn.com/w80/gb.png	#C8102E	£/¥	British Pound vs Japanese Yen	2026-03-26 03:48:32.975	2026-03-28 01:45:56.686	itick	\N	1	\N	2
9a7fcf24-e16f-4ca3-a39a-510094c47a07	XRPUSDT	XRP/USDT	crypto	BINANCE	0.9	t	f	14	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png	#23292F	XRP	Ripple vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:28.122	binance	\N	1	\N	1
512a3969-535a-492d-8651-4e3a94c36d47	ADAUSDT	ADA/USDT	crypto	BINANCE	0.9	t	f	15	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png	#0033AD	ADA	Cardano vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:29.869	binance	\N	1	\N	1
a333c184-f654-4191-8ba8-6e8800ab0278	DOGEUSDT	DOGE/USDT	crypto	BINANCE	0.9	t	f	16	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png	#C2A633	Ð	Dogecoin vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:31.261	binance	\N	1	\N	1
de50299b-9953-4730-b88f-6f843fc06fa0	DOTUSDT	DOT/USDT	crypto	BINANCE	0.9	t	f	17	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png	#E6007A	DOT	Polkadot vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:33.048	binance	\N	1	\N	1
8d8e3706-b9be-4fcc-882f-6ef99d679dfb	AVAXUSDT	AVAX/USDT	crypto	BINANCE	0.9	t	f	18	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png	#E84142	AVAX	Avalanche vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:34.39	binance	\N	1	\N	1
aa7a8807-7334-4eca-9b95-26b1fb509d49	LINKUSDT	LINK/USDT	crypto	BINANCE	0.9	t	f	19	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png	#2A5ADA	LINK	Chainlink vs Tether	2026-03-26 03:48:32.975	2026-03-28 18:37:36.091	binance	\N	1	\N	1
5821077e-2c12-4070-9676-ff7ade83e354	BTCUSDT	BTC/USDT	crypto	TIINGO	0.9	t	t	10	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/btc.png	#F7931A	₿	Bitcoin vs Tether	2026-03-28 18:30:31.299	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
67228965-9df6-4f62-b408-89e96ff85778	ETHUSDT	ETH/USDT	crypto	TIINGO	0.9	t	t	11	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/eth.png	#627EEA	Ξ	Ethereum vs Tether	2026-03-28 18:30:31.302	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
de07e4a3-75af-4118-81f2-8f46a92b77e5	BNBUSDT	BNB/USDT	crypto	TIINGO	0.9	t	f	12	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/bnb.png	#F3BA2F	BNB	Binance Coin vs Tether	2026-03-28 18:30:31.304	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
470f2d9b-bd59-4fbc-83e1-9d202c8e60a7	SOLUSDT	SOL/USDT	crypto	TIINGO	0.9	t	t	13	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/sol.png	#9945FF	SOL	Solana vs Tether	2026-03-28 18:30:31.306	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
c5b46600-65f9-4832-a94a-8ce715f2c4f3	XRPUSDT	XRP/USDT	crypto	TIINGO	0.9	t	f	14	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/xrp.png	#23292F	XRP	Ripple vs Tether	2026-03-28 18:30:31.308	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
463aff83-f866-4e31-89ec-44aa2bbdbc3f	ADAUSDT	ADA/USDT	crypto	TIINGO	0.9	t	f	15	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/ada.png	#0033AD	ADA	Cardano vs Tether	2026-03-28 18:30:31.31	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
3cf331b8-617b-4438-a9ea-0b3a8aa5d231	DOGEUSDT	DOGE/USDT	crypto	TIINGO	0.9	t	f	16	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/doge.png	#C2A633	Ð	Dogecoin vs Tether	2026-03-28 18:30:31.312	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
0c521a7b-3c35-4dc1-9c8f-c2b15a44ff79	DOTUSDT	DOT/USDT	crypto	TIINGO	0.9	t	f	17	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/dot.png	#E6007A	DOT	Polkadot vs Tether	2026-03-28 18:30:31.314	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
758c831a-ba73-4118-9913-ff8c447f43e4	AVAXUSDT	AVAX/USDT	crypto	TIINGO	0.9	t	f	18	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/avax.png	#E84142	AVAX	Avalanche vs Tether	2026-03-28 18:30:31.317	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
69c9f719-e6a4-45e2-ad6c-f734d598fb68	LINKUSDT	LINK/USDT	crypto	TIINGO	0.9	t	f	19	https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color/link.png	#2A5ADA	LINK	Chainlink vs Tether	2026-03-28 18:30:31.318	2026-03-28 18:37:18.1	tiingo	\N	1	\N	1303
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, nome, senha, cpf, nacionalidade, "documentoTipo", "documentoNumero", ddi, telefone, "dataNascimento", "avatarUrl", "createdAt", "updatedAt", "affiliateId", kyc, "emailVerified", image, name) FROM stdin;
144e0f6c-8373-41be-ae2e-55f5d6909205	tassio@gmail.com	tassio montenegro	$2b$10$6v9IOmr2m8BA5ZySD6hotu.sgcdFoLlOKWuLwF6r9hWF01EMLVuUG	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-26 03:47:57.634	2026-03-26 16:50:37.178	\N	\N	\N	\N	tassio montenegro
e314e4fb-5355-46d8-b591-13fee3b68979	montenegro@gmail.com	MONTENEGRO	$2b$10$82H5BFETyJd1ZOJNPJwzCu6H20NBOobJEfTLd3akySVeqhL8XTuu2	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-28 01:33:10.406	2026-03-28 01:33:10.406	\N	\N	\N	\N	MONTENEGRO
3fee4830-d8a3-4ee3-af30-e1b4ebd3102d	jadeucerto2026@gmail.com	jadeucerto2026@gmail.com	$2b$10$7Huk59y2wSqDCx0GHc3lmOLN6U/tQl5IaOgXaXMyd8DmpId1O8jIi	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-28 17:27:39.378	2026-03-28 17:27:39.378	\N	\N	\N	\N	jadeucerto2026@gmail.com
871eddac-50e8-4602-93b2-ec52c0f66d35	teste7766@gmail.com	teste7766@gmail.com	$2b$10$aKk/Sygn80jS3zhJEEopEumrhE68.6KEQlxArueoOKNXOigPdy.L2	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-30 17:07:22.877	2026-03-30 17:07:22.877	\N	\N	\N	\N	teste7766@gmail.com
282c8605-e105-4d65-84d5-7a7e9671b029	isaiasFantasma007@gmail.com	isaiasFantasma007@gmail.com	$2b$10$.mhbm71EyG8gfPCAyUxx2utU/ROYZVHI/PSRnrsiISJlSZdvznLbe	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-30 21:24:22.387	2026-03-30 21:24:22.387	\N	\N	\N	\N	isaiasFantasma007@gmail.com
d0c4e85b-c057-4c19-a46a-653a37a51018	teste5566@gmail.com	teste5566@gmail.com	$2b$10$Nh5qSAK4niukRwIu3aXcfOSKaia/2qQ2RfzdAuWM3Q/iOaahxCKji	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-30 21:26:27.016	2026-03-30 21:26:27.016	\N	\N	\N	\N	teste5566@gmail.com
76efdc20-12c3-4fa8-a8cb-fcc361ff97b2	hm246127@gmail.com	Henry	$2b$10$7/F6e6DV5bq6c8jly/Cj6eQIIq2WnUkcffvVd..76991iUZAA3OEu	\N	Brasil	\N	\N	\N	\N	\N	\N	2026-03-31 02:38:54.273	2026-03-31 02:38:54.273	\N	\N	\N	\N	Henry
\.


--
-- Data for Name: UserActivity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserActivity" (id, "userId", "activityType", device, "ipAddress", location, "createdAt") FROM stdin;
\.


--
-- Data for Name: UserLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserLog" (id, "userId", acao, descricao, ip, "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: VerificationToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VerificationToken" (identifier, token, expires) FROM stdin;
\.


--
-- Data for Name: WebhookConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WebhookConfig" (id, "userId", url, "eventType", active, notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: WebhookLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WebhookLog" (id, "webhookConfigId", "userId", "dispatchTime", status, "responseCode", "responseMessage", payload, "errorDetails") FROM stdin;
\.


--
-- Data for Name: Withdrawal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Withdrawal" (id, "userId", "dataPedido", "dataPagamento", "tipoChave", chave, status, valor, taxa, tipo, "gatewayId") FROM stdin;
\.


--
-- Data for Name: WorkerConfig; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WorkerConfig" (id, "workerName", "isEnabled", "batchSize", "maxAttempts", "timeoutMs", "retryDelayMs", "updatedAt") FROM stdin;
1	settlement	t	50	3	5000	60000	2026-03-26 03:42:28.859
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
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
b1b1bcc5-1c9d-498c-bbdb-6ea18f83e295	bb2261f5dfff57d67a720d794641a13fdede04e5b284fa85f214d61dac460276	2026-03-28 01:27:03.985773+00	20260327170000_tiingo_forex_pairs	\N	\N	2026-03-28 01:27:03.973535+00	1
141c5d43-85c2-458c-a3c3-a1991a35e3c9	69013d2577cf4e25a7ae11f6a7f90fa7d04963e57edf10ceb15679232332c985	2026-03-28 18:30:31.058481+00	20260328000000_fix_pricesource_default	\N	\N	2026-03-28 18:30:31.046434+00	1
\.


--
-- Name: Config_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Config_id_seq"', 1, true);


--
-- Name: Gateways_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Gateways_id_seq"', 3, true);


--
-- Name: MarketDataProvider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."MarketDataProvider_id_seq"', 60619, true);


--
-- Name: SystemSettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SystemSettings_id_seq"', 2, true);


--
-- Name: WorkerConfig_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."WorkerConfig_id_seq"', 1, true);


--
-- Name: Account Account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_pkey" PRIMARY KEY (id);


--
-- Name: Admin Admin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Admin"
    ADD CONSTRAINT "Admin_pkey" PRIMARY KEY (id);


--
-- Name: AffiliateCommission AffiliateCommission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_pkey" PRIMARY KEY (id);


--
-- Name: Affiliate Affiliate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Affiliate"
    ADD CONSTRAINT "Affiliate_pkey" PRIMARY KEY (id);


--
-- Name: AuditLog AuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_pkey" PRIMARY KEY (id);


--
-- Name: Balance Balance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Balance"
    ADD CONSTRAINT "Balance_pkey" PRIMARY KEY (id);


--
-- Name: ClickEvent ClickEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClickEvent"
    ADD CONSTRAINT "ClickEvent_pkey" PRIMARY KEY (id);


--
-- Name: Config Config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_pkey" PRIMARY KEY (id);


--
-- Name: CreditCard CreditCard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_pkey" PRIMARY KEY (id);


--
-- Name: Deposit Deposit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY (id);


--
-- Name: Gateways Gateways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Gateways"
    ADD CONSTRAINT "Gateways_pkey" PRIMARY KEY (id);


--
-- Name: KYC KYC_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_pkey" PRIMARY KEY (id);


--
-- Name: MarketDataProvider MarketDataProvider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MarketDataProvider"
    ADD CONSTRAINT "MarketDataProvider_pkey" PRIMARY KEY (id);


--
-- Name: OperationSettlementJob OperationSettlementJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationSettlementJob"
    ADD CONSTRAINT "OperationSettlementJob_pkey" PRIMARY KEY (id);


--
-- Name: PixelEvent PixelEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PixelEvent"
    ADD CONSTRAINT "PixelEvent_pkey" PRIMARY KEY (id);


--
-- Name: PostbackConfig PostbackConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_pkey" PRIMARY KEY (id);


--
-- Name: PostbackLog PostbackLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostbackLog"
    ADD CONSTRAINT "PostbackLog_pkey" PRIMARY KEY (id);


--
-- Name: PromotionRedemption PromotionRedemption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_pkey" PRIMARY KEY (id);


--
-- Name: Promotion Promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Promotion"
    ADD CONSTRAINT "Promotion_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: TradeOperation TradeOperation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_pkey" PRIMARY KEY (id);


--
-- Name: TradingPair TradingPair_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TradingPair"
    ADD CONSTRAINT "TradingPair_pkey" PRIMARY KEY (id);


--
-- Name: UserActivity UserActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_pkey" PRIMARY KEY (id);


--
-- Name: UserLog UserLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserLog"
    ADD CONSTRAINT "UserLog_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WebhookConfig WebhookConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookConfig"
    ADD CONSTRAINT "WebhookConfig_pkey" PRIMARY KEY (id);


--
-- Name: WebhookLog WebhookLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_pkey" PRIMARY KEY (id);


--
-- Name: Withdrawal Withdrawal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_pkey" PRIMARY KEY (id);


--
-- Name: WorkerConfig WorkerConfig_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WorkerConfig"
    ADD CONSTRAINT "WorkerConfig_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Account_provider_providerAccountId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON public."Account" USING btree (provider, "providerAccountId");


--
-- Name: Admin_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Admin_email_key" ON public."Admin" USING btree (email);


--
-- Name: AffiliateCommission_affiliateId_depositId_tipo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_depositId_tipo_key" ON public."AffiliateCommission" USING btree ("affiliateId", "depositId", tipo);


--
-- Name: AffiliateCommission_affiliateId_operationId_tipo_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AffiliateCommission_affiliateId_operationId_tipo_key" ON public."AffiliateCommission" USING btree ("affiliateId", "operationId", tipo);


--
-- Name: Affiliate_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Affiliate_userId_key" ON public."Affiliate" USING btree ("userId");


--
-- Name: Balance_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Balance_userId_key" ON public."Balance" USING btree ("userId");


--
-- Name: CreditCard_depositId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CreditCard_depositId_key" ON public."CreditCard" USING btree ("depositId");


--
-- Name: MarketDataProvider_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MarketDataProvider_slug_key" ON public."MarketDataProvider" USING btree (slug);


--
-- Name: MarketDataProvider_type_isActive_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MarketDataProvider_type_isActive_sortOrder_idx" ON public."MarketDataProvider" USING btree (type, "isActive", "sortOrder");


--
-- Name: OperationSettlementJob_operationId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "OperationSettlementJob_operationId_key" ON public."OperationSettlementJob" USING btree ("operationId");


--
-- Name: OperationSettlementJob_status_scheduledFor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "OperationSettlementJob_status_scheduledFor_idx" ON public."OperationSettlementJob" USING btree (status, "scheduledFor");


--
-- Name: PostbackConfig_affiliateId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PostbackConfig_affiliateId_idx" ON public."PostbackConfig" USING btree ("affiliateId");


--
-- Name: PostbackConfig_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PostbackConfig_userId_idx" ON public."PostbackConfig" USING btree ("userId");


--
-- Name: PostbackLog_postbackConfigId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PostbackLog_postbackConfigId_idx" ON public."PostbackLog" USING btree ("postbackConfigId");


--
-- Name: PromotionRedemption_promotionId_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PromotionRedemption_promotionId_status_idx" ON public."PromotionRedemption" USING btree ("promotionId", status);


--
-- Name: PromotionRedemption_promotionId_userId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "PromotionRedemption_promotionId_userId_key" ON public."PromotionRedemption" USING btree ("promotionId", "userId");


--
-- Name: PromotionRedemption_userId_status_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "PromotionRedemption_userId_status_expiresAt_idx" ON public."PromotionRedemption" USING btree ("userId", status, "expiresAt");


--
-- Name: Promotion_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Promotion_slug_key" ON public."Promotion" USING btree (slug);


--
-- Name: Promotion_type_isActive_validUntil_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Promotion_type_isActive_validUntil_idx" ON public."Promotion" USING btree (type, "isActive", "validUntil");


--
-- Name: Session_sessionToken_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Session_sessionToken_key" ON public."Session" USING btree ("sessionToken");


--
-- Name: SystemSettings_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SystemSettings_category_idx" ON public."SystemSettings" USING btree (category);


--
-- Name: SystemSettings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SystemSettings_key_key" ON public."SystemSettings" USING btree (key);


--
-- Name: TradeOperation_pairId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradeOperation_pairId_idx" ON public."TradeOperation" USING btree ("pairId");


--
-- Name: TradeOperation_resultado_expiresAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradeOperation_resultado_expiresAt_idx" ON public."TradeOperation" USING btree (resultado, "expiresAt");


--
-- Name: TradeOperation_userId_resolvedAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradeOperation_userId_resolvedAt_idx" ON public."TradeOperation" USING btree ("userId", "resolvedAt");


--
-- Name: TradeOperation_userId_resultado_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradeOperation_userId_resultado_idx" ON public."TradeOperation" USING btree ("userId", resultado);


--
-- Name: TradingPair_priceSource_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradingPair_priceSource_idx" ON public."TradingPair" USING btree ("priceSource");


--
-- Name: TradingPair_providerId_isActive_displayOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradingPair_providerId_isActive_displayOrder_idx" ON public."TradingPair" USING btree ("providerId", "isActive", "displayOrder");


--
-- Name: TradingPair_symbol_providerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TradingPair_symbol_providerId_key" ON public."TradingPair" USING btree (symbol, "providerId");


--
-- Name: TradingPair_type_isActive_displayOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TradingPair_type_isActive_displayOrder_idx" ON public."TradingPair" USING btree (type, "isActive", "displayOrder");


--
-- Name: User_cpf_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_cpf_key" ON public."User" USING btree (cpf);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: VerificationToken_identifier_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON public."VerificationToken" USING btree (identifier, token);


--
-- Name: VerificationToken_token_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VerificationToken_token_key" ON public."VerificationToken" USING btree (token);


--
-- Name: WebhookConfig_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WebhookConfig_userId_idx" ON public."WebhookConfig" USING btree ("userId");


--
-- Name: WebhookLog_webhookConfigId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WebhookLog_webhookConfigId_idx" ON public."WebhookLog" USING btree ("webhookConfigId");


--
-- Name: WorkerConfig_workerName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WorkerConfig_workerName_key" ON public."WorkerConfig" USING btree ("workerName");


--
-- Name: Account Account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Account"
    ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AffiliateCommission AffiliateCommission_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AffiliateCommission AffiliateCommission_depositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES public."Deposit"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AffiliateCommission AffiliateCommission_operationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES public."TradeOperation"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: AffiliateCommission AffiliateCommission_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AffiliateCommission"
    ADD CONSTRAINT "AffiliateCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Affiliate Affiliate_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Affiliate"
    ADD CONSTRAINT "Affiliate_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AuditLog AuditLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLog"
    ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Balance Balance_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Balance"
    ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClickEvent ClickEvent_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ClickEvent"
    ADD CONSTRAINT "ClickEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Config Config_creditCardDepositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_creditCardDepositId_fkey" FOREIGN KEY ("creditCardDepositId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_cryptoDepositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_cryptoDepositId_fkey" FOREIGN KEY ("cryptoDepositId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_cryptoSaqueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_cryptoSaqueId_fkey" FOREIGN KEY ("cryptoSaqueId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_gatewayPixDepositoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_gatewayPixDepositoId_fkey" FOREIGN KEY ("gatewayPixDepositoId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Config Config_gatewayPixSaqueId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Config"
    ADD CONSTRAINT "Config_gatewayPixSaqueId_fkey" FOREIGN KEY ("gatewayPixSaqueId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: CreditCard CreditCard_depositId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES public."Deposit"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CreditCard CreditCard_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditCard"
    ADD CONSTRAINT "CreditCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Deposit Deposit_gatewayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Deposit Deposit_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: KYC KYC_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."KYC"
    ADD CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OperationSettlementJob OperationSettlementJob_operationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OperationSettlementJob"
    ADD CONSTRAINT "OperationSettlementJob_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES public."TradeOperation"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PixelEvent PixelEvent_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PixelEvent"
    ADD CONSTRAINT "PixelEvent_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PostbackConfig PostbackConfig_affiliateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_affiliateId_fkey" FOREIGN KEY ("affiliateId") REFERENCES public."Affiliate"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PostbackConfig PostbackConfig_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostbackConfig"
    ADD CONSTRAINT "PostbackConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: PostbackLog PostbackLog_postbackConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PostbackLog"
    ADD CONSTRAINT "PostbackLog_postbackConfigId_fkey" FOREIGN KEY ("postbackConfigId") REFERENCES public."PostbackConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PromotionRedemption PromotionRedemption_promotionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES public."Promotion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PromotionRedemption PromotionRedemption_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PromotionRedemption"
    ADD CONSTRAINT "PromotionRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Session Session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TradeOperation TradeOperation_pairId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_pairId_fkey" FOREIGN KEY ("pairId") REFERENCES public."TradingPair"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TradeOperation TradeOperation_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TradeOperation"
    ADD CONSTRAINT "TradeOperation_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TradingPair TradingPair_providerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TradingPair"
    ADD CONSTRAINT "TradingPair_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES public."MarketDataProvider"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserActivity UserActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserActivity"
    ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserLog UserLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserLog"
    ADD CONSTRAINT "UserLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WebhookConfig WebhookConfig_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookConfig"
    ADD CONSTRAINT "WebhookConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WebhookLog WebhookLog_webhookConfigId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WebhookLog"
    ADD CONSTRAINT "WebhookLog_webhookConfigId_fkey" FOREIGN KEY ("webhookConfigId") REFERENCES public."WebhookConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Withdrawal Withdrawal_gatewayId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES public."Gateways"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Withdrawal Withdrawal_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Withdrawal"
    ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict oceHDPxWsIepV1jj8fKEoNtZSSdgCct3qP09PcONo84yidbcT29CfZWCoN4Gg2H

