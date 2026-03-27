"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    lastName: "",
    country: "br",
    dateOfBirth: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        variant: "success",
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso",
      })
    }, 1500)
  }

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Atualize seus detalhes pessoais e informações de contato</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-20 w-20 border-4 border-muted">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {user?.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Button size="sm" variant="outline" className="mt-2">
              <User className="mr-2 h-4 w-4" />
              Alterar foto
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={formData.name} onChange={handleChange} placeholder="Digite seu nome" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Sobrenome</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Digite seu sobrenome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Digite seu email"
              disabled
            />
            <p className="text-xs text-muted-foreground">Seu email é usado para login e não pode ser alterado</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">País de Residência</Label>
              <Select value={formData.country} onValueChange={(value) => handleSelectChange(value, "country")}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="br">Brasil</SelectItem>
                  <SelectItem value="us">Estados Unidos</SelectItem>
                  <SelectItem value="ca">Canadá</SelectItem>
                  <SelectItem value="mx">México</SelectItem>
                  <SelectItem value="ar">Argentina</SelectItem>
                  <SelectItem value="co">Colômbia</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Data de Nascimento</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando Alterações
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
