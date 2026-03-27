"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useTheme } from "next-themes"
import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()
  const { theme } = useTheme()

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-success" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "info":
        return <Info className="h-5 w-5 text-info" />
      default:
        return null
    }
  }

  return (
      <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const icon = getIcon(props.variant ?? undefined)

        return (
          <Toast key={id} {...props} className="group toast-animation">
            <div className="flex gap-3">
              {icon && <div className="toast-icon-animation flex h-6 w-6 items-center justify-center">{icon}</div>}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
