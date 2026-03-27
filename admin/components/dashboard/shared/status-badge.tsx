"use client"

import { Badge } from "@/components/ui/badge"

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple"

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-success/10 text-success hover:bg-success/15 border-0",
  warning: "bg-warning/10 text-warning hover:bg-warning/15 border-0",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/15 border-0",
  info: "bg-info/10 text-info hover:bg-info/15 border-0",
  neutral: "bg-muted text-muted-foreground hover:bg-muted/80 border-0",
  purple: "bg-accent text-accent-foreground hover:bg-accent/80 border-0",
}

interface StatusBadgeProps {
  variant: StatusVariant
  children: React.ReactNode
  className?: string
}

export function StatusBadge({ variant, children, className = "" }: StatusBadgeProps) {
  return (
    <Badge className={`${variantStyles[variant]} font-medium text-xs ${className}`}>
      {children}
    </Badge>
  )
}

// Pre-configured status badges for common statuses
const statusMap: Record<string, { label: string; variant: StatusVariant }> = {
  concluido: { label: "Concluído", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  processando: { label: "Processando", variant: "info" },
  cancelado: { label: "Cancelado", variant: "danger" },
  APPROVED: { label: "Aprovado", variant: "success" },
  PENDING: { label: "Pendente", variant: "warning" },
  REJECT: { label: "Rejeitado", variant: "danger" },
}

export function AutoStatusBadge({ status }: { status: string }) {
  const config = statusMap[status]
  if (!config) return <StatusBadge variant="neutral">{status}</StatusBadge>
  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>
}

// Type badges
export function TypeBadge({ type, label }: { type: "deposit" | "withdrawal" | "usuario" | "afiliado" | string; label?: string }) {
  const config: Record<string, { label: string; variant: StatusVariant }> = {
    deposit: { label: "Depósito", variant: "success" },
    withdrawal: { label: "Saque", variant: "danger" },
    usuario: { label: "Usuário", variant: "neutral" },
    afiliado: { label: "Afiliado", variant: "purple" },
  }
  const c = config[type] || { label: label || type, variant: "neutral" as StatusVariant }
  return (
    <Badge variant="outline" className={`text-xs font-medium ${variantStyles[c.variant]} bg-transparent border`}>
      {label || c.label}
    </Badge>
  )
}
