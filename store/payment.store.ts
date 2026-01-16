import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// Types based on the controller response
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface Company {
  id: number;
  companyName: string;
  companyEmail: string | null;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
}

export interface Subscription {
  id: string;
  status: string;
  plan: Plan;
}

export interface Payment {
  id: string;
  companyId: number;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  modemPayReference: string | null;
  paidAt: string | null;
  createdAt: string;
  company: Company;
  subscription: Subscription;
}

export interface PaymentDetail {
  id: string;
  companyId: number;
  subscriptionId: string;
  amount: number;
  status: PaymentStatus;
  modemPayReference: string | null;
  paidAt: string | null;
  createdAt: string;
  company: {
    id: number;
    companyName: string;
    companyEmail: string | null;
    companyTin: string | null;
    companyAddress: string | null;
    hasLifetimeAccess: boolean;
  };
  subscription: {
    id: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
    trialEndDate: string | null;
    plan: {
      id: string;
      name: string;
      price: number;
      maxEmployees: number | null;
      features: string[];
    };
  };
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaymentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  companyId?: number;
}

interface PaymentStore {
  // State
  payments: Payment[];
  paymentDetail: PaymentDetail | null;
  pagination: Pagination | null;
  loading: boolean;
  detailLoading: boolean;

  // Actions
  fetchPayments: (filters?: PaymentFilters) => Promise<void>;
  fetchPaymentDetail: (paymentId: string) => Promise<PaymentDetail>;
  resetPaymentDetail: () => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  // State
  payments: [],
  paymentDetail: null,
  pagination: null,
  loading: false,
  detailLoading: false,

  // Actions
  fetchPayments: async (filters = {}) => {
    set({ loading: true });

    try {
      // Build query params
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.pageSize)
        params.append("pageSize", filters.pageSize.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.status) params.append("status", filters.status);
      if (filters.companyId)
        params.append("companyId", filters.companyId.toString());

      const queryString = params.toString();
      const url = `/superadmin/payments${queryString ? `?${queryString}` : ""}`;

      const response = await axiosInstance.get<{
        success: boolean;
        data: Payment[];
        pagination: Pagination;
      }>(url);

      if (!response.data.success) {
        throw new Error("Failed to fetch payments");
      }

      set({
        payments: response.data.data as Payment[],
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch payments";
      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const data = error.response.data;
          if (
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof data.message === "string"
          ) {
            errorMessage = data.message;
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      set({
        loading: false,
        payments: [],
        pagination: null,
      });
      throw error;
    }
  },

  fetchPaymentDetail: async (paymentId) => {
    set({ detailLoading: true });

    try {
      const response = await axiosInstance.get(
        `/superadmin/payment/${paymentId}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch payment details");
      }

      set({
        paymentDetail: response.data.data,
        detailLoading: false,
      });
      return response.data.data;
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch payment details";
      if (error && typeof error === "object") {
        if (
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const data = error.response.data;
          if (
            data &&
            typeof data === "object" &&
            "message" in data &&
            typeof data.message === "string"
          ) {
            errorMessage = data.message;
          }
        } else if ("message" in error && typeof error.message === "string") {
          errorMessage = error.message;
        }
      }
      toast.error(errorMessage);
      set({
        detailLoading: false,
        paymentDetail: null,
      });
      throw error;
    }
  },

  resetPaymentDetail: () => {
    set({ paymentDetail: null });
  },
}));
