"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ArrowRight, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import AuthToggle from "@/components/auth/auth-toggle";
import { registerUser, loginUser } from "@/lib/auth/auth-service";
import { motion } from "framer-motion";
import { setAffCookie } from "@/app/actions/setAffCookie";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { trackPlatformPixel } from "@/lib/tracking/pixels";

interface RegisterFormProps {
  onToggleMode: () => void;
}

function getPasswordStrength(password: string) {
  if (!password) {
    return {
      score: 0,
      labelKey: "passwordStrength.empty",
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

  if (score <= 1) {
    return { score: 1, labelKey: "passwordStrength.weak" };
  }

  if (score === 2) {
    return { score: 2, labelKey: "passwordStrength.fair" };
  }

  if (score === 3) {
    return { score: 3, labelKey: "passwordStrength.good" };
  }

  return { score: 4, labelKey: "passwordStrength.strong" };
}

export default function RegisterForm({ onToggleMode }: RegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [nameValid, setNameValid] = useState<boolean | null>(null);

  const toast = useToast();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth.Register");

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name: string) => name.trim().length > 0;
  const validatePassword = (password: string) => password.length >= 8;
  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    const aff = searchParams.get("aff");
    if (aff) setAffCookie(aff);
  }, [searchParams]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailValid(value ? validateEmail(value) : null);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setNameValid(validateName(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      setPasswordValid(validatePassword(value));
      if (confirmPassword) setPasswordsMatch(value === confirmPassword);
    } else {
      setPasswordValid(null);
      setPasswordsMatch(null);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPasswordsMatch(value ? password === value : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast.open({
        variant: "error",
        title: t("errors.email.title"),
        description: t("errors.email.description"),
        duration: 3000
      });
      return;
    }

    if (!validatePassword(password)) {
      toast.open({
        variant: "error",
        title: t("errors.password.title"),
        description: t("errors.password.description"),
        duration: 3000
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.open({
        variant: "error",
        title: t("errors.passwordsMatch.title"),
        description: t("errors.passwordsMatch.description"),
        duration: 3000
      });
      return;
    }

    if (!acceptTerms) {
      toast.open({
        variant: "error",
        title: t("errors.terms.title"),
        description: t("errors.terms.description"),
        duration: 3000
      });
      return;
    }

    setLoading(true);
    try {
      await registerUser(name, email, password);
      trackPlatformPixel("register", { email });

      await loginUser(email, password);

      toast.open({
        variant: "success",
        title: t("toast.success.title"),
        description: t("toast.success.description"),
        duration: 3000
      });

      setTimeout(() => {
        window.location.href = "/trading";
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
        <label htmlFor="name" className="block text-sm text-black/60 mb-2">
          {t("nameLabel")}
        </label>
        <div className="relative">
          <div className={iconClassName}>
            <User size={18} />
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            autoComplete="name"
            className={`${inputClassName} pl-11 pr-4`}
            placeholder={t("namePlaceholder")}
            required
          />
        </div>
        {nameValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.name.inline")}</p>}
      </motion.div>

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
            onChange={handleEmailChange}
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            className={`${inputClassName} pl-11 pr-4`}
            placeholder={t("emailPlaceholder")}
            required
          />
        </div>
        {emailValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.email.inline")}</p>}
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
            onChange={handlePasswordChange}
            autoComplete="new-password"
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
        {password.length > 0 ? (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-black/55">{t("passwordStrength.label")}</span>
              <span className="font-medium text-black/75">
                {t(passwordStrength.labelKey)}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-colors duration-200 ${
                    index < passwordStrength.score ? "bg-black" : "bg-black/10"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : null}
        {passwordValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.password.inline")}</p>}
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="confirmPassword" className="block text-sm text-black/60 mb-2">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <div className={iconClassName}>
            <Lock size={18} />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            autoComplete="new-password"
            className={`${inputClassName} pl-11 pr-12`}
            placeholder={t("confirmPasswordPlaceholder")}
            required
          />
          <button
            type="button"
            className={visibilityButtonClassName}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="sr-only">
              {showConfirmPassword
                ? t("togglePasswordVisibilityHide")
                : t("togglePasswordVisibilityShow")}
            </span>
          </button>
        </div>
        {passwordsMatch === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.passwordsMatch.inline")}</p>}
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 mb-5">
        <label className="flex items-start group cursor-pointer">
          <div className="relative flex items-center mt-1 mr-2">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="peer sr-only" />
            <div className="w-5 h-5 border-2 border-black/20 rounded transition-colors duration-300 group-hover:border-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <span className="text-xs text-black/50">
            {t("termsTextStart")}
            <a href="#" className="font-medium text-black transition-colors duration-300 hover:text-black/70 hover:underline">{t("termsTextTerms")}</a>
            {t("termsTextAnd")}
            <a href="#" className="font-medium text-black transition-colors duration-300 hover:text-black/70 hover:underline">{t("termsTextPrivacy")}</a>
          </span>
        </label>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12">
        <button type="submit" className="bg-black text-white w-full py-3 transition-all duration-300 flex items-center justify-center hover:bg-black/85 transform hover:-translate-y-0.5" disabled={loading}>
          {loading ? <Skeleton className="h-5 w-28 rounded-full bg-white/25" /> : (<><span className="mr-2 font-medium">{t("submit")}</span><ArrowRight size={18} /></>)}
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12">
        <AuthToggle message={t("toggleMessage")} linkText={t("toggleLink")} onToggle={onToggleMode} />
      </motion.div>
    </motion.form>
  );
}
