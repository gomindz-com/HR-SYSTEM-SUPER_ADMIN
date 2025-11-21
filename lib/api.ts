import type {
  Company,
  Subscription,
  Payment,
  DashboardMetrics,
  ApiResponse,
  PaginatedResponse,
  CompanyStatus,
  SubscriptionStatus,
} from "./types"

// Base API URL - replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api"

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        // Add authentication headers here if needed
        // 'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "An error occurred",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

// Dashboard APIs
export async function getDashboardMetrics(): Promise<ApiResponse<DashboardMetrics>> {
  return fetchApi<DashboardMetrics>("/admin/dashboard/metrics")
}

// Company APIs
export async function getCompanies(params?: {
  page?: number
  pageSize?: number
  search?: string
  status?: CompanyStatus
}): Promise<ApiResponse<PaginatedResponse<Company>>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString())
  if (params?.search) queryParams.append("search", params.search)
  if (params?.status) queryParams.append("status", params.status)

  return fetchApi<PaginatedResponse<Company>>(`/admin/companies?${queryParams.toString()}`)
}

export async function getCompanyById(id: string): Promise<ApiResponse<Company>> {
  return fetchApi<Company>(`/admin/companies/${id}`)
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<ApiResponse<Company>> {
  return fetchApi<Company>(`/admin/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// Subscription APIs
export async function getSubscriptions(params?: {
  page?: number
  pageSize?: number
  status?: SubscriptionStatus
  companyId?: string
}): Promise<ApiResponse<PaginatedResponse<Subscription>>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString())
  if (params?.status) queryParams.append("status", params.status)
  if (params?.companyId) queryParams.append("companyId", params.companyId)

  return fetchApi<PaginatedResponse<Subscription>>(`/admin/subscriptions?${queryParams.toString()}`)
}

export async function updateSubscription(id: string, data: Partial<Subscription>): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function grantLifetimeAccess(subscriptionId: string): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${subscriptionId}/lifetime`, {
    method: "POST",
  })
}

export async function revokeLifetimeAccess(subscriptionId: string): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${subscriptionId}/lifetime`, {
    method: "DELETE",
  })
}

export async function extendTrial(subscriptionId: string, days: number): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${subscriptionId}/extend-trial`, {
    method: "POST",
    body: JSON.stringify({ days }),
  })
}

export async function activateSubscription(subscriptionId: string): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${subscriptionId}/activate`, {
    method: "POST",
  })
}

export async function revokeAccess(subscriptionId: string): Promise<ApiResponse<Subscription>> {
  return fetchApi<Subscription>(`/admin/subscriptions/${subscriptionId}/revoke`, {
    method: "POST",
  })
}

// Payment APIs
export async function getPayments(params?: {
  page?: number
  pageSize?: number
  companyId?: string
}): Promise<ApiResponse<PaginatedResponse<Payment>>> {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append("page", params.page.toString())
  if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString())
  if (params?.companyId) queryParams.append("companyId", params.companyId)

  return fetchApi<PaginatedResponse<Payment>>(`/admin/payments?${queryParams.toString()}`)
}
