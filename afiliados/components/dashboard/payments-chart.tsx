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
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)

    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await fetch("/api/account/withdraw/metrics");
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error("Erro ao buscar dados para o gráfico", error);
      }
    };

    fetchData();
  }, [])

  return (
    <div className={`transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary/80" />
            <span className="text-sm font-medium">Recebido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="text-sm font-medium">Pendente</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 30,
            right: 30,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dy={10}
            tickFormatter={(value) => {
              const months = [
                "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
                "Jul", "Ago", "Set", "Out", "Nov", "Dez"
              ]
              return months[parseInt(value) - 1]
            }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            dx={-10}
            tickFormatter={(value) => formatUsd(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="recebido"
            name="Recebido"
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            barSize={30}
            animationDuration={1000}
          />
          <Bar
            dataKey="pendente"
            name="Pendente"
            fill="#FBBF24"
            radius={[4, 4, 0, 0]}
            barSize={30}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
