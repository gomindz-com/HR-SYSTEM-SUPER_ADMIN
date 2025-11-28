import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "teal" | "amber" | "rose" | "emerald" | "violet"
}

export function MetricCard({ title, value, icon: Icon, description, trend, color = "blue" }: MetricCardProps) {
  const colorClasses = {
    blue: "bg-primary text-primary-foreground",
    teal: "bg-accent text-accent-foreground",
    amber: "bg-chart-3 text-white",
    rose: "bg-chart-4 text-white",
    emerald: "bg-chart-2 text-white",
    violet: "bg-chart-5 text-white",
  }

  return (
    <Card className="border-border/50 hover:shadow-lg transition-all shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-3xl font-bold text-foreground">{value}</div>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      {(description || trend) && (
        <CardContent className="pt-0">
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.isPositive ? "text-accent" : "text-destructive"}`}>
              {trend.isPositive ? "+" : ""}
              {trend.value}% from last month
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
