function normalizeSecret(value?: string | null) {
  const normalized = value?.trim() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function getAuthSessionSecret() {
  const envSecret = normalizeSecret(process.env.AUTH_SECRET);
  if (envSecret) {
    return envSecret;
  }

  const databaseUrl = normalizeSecret(process.env.DATABASE_URL);
  if (databaseUrl) {
    return `authjs-session:${databaseUrl}`;
  }

  return `authjs-session:${process.env.NODE_ENV ?? "development"}:local-fallback`;
}

export function getAuthSessionSecrets(previousSecret?: string | null) {
  const currentSecret = getAuthSessionSecret();
  const normalizedPrevious = normalizeSecret(previousSecret);

  if (normalizedPrevious && normalizedPrevious !== currentSecret) {
    return [currentSecret, normalizedPrevious];
  }

  return currentSecret;
}
