import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// Types based on the controller responses
export interface SubscriptionTrendData {
  month: string;
  active: number;
  trial: number;
  expired: number;
}

export interface SubscriptionDistribution {
  active: number;
  trial: number;
  expired: number;
  pending: number;
  cancelled: number;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  trial: number;
  expired: number;
  newThisMonth: number;
  expiringThisMonth: number;
  growthRate: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  count: number;
}

interface SubscriptionAnalyticsStore {
  // State
  trends: SubscriptionTrendData[];
  distribution: SubscriptionDistribution | null;
  stats: SubscriptionStats | null;
  revenue: RevenueData[];
  totalSubscriptionCount: number;
  
  // Loading states
  trendsLoading: boolean;
  distributionLoading: boolean;
  statsLoading: boolean;
  revenueLoading: boolean;

  // Actions
  fetchSubscriptionTrends: (months?: number) => Promise<SubscriptionTrendData[]>;
  fetchSubscriptionDistribution: () => Promise<SubscriptionDistribution>;
  fetchSubscriptionStats: () => Promise<SubscriptionStats>;
  fetchSubscriptionRevenue: (months?: number) => Promise<RevenueData[]>;
  fetchAllAnalytics: (months?: number) => Promise<void>;
  clearAnalytics: () => void;
}

const useSubscriptionAnalyticsStore = create<SubscriptionAnalyticsStore>(
  (set) => ({
    // State
    trends: [],
    distribution: null,
    stats: null,
    revenue: [],
    totalSubscriptionCount: 0,

    // Loading states
    trendsLoading: false,
    distributionLoading: false,
    statsLoading: false,
    revenueLoading: false,

    // Actions
    fetchSubscriptionTrends: async (months = 6) => {
      set({ trendsLoading: true });

      try {
        const response = await axiosInstance.get(
          `/superadmin/subscriptions/trends?months=${months}`
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch subscription trends");
        }

        set({
          trends: response.data.data,
          trendsLoading: false,
        });
        return response.data.data;
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch subscription trends";
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
          trendsLoading: false,
          trends: [],
        });
        throw error;
      }
    },

    fetchSubscriptionDistribution: async () => {
      set({ distributionLoading: true });

      try {
        const response = await axiosInstance.get(
          "/superadmin/subscriptions/distribution"
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch subscription distribution");
        }

        set({
          distribution: response.data.data,
          totalSubscriptionCount: response.data.totalCount,
          distributionLoading: false,
        });
        return response.data.data;
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch subscription distribution";
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
          distributionLoading: false,
          distribution: null,
        });
        throw error;
      }
    },

    fetchSubscriptionStats: async () => {
      set({ statsLoading: true });

      try {
        const response = await axiosInstance.get(
          "/superadmin/subscriptions/stats"
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch subscription statistics");
        }

        set({
          stats: response.data.data,
          statsLoading: false,
        });
        return response.data.data;
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch subscription statistics";
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
          statsLoading: false,
          stats: null,
        });
        throw error;
      }
    },

    fetchSubscriptionRevenue: async (months = 6) => {
      set({ revenueLoading: true });

      try {
        const response = await axiosInstance.get(
          `/superadmin/subscriptions/revenue?months=${months}`
        );

        if (!response.data.success) {
          throw new Error("Failed to fetch subscription revenue");
        }

        set({
          revenue: response.data.data,
          revenueLoading: false,
        });
        return response.data.data;
      } catch (error: unknown) {
        let errorMessage = "Failed to fetch subscription revenue";
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
          revenueLoading: false,
          revenue: [],
        });
        throw error;
      }
    },

    fetchAllAnalytics: async (months = 6) => {
      try {
        await Promise.all([
          useSubscriptionAnalyticsStore.getState().fetchSubscriptionTrends(months),
          useSubscriptionAnalyticsStore.getState().fetchSubscriptionDistribution(),
          useSubscriptionAnalyticsStore.getState().fetchSubscriptionStats(),
          useSubscriptionAnalyticsStore.getState().fetchSubscriptionRevenue(months),
        ]);
      } catch (error) {
        console.error("Error fetching all analytics:", error);
        throw error;
      }
    },

    clearAnalytics: () => {
      set({
        trends: [],
        distribution: null,
        stats: null,
        revenue: [],
        totalSubscriptionCount: 0,
        trendsLoading: false,
        distributionLoading: false,
        statsLoading: false,
        revenueLoading: false,
      });
    },
  })
);

export default useSubscriptionAnalyticsStore;