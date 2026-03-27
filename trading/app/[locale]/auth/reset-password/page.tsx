"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Logo } from "@/components/logo";
import { Link, useRouter } from "@/i18n/navigation";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();

  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  useEffect(() => {
    if (!token) setTokenError(true);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.open({
        variant: "error",
        title: "Senha fraca",
        description: "A senha deve ter pelo menos 8 caracteres.",
        duration: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.open({
        variant: "error",
        title: "Senhas não coincidem",
        description: "As senhas informadas não são iguais.",
        duration: 4000,
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.open({
          variant: "error",
          title: "Erro",
          description: data.error || "Não foi possível redefinir a senha.",
          duration: 4000,
        });
        if (res.status === 400) setTokenError(true);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/auth"), 3000);
    } catch {
      toast.open({
        variant: "error",
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-platform-danger font-medium">
          Link inválido ou expirado.
        </p>
        <p className="text-xs text-black/40">
          Solicite um novo link de redefinição de senha.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-sm hover:underline"
          style={{ color: "var(--platform-primary-color, #1ca06d)" }}
        >
          <ArrowLeft size={14} />
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-3"
      >
        <CheckCircle size={48} className="mx-auto text-black" />
        <h2 className="text-xl font-bold text-black">Senha redefinida!</h2>
        <p className="text-sm text-black/50">
          Sua senha foi alterada com sucesso. Redirecionando para o login...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-2xl font-bold text-black">Nova senha</h2>
        <p className="text-sm text-black/50 mt-1">
          Escolha uma senha forte com pelo menos 8 caracteres.
        </p>
      </div>

      {/* New password */}
      <div>
        <label htmlFor="password" className="block text-sm text-black/60 mb-2">
          Nova senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-black/40" />
          </div>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-10 text-black focus:outline-none focus:border-black/30 transition-colors"
            placeholder="Mínimo 8 caracteres"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-black/40 hover:text-black/70"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirm" className="block text-sm text-black/60 mb-2">
          Confirmar nova senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Lock size={18} className="text-black/40" />
          </div>
          <input
            id="confirm"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-10 text-black focus:outline-none focus:border-black/30 transition-colors"
            placeholder="Repita a nova senha"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-black/40 hover:text-black/70"
            tabIndex={-1}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-platform-danger mt-1">As senhas não coincidem.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white w-full py-3 flex items-center justify-center gap-2 font-medium transition-all hover:bg-black/85"
      >
        {loading ? (
          <Skeleton className="h-5 w-28 rounded-full bg-white/25" />
        ) : (
          "Redefinir senha"
        )}
      </button>

      <div className="text-center">
        <Link
          href="/auth"
          className="inline-flex items-center gap-1 text-sm hover:underline"
          style={{ color: "var(--platform-primary-color, #1ca06d)" }}
        >
          <ArrowLeft size={14} />
          Voltar ao login
        </Link>
      </div>
    </motion.form>
  );
}

export default function ResetPasswordPage() {
  return (
    <ToastContainer>
      <div className="min-h-screen platform-auth-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <Logo width={180} variant="dark" />
        </motion.div>

        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="p-8 bg-white shadow-sm">
            <ResetPasswordForm />
          </div>
        </motion.div>
      </div>
    </ToastContainer>
  );
}
