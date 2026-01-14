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
  justLoggedIn: boolean;

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

      // Login action - uses separate superadmin auth endpoint
      login: async (email: string, password: string) => {
        set({ loggingIn: true });
        try {
          const response = await axiosInstance.post("/superadmin-auth/login", {
            email,
            password,
          });

          const { user, token } = response.data.data;

          // Validate that user is SUPER_ADMIN (double check from backend)
          if (user.role !== "SUPER_ADMIN") {
            toast.error("Access denied. Super admin credentials required.");
            set({
              isAuthenticated: false,
              user: null,
              token: null,
            });
            return false;
          }

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
          console.error("Login error:", error);

          // Better error handling with detailed messages
          const axiosError = error as {
            response?: {
              status?: number;
              data?: {
                message?: string;
                needsVerification?: boolean;
              };
            };
            message?: string;
          };

          // Extract error message with fallbacks
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.message ||
            "Failed to login. Please check your credentials.";

          // Show toast with error message
          toast.error(errorMessage, { duration: 4000 });

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

      // Logout action - uses separate superadmin auth endpoint
      logout: async () => {
        set({ loggingOut: true });
        try {
          await axiosInstance.post("/superadmin-auth/logout");
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

      // Check authentication status - uses separate superadmin auth endpoint
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

          console.log("Making superadmin checkAuth request...");
          const response = await axiosInstance.get(
            "/superadmin-auth/check-auth"
          );

          if (response.data.success) {
            const { user } = response.data.data;

            // Validate that user is SUPER_ADMIN (backend should enforce this, but double check)
            if (user.role !== "SUPER_ADMIN") {
              console.warn("User is not SUPER_ADMIN, clearing auth");
              if (typeof window !== "undefined") {
                localStorage.removeItem("jwt_token");
                localStorage.removeItem("token");
                localStorage.removeItem("jwt");
              }
              set({
                ...initialState,
                checkingAuth: false,
              });
              return;
            }

            console.log("checkAuth success:", response.data);
            console.log("User data:", user);
            console.log("User role:", user.role);

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
          console.error("checkAuth error:", error);
          const axiosError = error as {
            response?: {
              data?: unknown;
            };
          };
          console.error("Error response:", axiosError?.response?.data);

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
