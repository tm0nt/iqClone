"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "@/components/ui/chart"
import { formatUsd } from "@shared/platform/branding"

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip rounded-lg border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-2 font-medium">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-medium">{entry.name}: </span>
            <span className="text-muted-foreground">
              {formatUsd(entry.value)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function PaymentsChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    {
      name: "Jan",
      recebido: 1250.0,
      pendente: 0,
    },
    {
      name: "Fev",
      recebido: 1850.5,
      pendente: 0,
    },
    {
      name: "Mar",
      recebido: 4550.0,
      pendente: 0,
    },
    {
      name: "Abr",
      recebido: 2230.5,
      pendente: 0,
    },
    {
      name: "Mai",
      recebido: 0,
      pendente: 4000.0,
    },
    {
      name: "Jun",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Jul",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Ago",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Set",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Out",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Nov",
      recebido: 0,
      pendente: 0,
    },
    {
      name: "Dez",
      recebido: 0,
      pendente: 0,
    },
  ]

  return (
    <div className={`transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary/80" />
            <span className="text-sm font-medium">Recebido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-warning" />
            <span className="text-sm font-medium">Pendente</span>
          </div>
        </div>
        <div className="mt-2 sm:mt-0">
          <select className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 0,
          }}
        >
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
          <Bar dataKey="recebido" name="Recebido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
          <Bar dataKey="pendente" name="Pendente" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
