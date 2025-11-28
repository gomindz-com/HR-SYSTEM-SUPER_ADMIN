import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  loggingIn: boolean;
  loggingOut: boolean;
  checkingAuth: boolean;
  justLoggedIn: boolean; // Track if we just logged in to skip unnecessary checks

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearAuth: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loggingIn: false,
  loggingOut: false,
  checkingAuth: false,
  justLoggedIn: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      // Login action
      login: async (email: string, password: string) => {
        set({ loggingIn: true });
        try {
          const response = await axiosInstance.post("/auth/login", {
            email,
            password,
          });

          const { user, token } = response.data.data;

          // Store JWT token in localStorage
          if (typeof window !== "undefined" && token) {
            localStorage.setItem("jwt_token", token);
            // Also store as token for backward compatibility
            localStorage.setItem("token", token);
          }

          set({
            user,
            token,
            isAuthenticated: true,
            justLoggedIn: true, // Mark that we just logged in
          });

          // Update last login time for axios interceptor grace period
          setLastLoginTime();

          toast.success("Logged in successfully");

          // Clear justLoggedIn flag after a delay
          setTimeout(() => {
            set({ justLoggedIn: false });
          }, 2000);

          return true;
        } catch (error: unknown) {
          // Check if error is due to email not verified
          if (
            (error as { response?: { data?: { needsVerification?: boolean } } })
              ?.response?.data?.needsVerification
          ) {
            toast.error(
              "Please verify your email first. Check your inbox and spam folder.",
              { duration: 6000 }
            );
          } else {
            const errorMessage =
              (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message ||
              (error as Error)?.message ||
              "Failed to login. Please check your credentials.";
            toast.error(errorMessage);
          }

          set({
            isAuthenticated: false,
            user: null,
            token: null,
          });

          return false;
        } finally {
          set({ loggingIn: false });
        }
      },

      // Logout action
      logout: async () => {
        set({ loggingOut: true });
        try {
          await axiosInstance.post("/auth/logout");
          set({ user: null });

          // Clear JWT token from localStorage (all possible token keys)
          if (typeof window !== "undefined") {
            localStorage.removeItem("jwt_token");
            localStorage.removeItem("token");
            localStorage.removeItem("jwt");
          }

          set({
            ...initialState,
            token: null,
            isAuthenticated: false,
            justLoggedIn: false,
          });

          toast.success("Logged out successfully");
          return true;
        } catch {
          set({ loggingOut: false });
          toast.error("Failed to logout");
          return false;
        } finally {
          set({ loggingOut: false });
        }
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

      // Clear auth (used by axios interceptor)
      clearAuth: () => {
        set({ user: null, isAuthenticated: false, token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("token");
          localStorage.removeItem("jwt");
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
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
