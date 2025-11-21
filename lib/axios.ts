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
    // Try to get token from localStorage first
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      
      // If token exists in localStorage, add it to Authorization header
      // This takes priority over cookies as per backend middleware
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - clear token and redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("jwt");
        // Optionally redirect to login page
        // window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);
