"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Role } from "./admins-management"
import { Eye, EyeOff } from "lucide-react"
import { useForm, FormProvider } from "react-hook-form"
import { useToast } from "@/components/ui/use-toast"

// ─── API helpers ──────────────────────────────────────────────────────────────

async function createAdmin(data: any) {
  const res = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Falha ao criar administrador")
  return json
}

async function updateAdmin(id: string, data: any) {
  const res = await fetch(`/api/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Falha ao atualizar administrador")
  return json
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(data: any, isEdit: boolean) {
  const errors: Record<string, string> = {}
  if (!data.nome || data.nome.length < 3) errors.nome = "O nome deve ter pelo menos 3 caracteres."
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.email = "Email inválido."
  if (!isEdit && (!data.senha || data.senha.length < 6)) errors.senha = "A senha deve ter pelo menos 6 caracteres."
  if (!data.nivel) errors.nivel = "Selecione um nível de acesso."
  return errors
}

// ─── Component ────────────────────────────────────────────────────────────────

type AdminFormValues = {
  nome: string
  email: string
  telefone?: string
  senha: string
  nivel: Role
}

interface AdminFormProps {
  admin: any | null
  onSuccess: () => void
  onCancel: () => void
}

export function AdminForm({ admin, onSuccess, onCancel }: AdminFormProps) {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<AdminFormValues>({
    defaultValues: {
      nome: admin?.nome ?? "",
      email: admin?.email ?? "",
      telefone: admin?.telefone ?? "",
      senha: "",
      nivel: admin?.nivel ?? Role.ASSISTANT_ADMIN,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const values = methods.getValues()
    const isEdit = !!admin

    const errors = validateForm(values, isEdit)
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, msg]) => {
        methods.setError(field as keyof AdminFormValues, { message: msg })
      })
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        // Only send senha if filled in
        const payload: any = { email: values.email, nome: values.nome, telefone: values.telefone, nivel: values.nivel }
        if (values.senha) payload.senha = values.senha
        await updateAdmin(admin.id, payload)
        toast({ title: "Sucesso", description: "Administrador atualizado com sucesso." })
      } else {
        await createAdmin({ ...values, email: values.email, nome: values.nome, telefone: values.telefone, nivel: values.nivel })
        toast({ title: "Sucesso", description: "Administrador criado com sucesso." })
      }
      onSuccess()
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao salvar administrador.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nome completo" />
                </FormControl>
                {methods.formState.errors.nome && <FormMessage>{methods.formState.errors.nome.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@exemplo.com" />
                </FormControl>
                {methods.formState.errors.email && <FormMessage>{methods.formState.errors.email.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="(00) 00000-0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="senha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{admin ? "Nova Senha (deixe vazio para manter)" : "Senha"}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={admin ? "Nova senha (opcional)" : "Senha"}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                {methods.formState.errors.senha && <FormMessage>{methods.formState.errors.senha.message}</FormMessage>}
              </FormItem>
            )}
          />

          <FormField
            name="nivel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de Acesso</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nível" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    <SelectItem value={Role.ASSISTANT_ADMIN}>Assistente Admin</SelectItem>
                  </SelectContent>
                </Select>
                {methods.formState.errors.nivel && <FormMessage>{methods.formState.errors.nivel.message}</FormMessage>}
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : admin ? "Atualizar Administrador" : "Cadastrar Administrador"}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
