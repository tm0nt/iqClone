"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/auth-card";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { ToastContainer } from "@/components/ui/toast";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import AuthFooter from "@/components/auth/auth-footer";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const t = useTranslations("Auth");

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleAuthMode = () => setIsLogin((v) => !v);

  return (
    <ToastContainer>
      <div className="min-h-screen platform-auth-bg theme-transition relative overflow-hidden">
        <div className="flex min-h-screen items-center justify-center px-4 pb-8 pt-32">
          <motion.div
            className="w-full max-w-md relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <AuthCard
                  title={isLogin ? t("loginTitle") : t("signupTitle")}
                  subtitle={isLogin ? t("loginSubtitle") : t("signupSubtitle")}
                >
                  {isLogin ? (
                    <LoginForm onToggleMode={toggleAuthMode} />
                  ) : (
                    <RegisterForm onToggleMode={toggleAuthMode} />
                  )}
                  <AuthFooter />
                </AuthCard>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </ToastContainer>
  );
}
