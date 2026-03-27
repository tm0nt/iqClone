"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { ArrowRight, User, Mail, Lock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import AuthToggle from "@/components/auth/auth-toggle";
import { registerUser } from "@/lib/auth/auth-service";
import { motion } from "framer-motion";
import { setAffCookie } from "@/app/actions/setAffCookie";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { trackPlatformPixel } from "@/lib/tracking/pixels";

interface RegisterFormProps {
  onToggleMode: () => void;
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

      toast.open({
        variant: "success",
        title: t("toast.success.title"),
        description: t("toast.success.description"),
        duration: 3000
      });

      onToggleMode();
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

  return (
    <motion.form onSubmit={handleSubmit} variants={formVariants} initial="hidden" animate="visible" className="grid grid-cols-12 gap-4">
      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="name" className="block text-sm text-black/60 mb-2">
          {t("nameLabel")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <User size={18} className="text-black/40" />
          </div>
          <input
            id="name"
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-4 text-black focus:outline-none focus:border-black/30 transition-colors duration-300"
            placeholder={t("namePlaceholder")}
            required
          />
          {nameValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.name.inline")}</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="email" className="block text-sm text-black/60 mb-2">
          {t("emailLabel")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-black/40" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-4 text-black focus:outline-none focus:border-black/30 transition-colors duration-300"
            placeholder={t("emailPlaceholder")}
            required
          />
          {emailValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.email.inline")}</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="password" className="block text-sm text-black/60 mb-2">
          {t("passwordLabel")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-platform-overlay-muted" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-10 text-black focus:outline-none focus:border-black/30 transition-colors duration-300"
            placeholder={t("passwordPlaceholder")}
            required
          />
          <button type="button" className="absolute inset-y-0 right-3 flex items-center" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
            <span className="sr-only">
              {showPassword
                ? t("togglePasswordVisibilityHide")
                : t("togglePasswordVisibilityShow")}
            </span>
          </button>
          {passwordValid === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.password.inline")}</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 md:col-span-12">
        <label htmlFor="confirmPassword" className="block text-sm text-black/60 mb-2">
          {t("confirmPasswordLabel")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-platform-overlay-muted" />
          </div>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-10 text-black focus:outline-none focus:border-black/30 transition-colors duration-300"
            placeholder={t("confirmPasswordPlaceholder")}
            required
          />
          <button type="button" className="absolute inset-y-0 right-3 flex items-center" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
            <span className="sr-only">
              {showConfirmPassword
                ? t("togglePasswordVisibilityHide")
                : t("togglePasswordVisibilityShow")}
            </span>
          </button>
          {passwordsMatch === false && <p className="mt-1 text-xs text-platform-danger">{t("errors.passwordsMatch.inline")}</p>}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="col-span-12 mb-8">
        <label className="flex items-start group cursor-pointer">
          <div className="relative flex items-center mt-1 mr-2">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="peer sr-only" />
            <div className="w-5 h-5 border-2 border-black/20 rounded transition-colors duration-300 group-hover:border-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity duration-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="var(--platform-primary-color)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <span className="text-xs text-black/50">
            {t("termsTextStart")}
            <a href="#" className="transition-colors duration-300 hover:underline" style={{ color: "var(--platform-primary-color)" }}>{t("termsTextTerms")}</a>
            {t("termsTextAnd")}
            <a href="#" className="transition-colors duration-300 hover:underline" style={{ color: "var(--platform-primary-color)" }}>{t("termsTextPrivacy")}</a>
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
