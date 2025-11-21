// Company types
export type CompanyStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED" | "LIFETIME"

export interface Company {
  id: string
  name: string
  email: string
  tin: string
  address?: string
  status: CompanyStatus
  employeeCount: number
  hrManagerName?: string
  hrManagerEmail?: string
  createdAt: string
  updatedAt: string
  subscription?: Subscription
}

// Subscription types
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED"
export type SubscriptionPlan = "BASIC" | "PROFESSIONAL" | "ENTERPRISE"

export interface Subscription {
  id: string
  companyId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate: string
  trialEndDate?: string
  hasLifetimeAccess: boolean
  autoRenew: boolean
  createdAt: string
  updatedAt: string
}

// Payment types
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"

export interface Payment {
  id: string
  companyId: string
  subscriptionId: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentDate: string
  paymentMethod?: string
  transactionId?: string
}

// Dashboard metrics
export interface DashboardMetrics {
  totalCompanies: number
  activeSubscriptions: number
  trialCompanies: number
  expiredSubscriptions: number
  lifetimeAccessCompanies: number
  totalRevenue: number
  monthlyRevenue: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
