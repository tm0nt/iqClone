"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Fazendo o login chamando a API /api/auth/login
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          variant: "success",
          title: "Login bem-sucedido",
          description: "Bem-vindo ao seu painel",
        })
        router.push("/dashboard")
      } else {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description:  "Por favor, verifique suas credenciais e tente novamente",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-600">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12 rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-600">
          Senha
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Digite a sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 rounded-md border-gray-300 bg-white px-4 shadow-sm focus:border-primary focus:ring-primary"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
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
          "Entrar"
        )}
      </Button>
    </form>
  )
}
