"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { DateRangePicker } from "@/components/date-range-picker"
import { useAffiliateUserMetricsChart } from "@/hooks/use-affiliate-user-metrics-chart"

export function UserMetricsChart() {
  const { data, endDate, loading, setEndDate, setStartDate, startDate } =
    useAffiliateUserMetricsChart()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Usuários</CardTitle>
        <CardDescription>Acompanhe o crescimento e engajamento dos usuários ao longo do tempo.</CardDescription>
      </CardHeader>
      <CardContent>
        <DateRangePicker
          initialDateFrom={startDate ? new Date(startDate) : undefined}
          initialDateTo={endDate ? new Date(endDate) : undefined}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
        <div className="h-[350px]">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "5px", border: "1px solid #ddd" }} />
                <Legend verticalAlign="top" height={36} />
                
                <Line
                  type="monotone"
                  dataKey="Novos Usuários"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Usuários Ativos"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Churn"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
