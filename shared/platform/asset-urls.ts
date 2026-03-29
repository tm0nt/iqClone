function normalizeBaseUrl(baseUrl?: string | null) {
  const normalized = baseUrl?.trim().replace(/\/+$/, "");
  return normalized && normalized.length > 0 ? normalized : null;
}

export function resolveAdminAssetUrl(
  url: string | null | undefined,
  adminBaseUrl?: string | null,
) {
  const value = url?.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const baseUrl = normalizeBaseUrl(adminBaseUrl);
  if (!baseUrl) {
    return value;
  }

  if (value.startsWith("/api/images/")) {
    return `${baseUrl}${value}`;
  }

  if (value.startsWith("/uploads/")) {
    const filename = value.split("/").filter(Boolean).pop();
    if (!filename) {
      return value;
    }
    return `${baseUrl}/api/images/${filename}`;
  }

  return value;
}
