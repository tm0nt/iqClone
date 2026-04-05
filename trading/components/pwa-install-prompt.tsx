"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm md:bottom-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/90 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Instalar aplicativo</p>
          <p className="text-xs text-white/50 mt-0.5">Acesso rápido direto da tela inicial</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex-shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-black transition-colors hover:bg-white/90"
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
