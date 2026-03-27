"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Loader2, QrCode, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export function SecuritySettings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const { toast } = useToast()

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        variant: "success",
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      })
    }, 1500)
  }

  const handleToggleTwoFactor = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setTwoFactorEnabled(!twoFactorEnabled)
      setIsLoading(false)
      toast({
        variant: twoFactorEnabled ? "warning" : "success",
        title: twoFactorEnabled ? "Autenticação de dois fatores desativada" : "Autenticação de dois fatores ativada",
        description: twoFactorEnabled
          ? "Sua conta agora está menos segura"
          : "Sua conta agora está mais segura com autenticação de dois fatores",
      })
    }, 1500)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>Configure uma etapa de verificação adicional usando um código QR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{twoFactorEnabled ? "Ativada" : "Desativada"}</h3>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled
                  ? "A segurança da sua conta está em risco"
                  : "Sua conta está segura com autenticação de dois fatores"}
              </p>
            </div>
          </div>

          {twoFactorEnabled && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-4 flex justify-center">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <QrCode className="h-32 w-32" />
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Escaneie este código QR com seu aplicativo autenticador
              </p>
            </div>
          )}

          <Button onClick={handleToggleTwoFactor} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguarde
              </>
            ) : twoFactorEnabled ? (
              "Desativar Autenticação de Dois Fatores"
            ) : (
              "Ativar Autenticação de Dois Fatores"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/50">
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Digite sua senha atual"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showCurrentPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showNewPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme sua nova senha"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">{showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando
                </>
              ) : (
                "Atualizar Senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
