"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ageData = [
  { name: "18-24", value: 15 },
  { name: "25-34", value: 35 },
  { name: "35-44", value: 25 },
  { name: "45-54", value: 15 },
  { name: "55+", value: 10 },
]

const locationData = [
  { name: "Sudeste", value: 45 },
  { name: "Nordeste", value: 20 },
  { name: "Sul", value: 18 },
  { name: "Centro-Oeste", value: 12 },
  { name: "Norte", value: 5 },
]

const deviceData = [
  { name: "Mobile", value: 65 },
  { name: "Desktop", value: 30 },
  { name: "Tablet", value: 5 },
]

const COLORS = [
  "hsl(var(--primary))",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(47, 95%, 55%)",
  "hsl(346, 87%, 60%)",
]

export function UserSegmentation() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Segmentação de Usuários</CardTitle>
        <CardDescription>Análise demográfica e comportamental dos usuários.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="age" className="space-y-4">
          <TabsList>
            <TabsTrigger value="age">Faixa Etária</TabsTrigger>
            <TabsTrigger value="location">Localização</TabsTrigger>
            <TabsTrigger value="device">Dispositivos</TabsTrigger>
          </TabsList>
          <TabsContent value="age">
            <SegmentationChart data={ageData} title="Distribuição por Faixa Etária" />
          </TabsContent>
          <TabsContent value="location">
            <SegmentationChart data={locationData} title="Distribuição por Região" />
          </TabsContent>
          <TabsContent value="device">
            <SegmentationChart data={deviceData} title="Distribuição por Dispositivo" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function SegmentationChart({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartContainer className="h-[300px]">
          <Chart>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={500}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltipContent>
                          <div className="grid gap-2">
                            <div className="flex items-center gap-1">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: COLORS[payload[0].payload.index % COLORS.length] }}
                              ></div>
                              <span className="text-sm font-medium">
                                {payload[0].name}: {payload[0].value}%
                              </span>
                            </div>
                          </div>
                        </ChartTooltipContent>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Chart>
        </ChartContainer>
        <div className="flex flex-col justify-center space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
