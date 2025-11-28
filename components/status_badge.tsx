import { Badge } from "@/components/ui/badge"
import type { CompanyStatus } from "@/lib/types"

type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING"
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

interface StatusBadgeProps {
  status: CompanyStatus | SubscriptionStatus | PaymentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> =
    {
      ACTIVE: { variant: "default", className: "bg-accent text-accent-foreground" },
      TRIAL: { variant: "secondary", className: "bg-chart-3 text-background" },
      EXPIRED: { variant: "destructive" },
      CANCELLED: { variant: "outline" },
      LIFETIME: { variant: "default", className: "bg-primary text-primary-foreground" },
      PENDING: { variant: "secondary" },
      COMPLETED: { variant: "default", className: "bg-accent text-accent-foreground" },
      FAILED: { variant: "destructive" },
      REFUNDED: { variant: "outline" },
    }

  const config = variants[status] || { variant: "outline" as const }

  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  )
}
