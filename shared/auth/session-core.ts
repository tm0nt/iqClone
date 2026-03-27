export interface SessionPayload {
  userId: string;
  email?: string | null;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export interface SessionCookieReadOptions {
  allowLegacyJson?: boolean;
}

export interface SessionSecretOptions {
  envNames?: string[];
  fallback?: string;
}

function decodeBase64UrlToString(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  return Buffer.from(padded, "base64").toString("utf8");
}

function normalizeSessionPayload(value: unknown): SessionPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const rawUserId = record.userId ?? record.sub;
  if (!rawUserId) {
    return null;
  }

  return {
    ...record,
    userId: String(rawUserId),
    email: record.email ? String(record.email) : undefined,
    sub: record.sub ? String(record.sub) : undefined,
    iat: typeof record.iat === "number" ? record.iat : undefined,
    exp: typeof record.exp === "number" ? record.exp : undefined,
  };
}

export function decodeJwtPayload(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    return normalizeSessionPayload(
      JSON.parse(decodeBase64UrlToString(parts[1])),
    );
  } catch {
    return null;
  }
}

export function decodeLegacySession(raw: string): SessionPayload | null {
  try {
    return normalizeSessionPayload(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readSessionFromCookieValue(
  token: string | undefined,
  options: SessionCookieReadOptions = {},
): SessionPayload | null {
  if (!token) {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(token);
  } catch {
    return null;
  }

  const jwtPayload = decodeJwtPayload(decoded);
  if (jwtPayload) {
    return jwtPayload;
  }

  if (options.allowLegacyJson !== false) {
    return decodeLegacySession(decoded);
  }

  return null;
}

export function isSessionExpired(
  payload: Pick<SessionPayload, "exp"> | null,
  now = Date.now(),
): boolean {
  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= now;
}

export function hasActiveSessionCookie(token: string | undefined): boolean {
  const payload = readSessionFromCookieValue(token);
  if (!payload) {
    return false;
  }

  return !isSessionExpired(payload);
}

export function getSessionSecretValue(
  options: SessionSecretOptions = {},
): string {
  const envNames = options.envNames ?? ["SESSION_SECRET", "JWT_SECRET_KEY"];

  return (
    envNames
      .map((envName) => process.env[envName])
      .find((value) => typeof value === "string" && value.length > 0) ??
    options.fallback ??
    "fallback-secret-change-me"
  );
}

export function getSessionCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
