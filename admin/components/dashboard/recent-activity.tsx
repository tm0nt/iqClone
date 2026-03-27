"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, DollarSign, UserPlus, Users, CreditCard, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Activity = {
  id: string
  type: "signup" | "deposit" | "withdrawal" | "pending_withdrawal" | "affiliate" | "conversion"
  title: string
  description: string
  time: string
  status?: "completed" | "pending" | "failed"
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Simulate loading data with a delay for animation
    const timer = setTimeout(() => {
      setActivities([
        {
          id: "1",
          type: "signup",
          title: "Novo Cliente Cadastrado",
          description: "João Silva se cadastrou na plataforma",
          time: "2 minutos atrás",
          status: "completed",
        },
        {
          id: "2",
          type: "deposit",
          title: "Depósito Realizado",
          description: "$1,250.00 depositado por Maria Oliveira",
          time: "15 minutos atrás",
          status: "completed",
        },
        {
          id: "3",
          type: "withdrawal",
          title: "Saque Processado",
          description: "$750.00 sacado por Carlos Pereira",
          time: "1 hora atrás",
          status: "completed",
        },
        {
          id: "4",
          type: "pending_withdrawal",
          title: "Solicitação de Saque",
          description: "$2,500.00 solicitado por Ana Santos",
          time: "2 horas atrás",
          status: "pending",
        },
        {
          id: "5",
          type: "affiliate",
          title: "Novo Afiliado",
          description: "Pedro Almeida se tornou um afiliado",
          time: "3 horas atrás",
          status: "completed",
        },
        {
          id: "6",
          type: "deposit",
          title: "Depósito Realizado",
          description: "$3,000.00 depositado por Luciana Costa",
          time: "5 horas atrás",
          status: "completed",
        },
        {
          id: "7",
          type: "withdrawal",
          title: "Saque Processado",
          description: "$1,800.00 sacado por Roberto Ferreira",
          time: "8 horas atrás",
          status: "completed",
        },
      ])
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "signup":
        return <UserPlus className="h-4 w-4" />
      case "deposit":
        return <DollarSign className="h-4 w-4" />
      case "withdrawal":
        return <CreditCard className="h-4 w-4" />
      case "pending_withdrawal":
        return <AlertCircle className="h-4 w-4" />
      case "affiliate":
        return <Users className="h-4 w-4" />
      case "conversion":
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getIconBackground = (type: Activity["type"]) => {
    switch (type) {
      case "signup":
        return "bg-info/10 text-info"
      case "deposit":
        return "bg-success/10 text-success"
      case "withdrawal":
        return "bg-destructive/10 text-destructive"
      case "pending_withdrawal":
        return "bg-warning/10 text-warning"
      case "affiliate":
        return "bg-accent text-accent-foreground"
      case "conversion":
        return "bg-primary/10 text-primary"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status?: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success"
      case "pending":
        return "bg-warning"
      case "failed":
        return "bg-destructive"
      default:
        return "bg-muted-foreground"
    }
  }

  if (!mounted) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className={`flex items-start gap-4 rounded-lg p-2 transition-all duration-300 hover:bg-muted/50 animate-fade-in-up`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110",
              getIconBackground(activity.type),
            )}
          >
            {getIcon(activity.type)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{activity.title}</p>
              <div className={`h-2 w-2 rounded-full ${getStatusColor(activity.status)}`} />
            </div>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
