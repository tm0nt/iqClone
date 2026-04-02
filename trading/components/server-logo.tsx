import { getPlatformConfig } from "@/lib/config/site-config";
import { resolveLogoForBackground } from "@shared/platform/branding";

interface ServerLogoProps {
  width?: number;
  variant?: "auto" | "light" | "dark";
}

export async function ServerLogo({ width = 200, variant = "auto" }: ServerLogoProps) {
  const config = await getPlatformConfig();

  const logoUrl =
    variant === "light"
      ? config.logoUrlWhite
      : variant === "dark"
        ? config.logoUrlDark
        : resolveLogoForBackground({
            backgroundColor: config.backgroundColor ?? "#000000",
            logoDark: config.logoUrlDark,
            logoWhite: config.logoUrlWhite,
            fallback: config.logoUrlDark,
          });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoUrl}
      alt={`${config.nomeSite} Logo`}
      width={width}
      fetchPriority="high"
      className="object-contain"
    />
  );
}
