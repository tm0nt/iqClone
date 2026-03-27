"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";

type AudioAvailabilityState = {
  status: "unknown" | "checking" | "available" | "missing";
  lastCheckedAt: number;
};

const audioAvailabilityMap = new Map<string, AudioAvailabilityState>();
const AUDIO_RECHECK_MS = 15_000;
export const PLATFORM_SOUND_ENABLED_KEY = "platform:sound-enabled";

function primeAudioSource(
  src: string,
  audioRef: MutableRefObject<HTMLAudioElement | null>,
) {
  const now = Date.now();
  const availability = audioAvailabilityMap.get(src);
  const shouldRecheck =
    !availability ||
    availability.status === "unknown" ||
    (availability.status === "missing" &&
      now - availability.lastCheckedAt > AUDIO_RECHECK_MS);

  if (!shouldRecheck) {
    if (availability?.status === "available" && !audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = "auto";
      audioRef.current.onerror = () => {};
    }
    return availability?.status === "available";
  }

  if (availability?.status === "checking") {
    return false;
  }

  audioAvailabilityMap.set(src, {
    status: "checking",
    lastCheckedAt: now,
  });

  void fetch(src, { method: "HEAD", cache: "no-store" })
    .then((response) => {
      const contentType = response.headers.get("content-type") ?? "";
      const isAudio = response.ok && contentType.startsWith("audio/");

      audioAvailabilityMap.set(src, {
        status: isAudio ? "available" : "missing",
        lastCheckedAt: Date.now(),
      });

      if (isAudio && !audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.preload = "auto";
        audioRef.current.onerror = () => {};
      }
    })
    .catch(() => {
      audioAvailabilityMap.set(src, {
        status: "missing",
        lastCheckedAt: Date.now(),
      });
    });

  return false;
}

export function useTickSound(src = "/sound_click.ogg") {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    primeAudioSource(src, audioRef);
  }, [src]);

  return useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(PLATFORM_SOUND_ENABLED_KEY) === "false") {
      return;
    }

    const isAvailable = primeAudioSource(src, audioRef);
    if (!isAvailable) {
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.preload = "auto";
      audioRef.current.onerror = () => {};
    }

    const audio = audioRef.current.cloneNode(true) as HTMLAudioElement;
    audio.volume = 0.45;
    audio.onerror = () => {};
    void audio.play().catch(() => {});
  }, [src]);
}
