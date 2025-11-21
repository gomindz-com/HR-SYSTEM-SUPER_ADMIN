import { create } from "zustand";
import { axiosInstance, setLastLoginTime } from "@/lib/axios";
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
  justLoggedIn: boolean; // Track if we just logged in to skip unnecessary checks

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
  justLoggedIn: false,
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

        // Store token in localStorage (use jwt_token to match main frontend)
        if (typeof window !== "undefined") {
          localStorage.setItem("jwt_token", token);
          // Also store as token for backward compatibility
          localStorage.setItem("token", token);
        }

        set({
          user,
          token,
          isAuthenticated: true,
          loading: false,
          justLoggedIn: true, // Mark that we just logged in
        });

        // Update last login time for axios interceptor grace period
        setLastLoginTime();

        toast.success("Login successful!");

        // Clear justLoggedIn flag after a delay
        setTimeout(() => {
          set({ justLoggedIn: false });
        }, 2000);
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
    // Clear localStorage (all possible token keys)
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("token");
      localStorage.removeItem("jwt");
    }

    set({
      ...initialState,
      justLoggedIn: false,
    });

    toast.success("Logged out successfully");
  },

  // Check authentication status
  checkAuth: async () => {
    set({ checkingAuth: true });

    try {
      // Check if token exists in localStorage first
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("jwt_token") ||
            localStorage.getItem("token") ||
            localStorage.getItem("jwt")
          : null;

      if (!token) {
        console.log("No token found, clearing auth state");
        set({
          checkingAuth: false,
          isAuthenticated: false,
          user: null,
          token: null,
        });
        return;
      }

      console.log("Making checkAuth request...");
      const response = await axiosInstance.get("/auth/check-auth");

      if (response.data.success) {
        const { user } = response.data.data;

        console.log("checkAuth success:", response.data);

        set({
          user,
          token,
          isAuthenticated: true,
          checkingAuth: false,
        });
      } else {
        throw new Error("Authentication check failed");
      }
    } catch (error) {
      console.log("checkAuth error:", error);
      // Clear invalid token (all possible keys)
      if (typeof window !== "undefined") {
        localStorage.removeItem("jwt_token");
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
        localStorage.setItem("jwt_token", token);
        localStorage.setItem("token", token); // Backward compatibility
      } else {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
      }
    }
    set({ token, isAuthenticated: !!token });
  },
}));
