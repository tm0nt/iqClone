"use client"

import { useEffect, useState } from "react"
import { CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "@/components/ui/chart"
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
              {entry.name === "Receita"
                ? formatUsd(entry.value, "en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })
                : entry.value.toLocaleString("en-US")}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export function CampaignPerformanceChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const data = [
    {
      name: "Jan",
      cliques: 2400,
      conversoes: 240,
      receita: 12000,
    },
    {
      name: "Fev",
      cliques: 1398,
      conversoes: 210,
      receita: 10500,
    },
    {
      name: "Mar",
      cliques: 9800,
      conversoes: 290,
      receita: 14500,
    },
    {
      name: "Abr",
      cliques: 3908,
      conversoes: 300,
      receita: 15000,
    },
    {
      name: "Mai",
      cliques: 4800,
      conversoes: 320,
      receita: 16000,
    },
    {
      name: "Jun",
      cliques: 3800,
      conversoes: 270,
      receita: 13500,
    },
    {
      name: "Jul",
      cliques: 4300,
      conversoes: 380,
      receita: 19000,
    },
    {
      name: "Ago",
      cliques: 4100,
      conversoes: 390,
      receita: 19500,
    },
    {
      name: "Set",
      cliques: 4500,
      conversoes: 430,
      receita: 21500,
    },
    {
      name: "Out",
      cliques: 5200,
      conversoes: 500,
      receita: 25000,
    },
    {
      name: "Nov",
      cliques: 5500,
      conversoes: 520,
      receita: 26000,
    },
    {
      name: "Dez",
      cliques: 5700,
      conversoes: 570,
      receita: 28500,
    },
  ]

  return (
    <div className={`transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-400" />
            <span className="text-sm font-medium">Cliques</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-violet-400" />
            <span className="text-sm font-medium">Conversões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary/80" />
            <span className="text-sm font-medium">Receita</span>
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
        <LineChart
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
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="cliques"
            name="Cliques"
            stroke="#60A5FA"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{
              r: 6,
              stroke: "#60A5FA",
              strokeWidth: 2,
              fill: "white",
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
            }}
          />
          <Line
            type="monotone"
            dataKey="conversoes"
            name="Conversões"
            stroke="rgb(167, 139, 250)"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{
              r: 6,
              stroke: "rgb(167, 139, 250)",
              strokeWidth: 2,
              fill: "white",
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
            }}
          />
          <Line
            type="monotone"
            dataKey="receita"
            name="Receita"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{
              r: 6,
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
              fill: "white",
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
