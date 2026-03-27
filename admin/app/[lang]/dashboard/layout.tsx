"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-background">
      {/* Floating sidebar — fixed, outside the normal flow */}
      <DashboardSidebar />

      {/* Main content — shifts right via CSS variable set by the sidebar */}
      <div
        className="flex h-full min-w-0 flex-col transition-[margin-left] duration-300 ease-in-out"
        style={{ marginLeft: "var(--sidebar-w, 268px)" }}
      >
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-screen-2xl px-4 py-6 md:px-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
