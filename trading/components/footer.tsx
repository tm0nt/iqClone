"use client";

import { useEffect, useState } from "react";
import { Maximize2, Settings, Volume2, VolumeX } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  PLATFORM_SOUND_ENABLED_KEY,
  useTickSound,
} from "@/hooks/use-tick-sound";

export default function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [supportUrl, setSupportUrl] = useState("");
  const [supportAvailabilityText, setSupportAvailabilityText] = useState(
    t("allDayEveryDay"),
  );
  const [platformTimezone, setPlatformTimezone] =
    useState("America/Sao_Paulo");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const playTick = useTickSound();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const persisted = window.localStorage.getItem(PLATFORM_SOUND_ENABLED_KEY);
    setSoundEnabled(persisted !== "false");
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/config/general", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Falha ao carregar config");
        return response.json();
      })
      .then((data) => {
        if (cancelled) return;
        setSupportUrl(typeof data.supportUrl === "string" ? data.supportUrl : "");
        setSupportAvailabilityText(
          typeof data.supportAvailabilityText === "string" &&
            data.supportAvailabilityText.trim().length > 0
            ? data.supportAvailabilityText
            : t("allDayEveryDay"),
        );
        setPlatformTimezone(
          typeof data.platformTimezone === "string" &&
            data.platformTimezone.trim().length > 0
            ? data.platformTimezone
            : "America/Sao_Paulo",
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeStyle: "medium",
        timeZone: platformTimezone,
      }).format(now);
      setCurrentTime(`${t("currentTime")}: ${formattedDate}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [locale, platformTimezone, t]);

  const toggleSound = () => {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    window.localStorage.setItem(
      PLATFORM_SOUND_ENABLED_KEY,
      nextValue ? "true" : "false",
    );
    if (nextValue) {
      playTick();
    }
  };

  const toggleFullscreen = async () => {
    playTick();
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen();
  };

  const supportHref = supportUrl || `/${locale}/account?group=support`;

  return (
    <footer className="fixed bottom-0 w-full bg-platform-overlay-hover text-white text-xs px-4 py-2 flex justify-between items-center border-t border-platform-border z-50">
      <div className="flex items-center gap-3">
        <a
          href={supportHref}
          target={supportUrl ? "_blank" : undefined}
          rel={supportUrl ? "noreferrer" : undefined}
          onClick={() => playTick()}
          className="flex items-center gap-2 bg-platform-danger px-2 py-1 rounded"
        >
          <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
            <span className="text-platform-danger text-[8px] font-bold">?</span>
          </div>
          <span className="font-semibold text-white">{t("support")}</span>
        </a>
        <span className="text-platform-overlay-muted">
          {supportAvailabilityText}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
        <span className="text-platform-muted">{t("poweredBy")}</span>
          <span className="font-semibold text-white">Montenegro</span>
        </div>
        <span className="text-platform-muted">{currentTime}</span>
        <div className="flex items-center gap-2 ml-2">
          <button type="button" onClick={toggleSound}>
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-platform-overlay-muted hover:text-platform-text cursor-pointer" />
            ) : (
              <VolumeX className="w-4 h-4 text-platform-overlay-muted hover:text-platform-text cursor-pointer" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              playTick();
              router.push(`/${locale}/account`);
            }}
          >
            <Settings className="w-4 h-4 text-platform-overlay-muted hover:text-platform-text cursor-pointer" />
          </button>
          <button type="button" onClick={() => void toggleFullscreen()}>
            <Maximize2 className="w-4 h-4 text-platform-overlay-muted hover:text-platform-text cursor-pointer" />
          </button>
        </div>
      </div>
    </footer>
  );
}
