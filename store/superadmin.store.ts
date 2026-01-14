import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import type { Company, CompanyStats, Pagination } from "@/lib/types";

// Store state interface
interface SuperAdminStore {
  // Companies state
  companies: Company[];
  companiesLoading: boolean;
  companiesPagination: Pagination | null;

  // Company stats state
  companyStats: CompanyStats | null;
  statsLoading: boolean;

  // Actions - Companies
  fetchCompanies: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    subscriptionStatus?: string;
  }) => Promise<void>;

  fetchCompanyStats: () => Promise<void>;

  // Reset functions
  resetCompanies: () => void;
  resetStats: () => void;
}

// Initial state
const initialState = {
  companies: [],
  companiesLoading: false,
  companiesPagination: null,
  companyStats: null,
  statsLoading: false,
};

export const useSuperAdminStore = create<SuperAdminStore>((set) => ({
  ...initialState,

  // Fetch companies with pagination
  fetchCompanies: async (params = {}) => {
    set({ companiesLoading: true });

    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);
      if (params.subscriptionStatus)
        queryParams.append("subscriptionStatus", params.subscriptionStatus);

      const queryString = queryParams.toString();
      const url = `/superadmin/companies${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        // Transform backend response to match frontend types
        const companies = response.data.data.map(
          (company: {
            id: number;
            companyName: string;
            companyEmail?: string;
            companyTin?: string;
            companyAddress?: string;
            hasLifetimeAccess: boolean;
            createdAt: string;
            _count?: { employees?: number };
            hr?: { name?: string; email?: string };
            subscription?: {
              id: string;
              status: string;
              plan?: { name?: string };
              startDate?: string;
              endDate?: string;
              trialEndDate?: string;
              createdAt?: string;
            };
          }) => ({
            id: company.id.toString(),
            name: company.companyName,
            email: company.companyEmail || "",
            tin: company.companyTin || "",
            address: company.companyAddress || "",
            status: company.hasLifetimeAccess
              ? "LIFETIME"
              : company.subscription?.status || "PENDING",
            employeeCount: company._count?.employees || 0,
            hrManagerName: company.hr?.name,
            hrManagerEmail: company.hr?.email,
            createdAt: company.createdAt,
            updatedAt: company.createdAt, // Use createdAt if updatedAt not available
            subscription: company.subscription
              ? {
                  id: company.subscription.id,
                  companyId: company.id.toString(),
                  plan: company.subscription.plan?.name || "BASIC",
                  status: company.subscription.status,
                  startDate: company.subscription.startDate || "",
                  endDate: company.subscription.endDate || "",
                  trialEndDate: company.subscription.trialEndDate || "",
                  hasLifetimeAccess: company.hasLifetimeAccess || false,
                  autoRenew: false, // Default value
                  createdAt: company.subscription.createdAt || "",
                  updatedAt: company.subscription.createdAt || "",
                }
              : undefined,
          })
        );

        set({
          companies,
          companiesPagination: response.data.pagination,
          companiesLoading: false,
        });
      } else {
        throw new Error(response.data.message || "Failed to fetch companies");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to fetch companies";

      set({
        companiesLoading: false,
        companies: [],
        companiesPagination: null,
      });

      toast.error(errorMessage);
      console.error("Error fetching companies:", error);
    }
  },

  // Fetch company statistics
  fetchCompanyStats: async () => {
    set({ statsLoading: true });

    try {
      const response = await axiosInstance.get("/superadmin/company-stats");

      if (response.data.success) {
        set({
          companyStats: response.data.data,
          statsLoading: false,
        });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch company statistics"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to fetch company statistics";

      set({
        statsLoading: false,
        companyStats: null,
      });

      toast.error(errorMessage);
      console.error("Error fetching company statistics:", error);
    }
  },

  // Reset functions
  resetCompanies: () => {
    set({
      companies: [],
      companiesLoading: false,
      companiesPagination: null,
    });
  },

  resetStats: () => {
    set({
      companyStats: null,
      statsLoading: false,
    });
  },
}));
