import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// Types based on the controller response
export interface HR {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  position: string | null;
  departmentId: number | null;
  employeeStatus: string;
}

export interface Department {
  id: number;
  departmentName: string;
  _count: {
    employees: number;
  };
}

export interface Location {
  id: number;
  locationName: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Subscription {
  id: number;
  subscriptionStatus: string;
  startDate: string;
  endDate: string;
  trialEndDate: string | null;
  planType: string;
}

export interface WorkdayConfig {
  id: number;
  dayOfWeek: string;
  isWorkday: boolean;
}

export interface TrialInfo {
  isTrial: boolean;
  daysRemaining: number;
  isExpired: boolean;
  endDate: string;
}

export interface CompanyDetail {
  id: number;
  companyName: string;
  companyEmail: string | null;
  companyTin: string | null;
  companyAddress: string | null;
  companyDescription: string | null;
  timezone: string;
  workStartTime: string;
  workEndTime: string;
  workStartTime2: string;
  workEndTime2: string;
  lateThreshold: number;
  checkInDeadline: number;
  lateThreshold2: number;
  checkInDeadline2: number;
  hasLifetimeAccess: boolean;
  createdAt: string;
  hr: HR | null;
  employees: Employee[];
  departments: Department[];
  locations: Location[];
  subscription: Subscription | null;
  WorkdayDaysConfig: WorkdayConfig[];
  trialInfo: TrialInfo | null;
  _count: {
    employees: number;
    departments: number;
    locations: number;
    attendances: number;
    leaveRequests: number;
  };
}

interface CompanyDetailStore {
  // State
  company: CompanyDetail | null;
  detailLoading: boolean;

  // Actions
  fetchCompanyDetail: (companyId: number | string) => Promise<CompanyDetail>;
}

const useCompanyDetailStore = create<CompanyDetailStore>((set) => ({
  // State
  company: null,
  detailLoading: false,

  // Actions
  fetchCompanyDetail: async (companyId) => {
    set({ detailLoading: true });

    try {
      const response = await axiosInstance.get(
        `/superadmin/company/${companyId}`
      );

      if (!response.data.success) {
        throw new Error("Failed to fetch company details");
      }

      set({
        company: response.data.data,
        detailLoading: false,
      });
      return response.data.data;
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch company details";
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
        company: null,
      });
      throw error;
    }
  },
}));

export default useCompanyDetailStore;
