"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import AuthToggle from "@/components/auth/auth-toggle";
import {
  getAvailableAuthProviders,
  loginUser,
  loginWithGoogle,
} from "@/lib/auth/auth-service";
import { motion } from "framer-motion";
import { useRouter, Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface LoginFormProps {
  onToggleMode: () => void;
}

export default function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const t = useTranslations("Auth.Login");
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const callbackUrl = searchParams.get("callbackUrl") || "/trading";

  useEffect(() => {
    let mounted = true;

    async function loadProviders() {
      try {
        const providers = await getAvailableAuthProviders();
        if (mounted) {
          setGoogleEnabled(Boolean(providers["google"]));
        }
      } catch {
        if (mounted) {
          setGoogleEnabled(false);
        }
      }
    }

    loadProviders();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.open({
        variant: "error",
        title: t("toast.invalidEmail.title"),
        description: t("toast.invalidEmail.description"),
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email, password, callbackUrl);

      toast.open({
        variant: "success",
        title: t("toast.success.title"),
        description: t("toast.success.description"),
        duration: 3000
      });

      setTimeout(() => {
        if (result.url) {
          window.location.href = result.url;
          return;
        }

        if (callbackUrl.startsWith("/")) {
          window.location.href = callbackUrl;
          return;
        }

        router.push("/trading");
      }, 1000);
    } catch (error) {
      toast.open({
        variant: "error",
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!googleEnabled) {
      toast.open({
        variant: "error",
        title: t("toast.googleUnavailable.title"),
        description: t("toast.googleUnavailable.description"),
        duration: 3000,
      });
      return;
    }

    setGoogleLoading(true);

    try {
      await loginWithGoogle(callbackUrl);
    } catch {
      toast.open({
        variant: "error",
        title: t("toast.error.title"),
        description: t("toast.error.description"),
        duration: 3000,
      });
      setGoogleLoading(false);
    }
  };

  const formVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 20 } } };
  const inputClassName =
    "h-12 w-full border border-black/12 bg-white px-4 text-black placeholder:text-black/35 focus:border-black/35 focus:outline-none transition-colors duration-200";
  const iconClassName =
    "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/40";
  const visibilityButtonClassName =
    "absolute right-3 top-1/2 -translate-y-1/2 text-black/45 transition-colors duration-200 hover:text-black";

  return (
    <motion.form onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="visible" className="grid grid-cols-12 gap-4">
      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="email" className="block text-sm text-black/60 mb-2">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <div className={iconClassName}>
            <Mail size={18} />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            inputMode="email"
            spellCheck={false}
            className={`${inputClassName} pl-11 pr-4`}
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="password" className="block text-sm text-black/60 mb-2">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <div className={iconClassName}>
            <Lock size={18} />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={`${inputClassName} pl-11 pr-12`}
            placeholder={t("passwordPlaceholder")}
            required
          />
          <button
            type="button"
            className={visibilityButtonClassName}
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="sr-only">
              {showPassword
                ? t("togglePasswordVisibilityHide")
                : t("togglePasswordVisibilityShow")}
            </span>
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 mb-5 flex justify-end">
        <Link href="/auth/forgot-password" className="text-xs text-black/70 transition-colors duration-300 hover:text-black hover:underline">
          {t("forgotPassword")}
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12">
        <button
          type="submit"
          className="bg-black text-white w-full py-3 transition-all duration-300 flex items-center justify-center hover:bg-black/85 transform hover:-translate-y-0.5"
          disabled={loading}
        >
          {loading ? <Skeleton className="h-5 w-24 rounded-full bg-white/25" /> : (<><span className="mr-2 font-medium">{t("submit")}</span><ArrowRight size={18} /></>)}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 flex items-center gap-3 text-xs text-black/35">
        <span className="h-px flex-1 bg-black/10" />
        <span>{t("divider")}</span>
        <span className="h-px flex-1 bg-black/10" />
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          className="w-full border border-black/10 bg-white py-3 px-4 text-black transition-all duration-300 flex items-center justify-center gap-3 hover:border-black/30 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5A9.5 9.5 0 0 0 2.5 12 9.5 9.5 0 0 0 12 21.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6z"/>
            <path fill="#34A853" d="M3.6 7.5l3.2 2.3A5.8 5.8 0 0 1 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.5 14.5 2.5 12 2.5a9.4 9.4 0 0 0-8.4 5z"/>
            <path fill="#4A90E2" d="M12 21.5c2.4 0 4.5-.8 6.1-2.3l-2.8-2.3c-.8.5-1.9.9-3.3.9-3.9 0-5.2-2.6-5.4-3.9l-3.1 2.4A9.5 9.5 0 0 0 12 21.5z"/>
            <path fill="#FBBC05" d="M3.5 16.3l3.1-2.4c-.2-.5-.3-1.1-.3-1.9 0-.7.1-1.4.3-1.9L3.5 7.5A9.7 9.7 0 0 0 2.5 12c0 1.6.4 3.1 1 4.3z"/>
          </svg>
          <span className="font-medium">
            {googleLoading ? t("googleLoading") : t("googleSubmit")}
          </span>
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12">
        <AuthToggle message={t("toggleMessage")} linkText={t("toggleLink")} onToggle={onToggleMode} />
      </motion.div>
    </motion.form>
  );
}
