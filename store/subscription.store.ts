import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";
import type { Pagination } from "@/lib/types";

// Types for subscription management
export interface SubscriptionListItem {
  id: string;
  companyId: number;
  planId: string;
  status: "TRIAL" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate: string | null;
  endDate: string | null;
  trialEndDate: string | null;
  createdAt: string;
  company: {
    id: number;
    companyName: string;
    companyEmail: string | null;
    companyTin: string | null;
    hasLifetimeAccess: boolean;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    maxEmployees: number | null;
    features: string[];
  };
}

export interface LifetimeCompany {
  id: number;
  companyName: string;
  companyEmail: string | null;
  companyTin: string | null;
  companyAddress: string | null;
  hasLifetimeAccess: boolean;
  createdAt: string;
  _count: {
    employees: number;
  };
  hr: {
    name: string;
    email: string;
  } | null;
}

export interface UpdateSubscriptionData {
  status?: "TRIAL" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  startDate?: string | null;
  endDate?: string | null;
  trialEndDate?: string | null;
  planId?: string;
}

// Store state interface
interface SubscriptionStore {
  // Lifetime companies state
  lifetimeCompanies: LifetimeCompany[];
  lifetimeCompaniesLoading: boolean;
  lifetimeCompaniesPagination: Pagination | null;

  // Subscriptions state
  subscriptions: SubscriptionListItem[];
  subscriptionsLoading: boolean;
  subscriptionsPagination: Pagination | null;

  // Actions - Lifetime Access
  grantLifetimeAccess: (companyId: number | string) => Promise<void>;
  revokeLifetimeAccess: (companyId: number | string) => Promise<void>;
  fetchLifetimeCompanies: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;

  // Actions - Subscriptions
  fetchSubscriptions: (params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    planId?: string;
    planName?: string;
    companyId?: number | string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
  updateSubscription: (
    subscriptionId: string,
    data: UpdateSubscriptionData
  ) => Promise<SubscriptionListItem>;

  // Reset functions
  resetLifetimeCompanies: () => void;
  resetSubscriptions: () => void;
}

// Initial state
const initialState = {
  lifetimeCompanies: [],
  lifetimeCompaniesLoading: false,
  lifetimeCompaniesPagination: null,
  subscriptions: [],
  subscriptionsLoading: false,
  subscriptionsPagination: null,
};

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  ...initialState,

  // Grant lifetime access to a company
  grantLifetimeAccess: async (companyId) => {
    try {
      const response = await axiosInstance.post(
        `/superadmin/company/${companyId}/lifetime-access/grant`
      );

      if (response.data.success) {
        toast.success(response.data.message || "Lifetime access granted successfully");      
        return;
      } else {
        throw new Error(response.data.message || "Failed to grant lifetime access");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to grant lifetime access";

      toast.error(errorMessage);
      console.error("Error granting lifetime access:", error);
      throw error;
    }
  },

  // Revoke lifetime access from a company
  revokeLifetimeAccess: async (companyId) => {
    try {
      const response = await axiosInstance.post(
        `/superadmin/company/${companyId}/lifetime-access/revoke`
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Lifetime access revoked successfully"
        );
        // Optionally refresh subscriptions list
        return;
      } else {
        throw new Error(response.data.message || "Failed to revoke lifetime access");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to revoke lifetime access";

      toast.error(errorMessage);
      console.error("Error revoking lifetime access:", error);
      throw error;
    }
  },

  // Fetch companies with lifetime access
  fetchLifetimeCompanies: async (params = {}) => {
    set({ lifetimeCompaniesLoading: true });

    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);

      const queryString = queryParams.toString();
      const url = `/superadmin/companies/lifetime${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        set({
          lifetimeCompanies: response.data.data,
          lifetimeCompaniesPagination: response.data.pagination,
          lifetimeCompaniesLoading: false,
        });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch lifetime companies"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to fetch lifetime companies";

      set({
        lifetimeCompaniesLoading: false,
        lifetimeCompanies: [],
        lifetimeCompaniesPagination: null,
      });

      toast.error(errorMessage);
      console.error("Error fetching lifetime companies:", error);
    }
  },

  // Fetch subscriptions with filters
  fetchSubscriptions: async (params = {}) => {
    set({ subscriptionsLoading: true });

    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page.toString());
      if (params.pageSize)
        queryParams.append("pageSize", params.pageSize.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.planId) queryParams.append("planId", params.planId);
      if (params.planName) queryParams.append("planName", params.planName);
      if (params.companyId)
        queryParams.append("companyId", params.companyId.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
      if (params.dateTo) queryParams.append("dateTo", params.dateTo);

      const queryString = queryParams.toString();
      const url = `/superadmin/subscriptions${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get(url);

      if (response.data.success) {
        set({
          subscriptions: response.data.data,
          subscriptionsPagination: response.data.pagination,
          subscriptionsLoading: false,
        });
      } else {
        throw new Error(
          response.data.message || "Failed to fetch subscriptions"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to fetch subscriptions";

      set({
        subscriptionsLoading: false,
        subscriptions: [],
        subscriptionsPagination: null,
      });

      toast.error(errorMessage);
      console.error("Error fetching subscriptions:", error);
    }
  },

  // Update subscription
  updateSubscription: async (subscriptionId, data) => {
    try {
      const response = await axiosInstance.patch(
        `/superadmin/subscription/${subscriptionId}`,
        data
      );

      if (response.data.success) {
        toast.success(
          response.data.message || "Subscription updated successfully"
        );

        // Update the subscription in the local state if it exists
        set((state) => ({
          subscriptions: state.subscriptions.map((sub) =>
            sub.id === subscriptionId ? response.data.data : sub
          ),
        }));

        return response.data.data;
      } else {
        throw new Error(
          response.data.message || "Failed to update subscription"
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to update subscription";

      toast.error(errorMessage);
      console.error("Error updating subscription:", error);
      throw error;
    }
  },

  // Reset functions
  resetLifetimeCompanies: () => {
    set({
      lifetimeCompanies: [],
      lifetimeCompaniesLoading: false,
      lifetimeCompaniesPagination: null,
    });
  },

  resetSubscriptions: () => {
    set({
      subscriptions: [],
      subscriptionsLoading: false,
      subscriptionsPagination: null,
    });
  },
}));
