"use client"

import { useEffect, useState, useRef } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ReferenceLine,
} from "@/components/ui/chart"
import { formatUsd } from "@shared/platform/branding"

// Definir a interface localmente em vez de importar
interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip rounded-lg border border-border/50 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <p className="mb-2 font-medium text-black">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 text-sm text-black">
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

export function Overview() {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)

    // Simular animação de entrada dos dados
    const timer = setTimeout(() => {
      if (chartRef.current) {
        const paths = chartRef.current.querySelectorAll("path.recharts-curve")
        paths.forEach((path, index) => {
          path.classList.add("animate-path")
          ;(path as HTMLElement).style.animationDelay = `${index * 300}ms`
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Dados simulados com receita 0
  const data = [
    {
      name: "Abr/2025",
      receita: 0,
      usuarios: 2,
    },
  ]

  const handleMouseMove = (data: any) => {
    if (data && data.activeTooltipIndex) {
      setActiveIndex(data.activeTooltipIndex)
    }
  }

  const handleMouseLeave = () => {
    setActiveIndex(null)
  }

  return (
    <div ref={chartRef} className={`transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-sm font-medium text-black">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-500 to-teal-400" />
            <span className="text-sm font-medium text-black">Usuários</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            left: 0,
            bottom: 0,
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.7} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(167, 139, 250)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="rgb(167, 139, 250)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(value) =>
              formatUsd(value, "en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
            }
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={3500}
            stroke="rgba(0,0,0,0.2)"
            strokeDasharray="3 3"
            label={{
              value: "Meta",
              position: "right",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="receita"
            name="Receita"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorReceita)"
            activeDot={{
              r: activeIndex !== null ? 6 : 0,
              stroke: "hsl(var(--primary))",
              strokeWidth: 2,
              fill: "white",
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
            }}
          />
          <Area
            type="monotone"
            dataKey="usuarios"
            name="Usuários"
            stroke="rgb(167, 139, 250)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsuarios)"
            activeDot={{
              r: activeIndex !== null ? 6 : 0,
              stroke: "rgb(167, 139, 250)",
              strokeWidth: 2,
              fill: "white",
              filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
