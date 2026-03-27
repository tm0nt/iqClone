"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { formatUsd } from "@shared/platform/branding"

interface TooltipProps {
  active?: boolean
  payload?: Array<{ color?: string; name?: string; value?: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
      <p className="mb-2 font-medium">{label}</p>
      {payload.map((entry, index) => (
        <div key={`${entry.name}-${index}`} className="flex items-center gap-2 text-sm">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="font-medium">{entry.name}: </span>
          <span className="text-muted-foreground">{formatUsd(entry.value ?? 0)}</span>
        </div>
      ))}
    </div>
  )
}

export function AffiliatesChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    { name: "Jan", receita: 1200, afiliados: 4 },
    { name: "Fev", receita: 2100, afiliados: 7 },
    { name: "Mar", receita: 1900, afiliados: 6 },
    { name: "Abr", receita: 2800, afiliados: 9 },
    { name: "Mai", receita: 3300, afiliados: 11 },
    { name: "Jun", receita: 2500, afiliados: 8 },
  ]

  return (
    <div className={`transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dx={-10}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
