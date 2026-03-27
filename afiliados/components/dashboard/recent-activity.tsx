"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock, DollarSign, UserPlus, Users } from "lucide-react"
import { cn } from "@/lib/utils"

type Activity = {
  id: string
  type: "signup" | "payment" | "affiliate" | "conversion"
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
          title: "Novo Registro de Usuário",
          description: "João Silva se cadastrou",
          time: "2 minutos atrás",
          status: "completed",
        },
        {
          id: "2",
          type: "payment",
          title: "Pagamento Recebido",
          description: "$250.00 da Campanha #1234",
          time: "1 hora atrás",
          status: "completed",
        },
        {
          id: "3",
          type: "affiliate",
          title: "Novo Afiliado",
          description: "Sara Oliveira entrou no seu programa",
          time: "3 horas atrás",
          status: "completed",
        },
        {
          id: "4",
          type: "conversion",
          title: "Conversão Rastreada",
          description: "5 novas conversões da Campanha #5678",
          time: "5 horas atrás",
          status: "completed",
        },
        {
          id: "5",
          type: "payment",
          title: "Processamento de Pagamento",
          description: "$1,200.00 de pagamento para afiliados",
          time: "1 dia atrás",
          status: "pending",
        },
      ])
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "signup":
        return <UserPlus className="h-4 w-4" />
      case "payment":
        return <DollarSign className="h-4 w-4" />
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
        return "bg-blue-100 text-blue-600"
      case "payment":
        return "bg-green-100 text-green-600"
      case "affiliate":
        return "bg-purple-100 text-purple-600"
      case "conversion":
        return "bg-amber-100 text-amber-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusColor = (status?: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-amber-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
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
