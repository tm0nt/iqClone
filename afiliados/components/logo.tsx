"use client";

import { useEffect, useState } from "react";
import { resolveLogoForBackground } from "@shared/platform/branding";

interface LogoProps {
  onDataLoaded?: (data: { logoUrl: string; nome: string }) => void;
  width?: number;
}

export function Logo({ onDataLoaded, width = 200 }: LogoProps) {
  const [data, setData] = useState({
    logoDark: "/logo.png",
    logoWhite: "/logo.png",
    nome: "Empresa",
    backgroundColor: "#252b3b",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isLoaded) return;

    let isMounted = true;

    fetch("/api/logo")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch logo data");
        }
        return response.json();
      })
      .then((responseData) => {
        if (!isMounted) return;

        const newData = {
          logoDark: responseData.logoDark || responseData.logo || "/logo.png",
          logoWhite: responseData.logoWhite || responseData.logo || "/logo.png",
          nome: responseData.nome || "Empresa",
          backgroundColor: responseData.backgroundColor || "#252b3b",
        };
        setData(newData);
        setIsLoaded(true);
        if (onDataLoaded) {
          onDataLoaded({
            logoUrl: resolveLogoForBackground({
              backgroundColor: newData.backgroundColor,
              logoDark: newData.logoDark,
              logoWhite: newData.logoWhite,
              fallback: "/logo.png",
            }),
            nome: newData.nome,
          });
        }
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Erro ao carregar logo:", error);
        const fallbackData = {
          logoDark: "/logo.png",
          logoWhite: "/logo.png",
          nome: "Empresa",
          backgroundColor: "#252b3b",
        };
        setData(fallbackData);
        setIsLoaded(true);
        if (onDataLoaded) {
          onDataLoaded({
            logoUrl: resolveLogoForBackground({
              backgroundColor: fallbackData.backgroundColor,
              logoDark: fallbackData.logoDark,
              logoWhite: fallbackData.logoWhite,
              fallback: "/logo.png",
            }),
            nome: fallbackData.nome,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [onDataLoaded, isLoaded]);

  const resolvedLogo = resolveLogoForBackground({
    backgroundColor: data.backgroundColor,
    logoDark: data.logoDark,
    logoWhite: data.logoWhite,
    fallback: "/logo.png",
  });

  return (
    <div className="flex items-center">
      <div className="relative flex h-full w-full items-center justify-center">
        <img src={resolvedLogo} width={width} alt={`${data.nome} Logo`} />
      </div>
    </div>
  );
}
