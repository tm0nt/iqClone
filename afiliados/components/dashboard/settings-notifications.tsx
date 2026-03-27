"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

interface NotificationSetting {
  id: string
  title: string
  description: string
  enabled: boolean
}

export function SettingsNotifications() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "email-marketing",
      title: "Campanhas de Marketing",
      description: "Receba atualizações sobre novas campanhas e oportunidades.",
      enabled: true,
    },
    {
      id: "email-payments",
      title: "Pagamentos",
      description: "Receba notificações sobre pagamentos e faturas.",
      enabled: true,
    },
    {
      id: "email-offers",
      title: "Novas Ofertas",
      description: "Seja notificado quando novas ofertas forem adicionadas.",
      enabled: false,
    },
    {
      id: "email-security",
      title: "Alertas de Segurança",
      description: "Receba alertas importantes sobre a segurança da sua conta.",
      enabled: true,
    },
    {
      id: "push-notifications",
      title: "Notificações Push",
      description: "Receba notificações push no seu dispositivo.",
      enabled: false,
    },
    {
      id: "sms-notifications",
      title: "Notificações SMS",
      description: "Receba notificações por SMS para eventos importantes.",
      enabled: false,
    },
  ])

  function toggleNotification(id: string) {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, enabled: !notification.enabled } : notification,
      ),
    )
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "Preferências atualizadas",
        description: "Suas preferências de notificação foram atualizadas com sucesso.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="space-y-6">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start space-x-4">
            <Switch
              id={notification.id}
              checked={notification.enabled}
              onCheckedChange={() => toggleNotification(notification.id)}
            />
            <div className="space-y-1">
              <label
                htmlFor={notification.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {notification.title}
              </label>
              <p className="text-sm text-muted-foreground">{notification.description}</p>
            </div>
          </div>
        ))}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar preferências"}
      </Button>
    </form>
  )
}
