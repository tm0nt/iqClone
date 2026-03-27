"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Globe,
  ImageIcon,
  KeyRound,
  Layers3,
  LineChart,
  Palette,
  PlugZap,
  Sparkles,
  Shield,
  Type,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { BRANDING_DEFAULTS, BRANDING_FIELDS } from "@shared/platform/branding";

type BrandingFieldKey = Exclude<
  (typeof BRANDING_FIELDS)[number],
  "depositGatewayMode" | "withdrawGatewayMode"
>;

type GeneralSettingsState = {
  siteName: string;
  siteUrl: string;
  logoWhiteUrl: string;
  logoDarkUrl: string;
  supportUrl: string;
  supportAvailabilityText: string;
  platformTimezone: string;
  chartBackgroundUrl: string;
  faviconUrl: string;
  postbackUrl: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  trackRegisterEvents: boolean;
  trackDepositEvents: boolean;
  trackWithdrawalEvents: boolean;
  authSecret: string;
  adminSessionSecret: string;
  settleSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  tradingMinPriceVariation: string;
  tradingSettlementTolerance: string;
  tradingDefaultExpiryMinutes: string;
  tradingExpiryOptions: string;
  tradingSettlementGraceSeconds: string;
  marketProviders: MarketProviderSettings[];
} & Record<BrandingFieldKey, string>;

type MarketProviderSettings = {
  id: number;
  slug: string;
  name: string;
  authType: string;
  authHeaderName: string;
  authQueryParam: string;
  authToken: string;
  isActive: boolean;
};

type ColorField = {
  key: BrandingFieldKey;
  label: string;
  description: string;
};

type ColorSection = {
  value: string;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: ColorField[];
};

const brandingFieldKeys = BRANDING_FIELDS.filter(
  (field): field is BrandingFieldKey =>
    field !== "depositGatewayMode" && field !== "withdrawGatewayMode",
);

const defaultState: GeneralSettingsState = {
  siteName: "",
  siteUrl: "",
  logoWhiteUrl: "",
  logoDarkUrl: "",
  supportUrl: "",
  supportAvailabilityText: "TODO DIA, A TODA HORA",
  platformTimezone: "America/Sao_Paulo",
  chartBackgroundUrl: "",
  faviconUrl: "",
  postbackUrl: "",
  googleAnalyticsId: "",
  googleTagManagerId: "",
  facebookPixelId: "",
  trackRegisterEvents: true,
  trackDepositEvents: true,
  trackWithdrawalEvents: true,
  authSecret: "",
  adminSessionSecret: "",
  settleSecret: "",
  googleClientId: "",
  googleClientSecret: "",
  tradingMinPriceVariation: "0",
  tradingSettlementTolerance: "0",
  tradingDefaultExpiryMinutes: "5",
  tradingExpiryOptions: "1,5,10,15,30,60,1440",
  tradingSettlementGraceSeconds: "2",
  marketProviders: [],
  ...(Object.fromEntries(
    brandingFieldKeys.map((field) => [field, BRANDING_DEFAULTS[field]]),
  ) as Record<BrandingFieldKey, string>),
};

const COLOR_INPUT_RE = /^#[0-9a-fA-F]{6}$/;

const colorSections: ColorSection[] = [
  {
    value: "actions",
    title: "Acoes e estados",
    description:
      "Cores principais de interacao, ganhos, perdas, avisos e conta demo.",
    icon: Sparkles,
    fields: [
      {
        key: "primaryColor",
        label: "Primaria",
        description: "Acao principal da plataforma.",
      },
      {
        key: "primaryHoverColor",
        label: "Primaria hover",
        description: "Hover dos CTAs e links principais.",
      },
      {
        key: "accentColor",
        label: "Accent",
        description: "Realce secundario para tools e elementos auxiliares.",
      },
      {
        key: "warningColor",
        label: "Aviso",
        description: "Pendencias, alertas e badges de atencao.",
      },
      {
        key: "successColor",
        label: "Sucesso",
        description: "Confirmacoes e feedback positivo.",
      },
      {
        key: "dangerColor",
        label: "Perigo",
        description: "Erros, venda e estados destrutivos.",
      },
      {
        key: "positiveColor",
        label: "Positivo",
        description: "Indicadores de lucro e valorizacao.",
      },
      {
        key: "negativeColor",
        label: "Negativo",
        description: "Indicadores de perda e desvalorizacao.",
      },
      {
        key: "demoColor",
        label: "Conta demo",
        description: "Cor da conta virtual e seus destaques.",
      },
      {
        key: "demoHoverColor",
        label: "Conta demo hover",
        description: "Hover e acao secundaria da conta demo.",
      },
      {
        key: "buttonTextColor",
        label: "Texto do botao",
        description: "Cor do texto em botoes preenchidos.",
      },
    ],
  },
  {
    value: "surfaces",
    title: "Superficies e overlays",
    description:
      "Fundos principais, cards e camadas usadas em modais e seletores.",
    icon: Layers3,
    fields: [
      {
        key: "backgroundColor",
        label: "Background principal",
        description: "Fundo base da plataforma de trading.",
      },
      {
        key: "surfaceColor",
        label: "Surface principal",
        description: "Blocos e areas secundarias.",
      },
      {
        key: "surfaceAltColor",
        label: "Surface alternativa",
        description: "Painel alternativo e containers compactos.",
      },
      {
        key: "cardColor",
        label: "Cards",
        description: "Cards padrao e containers destacados.",
      },
      {
        key: "borderColor",
        label: "Bordas",
        description: "Bordas gerais da interface.",
      },
      {
        key: "overlayBackdropColor",
        label: "Backdrop overlay",
        description: "Fundo escurecido de modais e drawers.",
      },
      {
        key: "overlaySurfaceColor",
        label: "Surface overlay",
        description: "Cor base de modais e popovers.",
      },
      {
        key: "overlayBorderColor",
        label: "Borda overlay",
        description: "Bordas e divisores dentro de overlays.",
      },
      {
        key: "overlayCardColor",
        label: "Card overlay",
        description: "Campos e chips internos dentro de modais.",
      },
      {
        key: "overlayHoverColor",
        label: "Hover overlay",
        description: "Hover de itens, tabs e linhas de overlays.",
      },
      {
        key: "authBackgroundColor",
        label: "Background auth",
        description: "Fundo geral das telas de autenticacao.",
      },
      {
        key: "loadingBackgroundColor",
        label: "Background loading",
        description: "Fundo da tela de carregamento.",
      },
      {
        key: "loadingTrackColor",
        label: "Trilha loading",
        description: "Trilha do progress bar de loading.",
      },
    ],
  },
  {
    value: "typography",
    title: "Tipografia e icones",
    description: "Texto principal, texto secundario, labels e iconografia.",
    icon: Type,
    fields: [
      {
        key: "textColor",
        label: "Texto principal",
        description: "Texto base e conteudo destacado.",
      },
      {
        key: "mutedTextColor",
        label: "Texto secundario",
        description: "Texto auxiliar da plataforma.",
      },
      {
        key: "headerTextColor",
        label: "Texto do header",
        description: "Texto e elementos de navegacao do header.",
      },
      {
        key: "overlayMutedTextColor",
        label: "Texto overlay",
        description: "Texto auxiliar em modais, dropdowns e seletores.",
      },
      {
        key: "iconColor",
        label: "Icones",
        description: "Cor padrao de icones neutros.",
      },
      {
        key: "iconBgColor",
        label: "Fundo dos icones",
        description: "Avatar, botao circular e fundos iconicos.",
      },
      {
        key: "inputLabelColor",
        label: "Label de input",
        description: "Labels e suporte de campos escuros.",
      },
      {
        key: "inputSubtleTextColor",
        label: "Texto sutil",
        description: "Placeholder, icones e textos discretos.",
      },
    ],
  },
  {
    value: "gradients",
    title: "Gradientes",
    description: "Sequencias de cor usadas em botoes, header e loading.",
    icon: Palette,
    fields: [
      {
        key: "primaryGradientFrom",
        label: "Botao gradiente inicio",
        description: "Inicio do gradiente principal.",
      },
      {
        key: "primaryGradientVia",
        label: "Botao gradiente meio",
        description: "Meio do gradiente principal.",
      },
      {
        key: "primaryGradientTo",
        label: "Botao gradiente fim",
        description: "Fim do gradiente principal.",
      },
      {
        key: "headerGradientFrom",
        label: "Header gradiente inicio",
        description: "Inicio do gradiente do topo.",
      },
      {
        key: "headerGradientTo",
        label: "Header gradiente fim",
        description: "Fim do gradiente do topo.",
      },
      {
        key: "loadingGradientFrom",
        label: "Loading gradiente inicio",
        description: "Inicio do gradiente do loading.",
      },
      {
        key: "loadingGradientVia",
        label: "Loading gradiente meio",
        description: "Meio do gradiente do loading.",
      },
      {
        key: "loadingGradientTo",
        label: "Loading gradiente fim",
        description: "Fim do gradiente do loading.",
      },
    ],
  },
  {
    value: "inputs",
    title: "Inputs e formularios",
    description: "Campos escuros, bordas, foco e contraste de formularios.",
    icon: Globe,
    fields: [
      {
        key: "inputBackgroundColor",
        label: "Background do input",
        description: "Fundo dos campos escuros de auth e formularios.",
      },
      {
        key: "inputBorderColor",
        label: "Borda do input",
        description: "Borda base dos campos.",
      },
    ],
  },
  {
    value: "chart",
    title: "Grafico",
    description: "Candles, grade e ticker do preco atual no amCharts.",
    icon: LineChart,
    fields: [
      {
        key: "candleUpColor",
        label: "Vela alta",
        description: "Candle de compra e movimento positivo.",
      },
      {
        key: "candleDownColor",
        label: "Vela baixa",
        description: "Candle de venda e movimento negativo.",
      },
      {
        key: "chartGridColor",
        label: "Grade do grafico",
        description: "Linhas auxiliares do chart.",
      },
      {
        key: "chartPriceTagColor",
        label: "Tag do preco atual",
        description: "Ticker lateral do preco atual.",
      },
    ],
  },
];

function buildSettingsFromResponse(
  data: Record<string, unknown>,
): GeneralSettingsState {
  const nextState: GeneralSettingsState = {
    ...defaultState,
    siteName: typeof data.nomeSite === "string" ? data.nomeSite : "",
    siteUrl: typeof data.urlSite === "string" ? data.urlSite : "",
    logoWhiteUrl:
      typeof data.logoUrlWhite === "string" ? data.logoUrlWhite : "",
    logoDarkUrl: typeof data.logoUrlDark === "string" ? data.logoUrlDark : "",
    supportUrl: typeof data.supportUrl === "string" ? data.supportUrl : "",
    supportAvailabilityText:
      typeof data.supportAvailabilityText === "string"
        ? data.supportAvailabilityText
        : "TODO DIA, A TODA HORA",
    platformTimezone:
      typeof data.platformTimezone === "string"
        ? data.platformTimezone
        : "America/Sao_Paulo",
    chartBackgroundUrl:
      typeof data.chartBackgroundUrl === "string"
        ? data.chartBackgroundUrl
        : "",
    faviconUrl: typeof data.faviconUrl === "string" ? data.faviconUrl : "",
    postbackUrl: typeof data.postbackUrl === "string" ? data.postbackUrl : "",
    googleAnalyticsId:
      typeof data.googleAnalyticsId === "string"
        ? data.googleAnalyticsId
        : "",
    googleTagManagerId:
      typeof data.googleTagManagerId === "string"
        ? data.googleTagManagerId
        : "",
    facebookPixelId:
      typeof data.facebookPixelId === "string" ? data.facebookPixelId : "",
    trackRegisterEvents:
      typeof data.trackRegisterEvents === "boolean"
        ? data.trackRegisterEvents
        : true,
    trackDepositEvents:
      typeof data.trackDepositEvents === "boolean"
        ? data.trackDepositEvents
        : true,
    trackWithdrawalEvents:
      typeof data.trackWithdrawalEvents === "boolean"
        ? data.trackWithdrawalEvents
        : true,
    authSecret: typeof data.authSecret === "string" ? data.authSecret : "",
    adminSessionSecret:
      typeof data.adminSessionSecret === "string" ? data.adminSessionSecret : "",
    settleSecret: typeof data.settleSecret === "string" ? data.settleSecret : "",
    googleClientId:
      typeof data.googleClientId === "string" ? data.googleClientId : "",
    googleClientSecret:
      typeof data.googleClientSecret === "string"
        ? data.googleClientSecret
        : "",
    tradingMinPriceVariation:
      data.tradingMinPriceVariation !== undefined
        ? String(data.tradingMinPriceVariation)
        : "0",
    tradingSettlementTolerance:
      data.tradingSettlementTolerance !== undefined
        ? String(data.tradingSettlementTolerance)
        : "0",
    tradingDefaultExpiryMinutes:
      data.tradingDefaultExpiryMinutes !== undefined
        ? String(data.tradingDefaultExpiryMinutes)
        : "5",
    tradingExpiryOptions:
      typeof data.tradingExpiryOptions === "string"
        ? data.tradingExpiryOptions
        : "1,5,10,15,30,60,1440",
    tradingSettlementGraceSeconds:
      data.tradingSettlementGraceSeconds !== undefined
        ? String(data.tradingSettlementGraceSeconds)
        : "2",
    marketProviders: Array.isArray(data.marketProviders)
      ? data.marketProviders
          .map((provider) => {
            if (!provider || typeof provider !== "object") {
              return null;
            }

            const record = provider as Record<string, unknown>;
            return {
              id: Number(record.id ?? 0),
              slug: typeof record.slug === "string" ? record.slug : "",
              name: typeof record.name === "string" ? record.name : "",
              authType:
                typeof record.authType === "string" ? record.authType : "none",
              authHeaderName:
                typeof record.authHeaderName === "string"
                  ? record.authHeaderName
                  : "",
              authQueryParam:
                typeof record.authQueryParam === "string"
                  ? record.authQueryParam
                  : "",
              authToken:
                typeof record.authToken === "string" ? record.authToken : "",
              isActive:
                typeof record.isActive === "boolean" ? record.isActive : true,
            } satisfies MarketProviderSettings;
          })
          .filter((provider): provider is MarketProviderSettings => provider !== null)
      : [],
  };

  for (const key of brandingFieldKeys) {
    const raw = data[key];
    nextState[key] =
      typeof raw === "string" && raw.trim().length > 0
        ? raw
        : BRANDING_DEFAULTS[key];
  }

  return nextState;
}

function ImageUploadZone({
  label,
  description,
  currentUrl,
  previewUrl,
  onFileSelect,
  onClear,
  onUrlChange,
  urlValue,
  accept = "image/*",
  previewClass = "max-w-[180px] h-auto",
  previewBg,
}: {
  label: string;
  description?: string;
  currentUrl?: string;
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onUrlChange?: (url: string) => void;
  urlValue?: string;
  accept?: string;
  previewClass?: string;
  previewBg?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const displayUrl = previewUrl || currentUrl;

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-sm font-semibold">{label}</Label>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <div
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
          isDragging
            ? "scale-[1.01] border-primary bg-primary/5"
            : displayUrl
              ? "border-border/60 hover:border-primary/40"
              : "border-border/40 bg-muted/30 hover:border-primary/40"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        {displayUrl ? (
          <div className="group relative p-4">
            <div
              className={`flex items-center justify-center overflow-hidden rounded-lg p-3 ${previewBg || "bg-muted/50"}`}
            >
              <img
                src={displayUrl}
                alt={label}
                className={`${previewClass} object-contain`}
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-destructive/90 text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-destructive"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center gap-2 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                <Upload className="h-4 w-4" />
                Alterar imagem
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/80">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, SVG ou ICO
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
            e.target.value = "";
          }}
        />
      </div>

      {onUrlChange ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">ou insira URL</Label>
          <Input
            value={urlValue || ""}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://..."
            className="h-8 text-xs"
          />
        </div>
      ) : null}
    </div>
  );
}

export function GeneralTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettingsState>(defaultState);
  const [logoWhite, setLogoWhite] = useState<File | null>(null);
  const [logoDark, setLogoDark] = useState<File | null>(null);
  const [chartBackground, setChartBackground] = useState<File | null>(null);
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logoWhitePreview, setLogoWhitePreview] = useState<string | null>(null);
  const [logoDarkPreview, setLogoDarkPreview] = useState<string | null>(null);
  const [chartBgPreview, setChartBgPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    fetch("/api/admin/config")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setGeneralSettings(buildSettingsFromResponse(data)))
      .catch(() =>
        toastRef.current({
          title: "Erro",
          description: "Nao foi possivel carregar as configuracoes gerais.",
          variant: "destructive",
        }),
      );
  }, []);

  const prevWhiteUrlRef = useRef<string | null>(null);
  const prevDarkUrlRef = useRef<string | null>(null);
  const prevChartBgUrlRef = useRef<string | null>(null);
  const prevFaviconUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!logoWhite) return;
    if (prevWhiteUrlRef.current) URL.revokeObjectURL(prevWhiteUrlRef.current);
    const url = URL.createObjectURL(logoWhite);
    prevWhiteUrlRef.current = url;
    setLogoWhitePreview(url);
    return () => {
      if (prevWhiteUrlRef.current) {
        URL.revokeObjectURL(prevWhiteUrlRef.current);
        prevWhiteUrlRef.current = null;
      }
    };
  }, [logoWhite]);

  useEffect(() => {
    if (!logoDark) return;
    if (prevDarkUrlRef.current) URL.revokeObjectURL(prevDarkUrlRef.current);
    const url = URL.createObjectURL(logoDark);
    prevDarkUrlRef.current = url;
    setLogoDarkPreview(url);
    return () => {
      if (prevDarkUrlRef.current) {
        URL.revokeObjectURL(prevDarkUrlRef.current);
        prevDarkUrlRef.current = null;
      }
    };
  }, [logoDark]);

  useEffect(() => {
    if (!chartBackground) return;
    if (prevChartBgUrlRef.current)
      URL.revokeObjectURL(prevChartBgUrlRef.current);
    const url = URL.createObjectURL(chartBackground);
    prevChartBgUrlRef.current = url;
    setChartBgPreview(url);
    return () => {
      if (prevChartBgUrlRef.current) {
        URL.revokeObjectURL(prevChartBgUrlRef.current);
        prevChartBgUrlRef.current = null;
      }
    };
  }, [chartBackground]);

  useEffect(() => {
    if (!favicon) return;
    if (prevFaviconUrlRef.current)
      URL.revokeObjectURL(prevFaviconUrlRef.current);
    const url = URL.createObjectURL(favicon);
    prevFaviconUrlRef.current = url;
    setFaviconPreview(url);
    return () => {
      if (prevFaviconUrlRef.current) {
        URL.revokeObjectURL(prevFaviconUrlRef.current);
        prevFaviconUrlRef.current = null;
      }
    };
  }, [favicon]);

  const updateSetting = (key: keyof GeneralSettingsState, value: string) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateBooleanSetting = (
    key:
      | "trackRegisterEvents"
      | "trackDepositEvents"
      | "trackWithdrawalEvents",
    value: boolean,
  ) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateMarketProvider = (
    providerId: number,
    patch: Partial<MarketProviderSettings>,
  ) => {
    setGeneralSettings((prev) => ({
      ...prev,
      marketProviders: prev.marketProviders.map((provider) =>
        provider.id === providerId ? { ...provider, ...patch } : provider,
      ),
    }));
  };

  const generateSecretValue = (bytes = 32) => {
    const buffer = new Uint8Array(bytes);
    window.crypto.getRandomValues(buffer);
    return Array.from(buffer, (value) =>
      value.toString(16).padStart(2, "0"),
    ).join("");
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

  const handleSave = async () => {
    setIsLoading(true);

    const payload: Record<string, unknown> = {
      nomeSite: generalSettings.siteName,
      urlSite: generalSettings.siteUrl,
      logoUrlWhite: generalSettings.logoWhiteUrl,
      logoUrlDark: generalSettings.logoDarkUrl,
      supportUrl: generalSettings.supportUrl || null,
      supportAvailabilityText:
        generalSettings.supportAvailabilityText || "TODO DIA, A TODA HORA",
      platformTimezone:
        generalSettings.platformTimezone || "America/Sao_Paulo",
      chartBackgroundUrl: generalSettings.chartBackgroundUrl || null,
      faviconUrl: generalSettings.faviconUrl || null,
      postbackUrl: generalSettings.postbackUrl || null,
      googleAnalyticsId: generalSettings.googleAnalyticsId || null,
      googleTagManagerId: generalSettings.googleTagManagerId || null,
      facebookPixelId: generalSettings.facebookPixelId || null,
      trackRegisterEvents: generalSettings.trackRegisterEvents,
      trackDepositEvents: generalSettings.trackDepositEvents,
      trackWithdrawalEvents: generalSettings.trackWithdrawalEvents,
      authSecret: generalSettings.authSecret || null,
      adminSessionSecret: generalSettings.adminSessionSecret || null,
      settleSecret: generalSettings.settleSecret || null,
      googleClientId: generalSettings.googleClientId || null,
      googleClientSecret: generalSettings.googleClientSecret || null,
      tradingMinPriceVariation:
        Number(generalSettings.tradingMinPriceVariation) || 0,
      tradingSettlementTolerance:
        Number(generalSettings.tradingSettlementTolerance) || 0,
      tradingDefaultExpiryMinutes:
        Number(generalSettings.tradingDefaultExpiryMinutes) || 5,
      tradingExpiryOptions:
        generalSettings.tradingExpiryOptions || "1,5,10,15,30,60,1440",
      tradingSettlementGraceSeconds:
        Number(generalSettings.tradingSettlementGraceSeconds) || 2,
      marketProviders: generalSettings.marketProviders.map((provider) => ({
        id: provider.id,
        authToken: provider.authToken || null,
        isActive: provider.isActive,
      })),
    };

    for (const key of brandingFieldKeys) {
      payload[key] = generalSettings[key];
    }

    if (logoWhite) payload.logoWhite = await readFileAsDataUrl(logoWhite);
    if (logoDark) payload.logoDark = await readFileAsDataUrl(logoDark);
    if (chartBackground)
      payload.chartBackground = await readFileAsDataUrl(chartBackground);
    if (favicon) payload.favicon = await readFileAsDataUrl(favicon);

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      const response = await res.json();
      if (response?.data) {
        setGeneralSettings(buildSettingsFromResponse(response.data));
      }

      toast({
        title: "Sucesso",
        description: "Branding e configuracoes gerais salvos com sucesso!",
      });

      window.dispatchEvent(new Event("logoUpdated"));
    } catch {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configuracoes gerais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderColorField = (field: ColorField) => {
    const colorValue = generalSettings[field.key];
    const pickerValue = COLOR_INPUT_RE.test(colorValue)
      ? colorValue
      : BRANDING_DEFAULTS[field.key];

    return (
      <div
        key={field.key}
        className="rounded-2xl border border-border/60 bg-background/35 p-4"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor={field.key} className="text-sm font-semibold">
              {field.label}
            </Label>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {field.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              updateSetting(field.key, BRANDING_DEFAULTS[field.key])
            }
            className="rounded-full border border-border/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            Padrao
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Input
            id={field.key}
            type="color"
            value={pickerValue}
            onChange={(e) => updateSetting(field.key, e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-xl border-border/60 bg-background p-1"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              value={colorValue}
              onChange={(e) => updateSetting(field.key, e.target.value)}
              className="h-11 font-mono text-xs"
            />
            <div
              className="h-2 rounded-full border border-border/50"
              style={{ backgroundColor: pickerValue }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 py-4">
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Informacoes do site</h3>
            <p className="text-xs text-muted-foreground">
              Nome, URL e configuracoes basicas da plataforma.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="siteName">Nome do site</Label>
            <Input
              id="siteName"
              value={generalSettings.siteName}
              onChange={(e) => updateSetting("siteName", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">URL do site</Label>
            <Input
              id="siteUrl"
              value={generalSettings.siteUrl}
              onChange={(e) => updateSetting("siteUrl", e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="postbackUrl">URL de postback</Label>
            <Input
              id="postbackUrl"
              value={generalSettings.postbackUrl}
              onChange={(e) => updateSetting("postbackUrl", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              A URL cadastrada recebera os eventos gerados pela plataforma.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportUrl">Link de suporte</Label>
            <Input
              id="supportUrl"
              value={generalSettings.supportUrl}
              onChange={(e) => updateSetting("supportUrl", e.target.value)}
              placeholder="https://wa.me/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportAvailabilityText">Texto do rodape</Label>
            <Input
              id="supportAvailabilityText"
              value={generalSettings.supportAvailabilityText}
              onChange={(e) =>
                updateSetting("supportAvailabilityText", e.target.value)
              }
              placeholder="TODO DIA, A TODA HORA"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="platformTimezone">Timezone da plataforma</Label>
            <Input
              id="platformTimezone"
              value={generalSettings.platformTimezone}
              onChange={(e) =>
                updateSetting("platformTimezone", e.target.value)
              }
              placeholder="America/Sao_Paulo"
            />
          </div>
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">SEO e pixels</h3>
            <p className="text-xs text-muted-foreground">
              IDs globais para Google e Meta, com controle dos eventos de
              registro, deposito e saque.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
            <Input
              id="googleAnalyticsId"
              value={generalSettings.googleAnalyticsId}
              onChange={(e) =>
                updateSetting("googleAnalyticsId", e.target.value)
              }
              placeholder="G-XXXXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
            <Input
              id="googleTagManagerId"
              value={generalSettings.googleTagManagerId}
              onChange={(e) =>
                updateSetting("googleTagManagerId", e.target.value)
              }
              placeholder="GTM-XXXXXXX"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="facebookPixelId">Facebook Pixel ID</Label>
            <Input
              id="facebookPixelId"
              value={generalSettings.facebookPixelId}
              onChange={(e) =>
                updateSetting("facebookPixelId", e.target.value)
              }
              placeholder="123456789012345"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border/60 bg-card/40 p-4 md:grid-cols-3">
          {[
            {
              key: "trackRegisterEvents" as const,
              title: "Rastrear registros",
              description: "Dispara eventos de pixel quando um usuario se registra.",
            },
            {
              key: "trackDepositEvents" as const,
              title: "Rastrear depositos",
              description: "Dispara eventos de pixel quando um deposito e criado.",
            },
            {
              key: "trackWithdrawalEvents" as const,
              title: "Rastrear saques",
              description: "Dispara eventos de pixel quando um saque e solicitado.",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-border/60 bg-background/35 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label className="text-sm font-semibold">{item.title}</Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Switch
                  checked={generalSettings[item.key]}
                  onCheckedChange={(checked) =>
                    updateBooleanSetting(item.key, checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Imagens e logotipos</h3>
            <p className="text-xs text-muted-foreground">
              Uploads e URLs publicas usadas na plataforma.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ImageUploadZone
            label="Logotipo claro"
            description="Exibido sobre fundos escuros."
            currentUrl={generalSettings.logoWhiteUrl}
            previewUrl={logoWhitePreview}
            onFileSelect={setLogoWhite}
            onClear={() => {
              setLogoWhite(null);
              setLogoWhitePreview(null);
              updateSetting("logoWhiteUrl", "");
            }}
            onUrlChange={(url) => updateSetting("logoWhiteUrl", url)}
            urlValue={generalSettings.logoWhiteUrl}
            previewBg="bg-muted-foreground"
          />

          <ImageUploadZone
            label="Logotipo escuro"
            description="Exibido sobre fundos claros."
            currentUrl={generalSettings.logoDarkUrl}
            previewUrl={logoDarkPreview}
            onFileSelect={setLogoDark}
            onClear={() => {
              setLogoDark(null);
              setLogoDarkPreview(null);
              updateSetting("logoDarkUrl", "");
            }}
            onUrlChange={(url) => updateSetting("logoDarkUrl", url)}
            urlValue={generalSettings.logoDarkUrl}
            previewBg="bg-muted"
          />

          <ImageUploadZone
            label="Favicon"
            description="Icone da aba do navegador."
            currentUrl={generalSettings.faviconUrl}
            previewUrl={faviconPreview}
            onFileSelect={setFavicon}
            onClear={() => {
              setFavicon(null);
              setFaviconPreview(null);
              updateSetting("faviconUrl", "");
            }}
            onUrlChange={(url) => updateSetting("faviconUrl", url)}
            urlValue={generalSettings.faviconUrl}
            accept="image/*,.ico"
            previewClass="max-w-[64px] h-auto"
          />

          <ImageUploadZone
            label="Fundo do grafico"
            description="Imagem usada atras dos candles."
            currentUrl={generalSettings.chartBackgroundUrl}
            previewUrl={chartBgPreview}
            onFileSelect={setChartBackground}
            onClear={() => {
              setChartBackground(null);
              setChartBgPreview(null);
              updateSetting("chartBackgroundUrl", "");
            }}
            onUrlChange={(url) => updateSetting("chartBackgroundUrl", url)}
            urlValue={generalSettings.chartBackgroundUrl}
            previewClass="max-w-full h-32"
          />
        </div>
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Operacoes e settlement</h3>
            <p className="text-xs text-muted-foreground">
              Regras que definem expiracao, tolerancia e criterio de ganho/perda.
            </p>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["trading-rules"]}
          className="rounded-2xl border border-border/60 bg-card/40 px-5"
        >
          <AccordionItem value="trading-rules" className="border-border/60">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    Parametros do motor de operacoes
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Esses valores sao salvos no banco e copiados para cada nova
                    operacao como snapshot.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Variacao minima para ganho
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Movimento minimo de preco na direcao correta para a
                    operacao ser considerada vencedora.
                  </p>
                  <Input
                    value={generalSettings.tradingMinPriceVariation}
                    onChange={(e) =>
                      updateSetting("tradingMinPriceVariation", e.target.value)
                    }
                    className="mt-3"
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Tolerancia de settlement
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Faixa de ruído adicionada ao criterio de fechamento para
                    evitar decisoes em microvariacoes.
                  </p>
                  <Input
                    value={generalSettings.tradingSettlementTolerance}
                    onChange={(e) =>
                      updateSetting(
                        "tradingSettlementTolerance",
                        e.target.value,
                      )
                    }
                    className="mt-3"
                    inputMode="decimal"
                    placeholder="0"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Expiracao padrao
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Valor inicial mostrado no painel de compra/venda.
                  </p>
                  <Input
                    value={generalSettings.tradingDefaultExpiryMinutes}
                    onChange={(e) =>
                      updateSetting(
                        "tradingDefaultExpiryMinutes",
                        e.target.value,
                      )
                    }
                    className="mt-3"
                    inputMode="numeric"
                    placeholder="5"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Janela extra de settlement
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Segundos adicionais apos o vencimento antes do worker tentar
                    fechar a operacao.
                  </p>
                  <Input
                    value={generalSettings.tradingSettlementGraceSeconds}
                    onChange={(e) =>
                      updateSetting(
                        "tradingSettlementGraceSeconds",
                        e.target.value,
                      )
                    }
                    className="mt-3"
                    inputMode="numeric"
                    placeholder="2"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/35 p-4 md:col-span-2">
                  <Label className="text-sm font-semibold">
                    Opcoes de expiracao
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Informe os minutos permitidos, separados por virgula. Exemplo:
                    1,5,10,15,30,60,1440
                  </p>
                  <Input
                    value={generalSettings.tradingExpiryOptions}
                    onChange={(e) =>
                      updateSetting("tradingExpiryOptions", e.target.value)
                    }
                    className="mt-3"
                    placeholder="1,5,10,15,30,60,1440"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Seguranca e sessoes</h3>
            <p className="text-xs text-muted-foreground">
              Segredos usados pelo Auth.js, sessao do admin e worker interno.
            </p>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["auth-secrets", "oauth"]}
          className="rounded-2xl border border-border/60 bg-card/40 px-5"
        >
          <AccordionItem value="auth-secrets" className="border-border/60">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    Chaves internas
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Gere segredos aleatorios para o app, o admin e o worker.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pb-5">
              {[
                {
                  key: "authSecret" as const,
                  label: "Auth secret",
                  description:
                    "Assina sessoes do trading e fluxos protegidos do Auth.js.",
                },
                {
                  key: "adminSessionSecret" as const,
                  label: "Admin session secret",
                  description:
                    "Assina a sessao do painel administrativo.",
                },
                {
                  key: "settleSecret" as const,
                  label: "Settlement secret",
                  description:
                    "Protege chamadas internas do worker de settlement.",
                },
              ].map((field) => (
                <div
                  key={field.key}
                  className="rounded-2xl border border-border/60 bg-background/35 p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <Label className="text-sm font-semibold">
                        {field.label}
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {field.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateSetting(field.key, generateSecretValue())
                      }
                    >
                      Gerar
                    </Button>
                  </div>
                  <Input
                    value={generalSettings[field.key]}
                    onChange={(e) => updateSetting(field.key, e.target.value)}
                    className="font-mono text-xs"
                    placeholder="Clique em gerar ou informe um valor manualmente"
                  />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="oauth" className="border-border/60">
            <AccordionTrigger className="py-5 hover:no-underline">
              <div className="flex items-start gap-3 text-left">
                <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                  <PlugZap className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold">
                    OAuth e provedores
                  </span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Credenciais do Google e tokens dos provedores de mercado.
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-5 pb-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Google Client ID
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Habilita login social no trading com Auth.js.
                  </p>
                  <Input
                    value={generalSettings.googleClientId}
                    onChange={(e) =>
                      updateSetting("googleClientId", e.target.value)
                    }
                    className="mt-3 font-mono text-xs"
                    placeholder="Cole o client id do Google"
                  />
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/35 p-4">
                  <Label className="text-sm font-semibold">
                    Google Client Secret
                  </Label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Segredo OAuth usado pelo provider do Google.
                  </p>
                  <Input
                    value={generalSettings.googleClientSecret}
                    onChange={(e) =>
                      updateSetting("googleClientSecret", e.target.value)
                    }
                    className="mt-3 font-mono text-xs"
                    placeholder="Cole o client secret do Google"
                  />
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Tokens e ativação de provedores de mercado são gerenciados em{" "}
                <strong>Paridades</strong>.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <div className="border-t" />

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-base font-semibold">Mapa de cores dinamico</h3>
            <p className="text-xs text-muted-foreground">
              Todas as familias de cor foram organizadas por contexto para
              facilitar manutencao.
            </p>
          </div>
        </div>

        <Accordion
          type="multiple"
          defaultValue={["actions", "surfaces", "chart"]}
          className="rounded-2xl border border-border/60 bg-card/40 px-5"
        >
          {colorSections.map((section) => {
            const Icon = section.icon;
            return (
              <AccordionItem
                key={section.value}
                value={section.value}
                className="border-border/60"
              >
                <AccordionTrigger className="py-5 hover:no-underline">
                  <div className="flex min-w-0 items-start gap-3 text-left">
                    <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {section.title}
                        </span>
                        <span className="rounded-full border border-border/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {section.fields.length} cores
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {section.fields.map(renderColorField)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      <div className="pt-2">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Salvando..." : "Salvar configuracoes"}
        </Button>
      </div>
    </div>
  );
}
