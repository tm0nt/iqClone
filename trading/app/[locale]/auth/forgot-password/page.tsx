"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Link } from "@/i18n/navigation";
import { ToastContainer, useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.open({
          variant: "error",
          title: "Erro",
          description: data.error || "Não foi possível processar sua solicitação.",
          duration: 4000,
        });
        return;
      }

      setSent(true);
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

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: "var(--platform-primary-color, #1ca06d)20" }}>
          <Mail size={32} style={{ color: "var(--platform-primary-color, #1ca06d)" }} />
        </div>
        <h2 className="text-xl font-bold text-black">Verifique seu e-mail</h2>
        <p className="text-sm text-black/50">
          Se o e-mail <strong>{email}</strong> estiver cadastrado na plataforma,
          você receberá um link para redefinir sua senha em breve.
        </p>
        <p className="text-xs text-black/40">
          Não recebeu? Verifique a caixa de spam ou entre em contato com o suporte.
        </p>
        <Link
          href="/auth"
          className="inline-flex items-center gap-2 text-sm mt-4 hover:underline"
          style={{ color: "var(--platform-primary-color, #1ca06d)" }}
        >
          <ArrowLeft size={14} />
          Voltar ao login
        </Link>
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
        <h2 className="text-2xl font-bold text-black">Esqueceu a senha?</h2>
        <p className="text-sm text-black/50 mt-1">
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-black/60 mb-2">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Mail size={18} className="text-black/40" />
          </div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-black/10 py-3 pl-10 pr-4 text-black focus:outline-none focus:border-black/30 transition-colors"
            placeholder="Digite seu e-mail"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white w-full py-3 flex items-center justify-center gap-2 font-medium transition-all hover:bg-black/85"
      >
        {loading ? (
          <Skeleton className="h-5 w-36 rounded-full bg-white/25" />
        ) : (
          <>
            <span>Enviar link de redefinição</span>
            <ArrowRight size={18} />
          </>
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

export default function ForgotPasswordPage() {
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
            <ForgotPasswordForm />
          </div>
        </motion.div>
      </div>
    </ToastContainer>
  );
}
