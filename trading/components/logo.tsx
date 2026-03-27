"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/theme-context";
import { resolveLogoForBackground } from "@shared/platform/branding";

interface LogoProps {
  width?: number;
  height?: number;
  variant?: "auto" | "light" | "dark";
  onDataLoaded?: (data: { logoUrl: string; nome: string }) => void;
}

export function Logo({
  width = 200,
  height,
  variant = "auto",
  onDataLoaded,
}: LogoProps) {
  const { theme } = useTheme();
  const [data, setData] = useState<{
    logoDark: string;
    logoWhite: string;
    nome: string;
    backgroundColor: string;
  }>({
    logoDark: "/nextbrokers.png",
    logoWhite: "/nextbrokers.png",
    nome: "Empresa",
    backgroundColor: "#252b3b",
  });

  useEffect(() => {
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
          logoDark: responseData.logoDark || responseData.logo || "/nextbrokers.png",
          logoWhite: responseData.logoWhite || responseData.logo || "/nextbrokers.png",
          nome: responseData.nome || "Empresa",
          backgroundColor: responseData.backgroundColor || "#252b3b",
        };
        setData(newData);
      })
      .catch((error) => {
        if (!isMounted) return;

        console.error("Erro ao carregar logo:", error);
        const fallbackData = {
          logoDark: "/nextbrokers.png",
          logoWhite: "/nextbrokers.png",
          nome: "Empresa",
          backgroundColor: "#252b3b",
        };
        setData(fallbackData);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedLogoUrl =
    variant === "light"
      ? data.logoWhite
      : variant === "dark"
        ? data.logoDark
        : resolveLogoForBackground({
            backgroundColor: data.backgroundColor,
            logoDark: data.logoDark,
            logoWhite: data.logoWhite,
            fallback: theme === "dark" ? data.logoWhite : data.logoDark,
          });

  useEffect(() => {
    onDataLoaded?.({
      logoUrl: resolvedLogoUrl,
      nome: data.nome,
    });
  }, [data.nome, onDataLoaded, resolvedLogoUrl]);

  return (
    <img
      src={resolvedLogoUrl}
      alt={`${data.nome} Logo`}
      width={width}
      height={height}
      className="object-contain"
    />
  );
}
