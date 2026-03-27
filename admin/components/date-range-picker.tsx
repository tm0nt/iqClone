import * as React from "react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ dateRange, onDateRangeChange, className }: DateRangePickerProps) {
  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      // Se apenas from estiver definido, considera como um intervalo de um dia
      const finalRange = range.to ? range : { from: range.from, to: range.from };
      onDateRangeChange(finalRange);
    }
  };

  const setQuickRange = (days: number) => {
    const today = new Date();
    const from = subDays(today, days - 1);
    onDateRangeChange({ from, to: today });
  };

  const setMonthRange = (months: number) => {
    const today = new Date();
    const from = subMonths(today, months);
    onDateRangeChange({ from, to: today });
  };

  const setYearRange = (years: number) => {
    const today = new Date();
    const from = subYears(today, years);
    onDateRangeChange({ from, to: today });
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(1)}
          className="text-xs"
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(7)}
          className="text-xs"
        >
          7 dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setQuickRange(30)}
          className="text-xs"
        >
          30 dias
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMonthRange(3)}
          className="text-xs"
        >
          3 meses
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMonthRange(6)}
          className="text-xs"
        >
          6 meses
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setYearRange(1)}
          className="text-xs"
        >
          1 ano
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })} -{" "}
                  {format(dateRange.to, "dd 'de' MMM, yyyy", { locale: ptBR })}
                </>
              ) : (
                format(dateRange.from, "dd 'de' MMM, yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um intervalo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <DayPicker
            mode="range"
            selected={dateRange}
            onSelect={handleSelect}
            locale={ptBR}
            numberOfMonths={2}
            classNames={{
              root: "p-3",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}