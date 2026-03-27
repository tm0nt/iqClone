"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  CreditCard,
  Globe,
  Home,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAccountStore } from "@/store/account-store"

interface DashboardNavProps {
  className?: string
  collapsed?: boolean
}

const navGroups = [
  {
    label: "Visão Geral",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Gestão",
    items: [
      { title: "Estatísticas", href: "/dashboard/statistics", icon: BarChart3 },
      { title: "Ofertas", href: "/dashboard/offers", icon: Globe },
      { title: "Saques", href: "/dashboard/withdrawals", icon: CreditCard },
    ],
  },
  {
    label: "Sistema",
    items: [
      { title: "Configurações", href: "/dashboard/settings", icon: Settings },
    ],
  },
]

export function DashboardNav({ className, collapsed = false }: DashboardNavProps) {
  const pathname = usePathname()

  const { fetchAffiliate } = useAccountStore()
  useEffect(() => {
    fetchAffiliate()
    const interval = setInterval(() => fetchAffiliate(), 30000)
    return () => clearInterval(interval)
  }, [fetchAffiliate])

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href || pathname.endsWith("/dashboard")
      : pathname.includes(href)

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <nav className={cn("flex flex-col gap-1", className)}>
          {navGroups.flatMap((g) => g.items).map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 mx-auto items-center justify-center rounded-lg transition-colors duration-150",
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className="sr-only">{item.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium text-xs">
                {item.title}
              </TooltipContent>
            </Tooltip>
          ))}
        </nav>
      </TooltipProvider>
    )
  }

  return (
    <nav className={cn("flex flex-col gap-4", className)}>
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {item.title}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
