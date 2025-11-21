import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
import toast from "react-hot-toast";

// User type based on backend response
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: number | null;
  profilePic?: string | null;
  position?: string | null;
  [key: string]: unknown;
}

// Auth store state interface
interface AuthStore {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkingAuth: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  checkingAuth: false,
};

export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  // Login action
  login: async (email: string, password: string) => {
    set({ loading: true });

    try {
      const response = await axiosInstance.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        const { user, token } = response.data.data;

        // Store token in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
        });

        toast.success("Login successful!");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        (error as Error)?.message ||
        "Failed to login. Please check your credentials.";

      set({
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });

      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  },

  // Logout action
  logout: () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("jwt");
    }

    set({
      ...initialState,
    });

    toast.success("Logged out successfully");
  },

  // Check authentication status
  checkAuth: async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("jwt")
        : null;

    if (!token) {
      set({
        checkingAuth: false,
        isAuthenticated: false,
        user: null,
        token: null,
      });
      return;
    }

    set({ checkingAuth: true });

    try {
      const response = await axiosInstance.get("/auth/check");

      if (response.data.success) {
        const { user } = response.data.data;

        set({
          user,
          token,
          isAuthenticated: true,
          checkingAuth: false,
        });
      } else {
        throw new Error("Authentication check failed");
      }
    } catch {
      // Clear invalid token
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
      }

      set({
        ...initialState,
        checkingAuth: false,
      });
    }
  },

  // Set user manually
  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  // Set token manually
  setToken: (token: string | null) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
      }
    }
    set({ token, isAuthenticated: !!token });
  },
}));
