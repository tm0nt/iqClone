"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        variant: "warning",
        title: "As senhas não coincidem",
        description: "Por favor, certifique-se de que suas senhas coincidem",
      })
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
      toast({
        variant: "success",
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Falha no registro",
        description: "Houve um problema ao criar sua conta",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-muted-foreground">
          Nome Completo
        </Label>
        <Input
          id="name"
          placeholder="Digite seu nome completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12 rounded-md border-input bg-background px-4 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-md border-input bg-background px-4 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-muted-foreground">
          Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Crie uma senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-md border-input bg-background px-4 pr-11 shadow-sm focus:border-primary focus:ring-primary"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 z-10 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground/60" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground/60" />
            )}
            <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-muted-foreground">
          Confirmar Senha
        </Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirme sua senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-12 rounded-md border-input bg-background px-4 pr-11 shadow-sm focus:border-primary focus:ring-primary"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 z-10 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground/60" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground/60" />
            )}
            <span className="sr-only">
              {showConfirmPassword ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
            </span>
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="h-12 w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  )
}
