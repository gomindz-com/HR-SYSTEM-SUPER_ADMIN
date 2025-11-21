// ==================== TYPES FOR SUPERADMIN CONTROLLERS ====================
// Company types
export type CompanyStatus = "ACTIVE" | "TRIAL" | "EXPIRED" | "CANCELLED" | "LIFETIME";

export interface Company {
  id: string;
  name: string;
  email: string;
  tin: string;
  address?: string;
  status: CompanyStatus;
  employeeCount: number;
  hrManagerName?: string;
  hrManagerEmail?: string;
  createdAt: string;
  updatedAt: string;
  subscription?: Subscription;
}

// Subscription (for Company interface)
export interface Subscription {
  id: string;
  companyId: string;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  trialEndDate?: string;
  hasLifetimeAccess: boolean;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

// Company Stats interface matching backend response
export interface CompanyStats {
  totalCompanies: number;
  companiesWithActiveSubscription: number;
  companiesWithTrialSubscription: number;
  companiesWithExpiredSubscription: number;
  companiesWithLifetimeAccess: number;
  companiesWithPendingSubscription: number;
}

// Pagination interface
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
