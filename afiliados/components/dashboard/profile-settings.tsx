"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { useAccountStore } from "@/store/account-store"

export function ProfileSettings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const { name, email, fetchAffiliate } = useAccountStore()

  const [formData, setFormData] = useState({
    name: name || "",  // Garantido que name seja uma string vazia se for null ou undefined
    email: email || "",  // Garantido que email seja uma string vazia se for null ou undefined
    country: "br", 
  })

  // Atualiza os dados do formulário caso os valores na store mudem
  useEffect(() => {
    fetchAffiliate()
    setFormData((prev) => ({
      ...prev,
      name: name || "",
      email: email || "",
    }))
  }, [name, email])

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-4">
          <div>
            <h3 className="text-lg font-medium capitalize">{formData?.name}</h3>
            <p className="text-sm text-muted-foreground">{formData?.email}</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              disabled
              id="name"
              value={formData.name}  // Certificando-se de que name é uma string
              placeholder="Digite seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}  // Certificando-se de que email é uma string
              placeholder="Digite seu email"
              disabled
            />
            <p className="text-xs text-muted-foreground">Seu email é usado para login e não pode ser alterado</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País de Residência</Label>
            <Select
              value={formData.country}  // Garantido que country é uma string
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Selecione o país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="br">Brasil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
