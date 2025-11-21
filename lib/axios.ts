import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : process.env.NEXT_PUBLIC_API_URL + "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authorization token
axiosInstance.interceptors.request.use(
  (config) => {
    // Always read token from localStorage directly (don't rely on state)
    // This ensures the token is available even during auth check
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("jwt_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("jwt");

      // If token exists in localStorage, add it to Authorization header
      // This takes priority over cookies as per backend middleware
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log for debugging (can be removed later)
        if (process.env.NODE_ENV === "development") {
          console.log("🔑 Token attached to request:", config.url, {
            hasToken: !!token,
            tokenLength: token.length,
          });
        }
      } else {
        // Log if no token found for debugging
        if (process.env.NODE_ENV === "development") {
          console.warn("⚠️ No token found for request:", config.url);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track when we last logged in to give grace period
let lastLoginTime: number | null = null;

// Export function to update last login time (called from auth store after login)
export const setLastLoginTime = () => {
  lastLoginTime = Date.now();
};

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401/403 unauthorized - clear token and dispatch auth-clear event
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't clear auth for /auth/check-auth endpoint - that's handled by checkAuth itself
      const url = error.config?.url || "";
      if (
        !url.includes("/auth/check-auth") &&
        !url.includes("/auth/login") &&
        typeof window !== "undefined"
      ) {
        // Give grace period of 2 seconds after login to allow token to propagate
        const timeSinceLogin = lastLoginTime
          ? Date.now() - lastLoginTime
          : Infinity;
        if (timeSinceLogin > 2000) {
          // Clear all possible token keys
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("token");
          localStorage.removeItem("jwt");

          // Dispatch event to clear auth state in store
          // Use setTimeout to avoid updating during render
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("auth-clear"));
          }, 0);
        } else {
          console.warn(
            "⚠️ 401 error within grace period after login, not clearing auth:",
            url
          );
        }
      }
    }

    return Promise.reject(error);
  }
);
