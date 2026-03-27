import type * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Legend,
  ReferenceLine,
  Cell,
  Pie,
  PieChart,
} from "recharts"
import { cn } from "@/lib/utils"

// Export recharts components
export {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Legend,
  ReferenceLine,
  Cell,
  Pie,
  PieChart,
}

// Custom chart components
interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Chart({ className, ...props }: ChartProps) {
  return <div className={cn("", className)} {...props} />
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartContainer({ className, ...props }: ChartContainerProps) {
  return <div className={cn("w-full", className)} {...props} />
}

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {
  className?: string
  children?: React.ComponentProps<typeof Tooltip>["content"]
}

export function ChartTooltip({ className, children, ...props }: ChartTooltipProps) {
  return <Tooltip content={children ?? props.content} {...props} />
}

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ChartTooltipContent({ className, ...props }: ChartTooltipContentProps) {
  return <div className={cn("rounded-lg border bg-background p-2 shadow-md", className)} {...props} />
}
