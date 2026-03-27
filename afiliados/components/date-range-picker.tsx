"use client"

import * as React from "react"
import { format, subDays, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import "react-day-picker/dist/style.css"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  initialDateFrom?: Date
  initialDateTo?: Date
  onStartDateChange?: (startDate: string) => void
  onEndDateChange?: (endDate: string) => void
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: initialDateFrom ?? new Date(),
    to: initialDateTo ?? new Date(),
  })
  const [hoverDate, setHoverDate] = React.useState<Date | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  function handleSelect(range: DateRange | undefined) {
    setDate(range)
    setSelectedPreset(null)
    if (range?.from && range?.to) {
      if (onStartDateChange) {
        onStartDateChange(format(range.from, "yyyy-MM-dd"))
      }
      if (onEndDateChange) {
        onEndDateChange(format(range.to, "yyyy-MM-dd"))
      }
    }
  }

  function setQuickRange(label: string, days: number) {
    const today = new Date()
    const from = subDays(today, days - 1)
    const newRange = { from, to: today }
    setDate(newRange)
    setSelectedPreset(label)
    if (onStartDateChange) {
      onStartDateChange(format(newRange.from, "yyyy-MM-dd"))
    }
    if (onEndDateChange) {
      onEndDateChange(format(newRange.to, "yyyy-MM-dd"))
    }
  }

  function setQuickMonths(label: string, months: number) {
    const today = new Date()
    const from = subMonths(today, months)
    const newRange = { from, to: today }
    setDate(newRange)
    setSelectedPreset(label)
    if (onStartDateChange) {
      onStartDateChange(format(newRange.from, "yyyy-MM-dd"))
    }
    if (onEndDateChange) {
      onEndDateChange(format(newRange.to, "yyyy-MM-dd"))
    }
  }

  function setToday() {
    const today = new Date()
    const todayRange = { from: today, to: today }
    setDate(todayRange)
    setSelectedPreset("Hoje")
    if (onStartDateChange) {
      onStartDateChange(format(todayRange.from, "yyyy-MM-dd"))
    }
    if (onEndDateChange) {
      onEndDateChange(format(todayRange.to, "yyyy-MM-dd"))
    }
  }

  const quickPresets = [
    { label: "Hoje", action: setToday },
    { label: "7 dias", action: () => setQuickRange("7 dias", 7) },
    { label: "15 dias", action: () => setQuickRange("15 dias", 15) },
    { label: "30 dias", action: () => setQuickRange("30 dias", 30) },
    { label: "3 meses", action: () => setQuickMonths("3 meses", 3) },
    { label: "6 meses", action: () => setQuickMonths("6 meses", 6) },
    { label: "1 ano", action: () => setQuickMonths("1 ano", 12) },
  ]

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "h-10 w-full max-w-[260px] justify-start rounded-lg text-left font-medium shadow-md transition hover:shadow-lg",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {date?.from ? (
              date.to ? (
                <span className="truncate">
                  {format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })} - {format(date.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                </span>
              ) : (
                <span className="truncate">
                  {format(date.from, "dd 'de' MMM, yyyy", { locale: ptBR })}
                </span>
              )
            ) : (
              <span className="text-muted-foreground">Selecione um intervalo</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-4 rounded-2xl shadow-2xl bg-white dark:bg-muted max-w-[90vw]" align="start">
          {/* Botões rápidos */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {quickPresets.map(({ label, action }) => (
              <Button
                key={label}
                variant={selectedPreset === label ? "default" : "outline"}
                size="sm"
                className="flex-1 min-w-[80px]"
                onClick={() => {
                  action()
                  setOpen(false) // fecha o popover após selecionar
                }}
              >
                {label}
              </Button>
            ))}
          </div>

          {/* Calendário */}
          <DayPicker
            mode="range"
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={date?.to ?? new Date()}
            locale={ptBR}
            footer={undefined}
            showOutsideDays
            onDayMouseEnter={(day) => {
              if (date?.from && !date?.to) {
                setHoverDate(day)
              }
            }}
            onDayMouseLeave={() => setHoverDate(undefined)}
            modifiers={{
              hoverRange: date?.from && hoverDate ? { from: date.from, to: hoverDate } : undefined,
            }}
            modifiersClassNames={{
              hoverRange: "bg-primary/10 rounded-lg",
              selected: "bg-primary text-white",
            }}
            className="flex flex-col md:flex-row gap-4"
            classNames={{
              months: "flex flex-col md:flex-row gap-4",
              month: "w-full space-y-4",
              caption: "flex justify-between items-center p-2",
              caption_label: "text-sm font-bold capitalize",
              nav: "flex gap-1",
              nav_button: "h-8 w-8 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition",
              table: "w-full border-separate border-spacing-1",
              row: "flex",
              cell: "relative w-9 h-9 p-0 text-center text-sm rounded-lg hover:bg-muted-foreground/10 transition",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
              day_today: "border-2 border-primary font-bold",
              day_outside: "opacity-30",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
