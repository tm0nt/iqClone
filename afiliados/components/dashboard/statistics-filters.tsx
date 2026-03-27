"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function StatisticsFilters() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center bg-white">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 md:flex md:flex-1 md:items-center md:gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="group-by" className="text-xs font-medium">
            Agrupar por
          </label>
          <Select defaultValue="day">
            <SelectTrigger id="group-by" className="h-9">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-xs font-medium">
            País
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="country" className="h-9">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Países</SelectItem>
              <SelectItem value="br">Brasil</SelectItem>
              <SelectItem value="us">Estados Unidos</SelectItem>
              <SelectItem value="ca">Canadá</SelectItem>
              <SelectItem value="mx">México</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="platform" className="text-xs font-medium">
            Plataforma
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="platform" className="h-9">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Plataformas</SelectItem>
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="ios">iOS</SelectItem>
              <SelectItem value="android">Android</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="afftrack" className="text-xs font-medium">
            Afftrack
          </label>
          <Select defaultValue="all">
            <SelectTrigger id="afftrack" className="h-9">
              <SelectValue placeholder="Selecionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Afftracks</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="ml-auto h-9">
          Limpar
        </Button>
        <Button size="sm" className="h-9">
          Aplicar Filtros
        </Button>
      </div>
    </div>
  )
}
