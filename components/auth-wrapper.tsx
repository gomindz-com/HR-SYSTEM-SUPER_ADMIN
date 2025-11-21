"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AdminMobileNav, AdminSidebar } from "@/components/admin_nav";
import toast from "react-hot-toast";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { checkAuth, checkingAuth, user, clearAuth } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth on mount - always check to ensure we have correct user state
  useEffect(() => {
    const verifyAuth = async () => {
      // Always check auth to ensure we have the correct user state
      // This prevents issues with persisted user state
      await checkAuth();
      setAuthChecked(true);
    };
    verifyAuth();
  }, [checkAuth]);

  // Listen for auth errors from axios interceptor
  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      console.log("Auth error event received:", event.detail);

      // Don't show auth error toasts on public pages
      const currentPath = window.location.pathname;
      const publicPages = ["/", "/login"];
      const isOnPublicPage = publicPages.some((page) =>
        currentPath.startsWith(page)
      );

      if (!isOnPublicPage) {
        clearAuth();
        toast.error(
          event.detail?.message || "Session expired. Please log in again."
        );
      } else {
        // On public pages, just clear auth without showing toast
        clearAuth();
      }
    };

    const handleAuthClear = () => {
      console.log("Auth clear event received");
      clearAuth();
    };

    window.addEventListener("auth-error", handleAuthError as EventListener);
    window.addEventListener("auth-clear", handleAuthClear as EventListener);

    return () => {
      window.removeEventListener(
        "auth-error",
        handleAuthError as EventListener
      );
      window.removeEventListener(
        "auth-clear",
        handleAuthClear as EventListener
      );
    };
  }, [clearAuth]);

  // Show loading spinner while checking auth
  if (!authChecked || checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";

  // Show login page or root page without sidebar
  if (isLoginPage || isRootPage) {
    return <>{children}</>;
  }

  // Show authenticated layout with sidebar
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex flex-col lg:ml-64">
          <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports[backdrop-filter]:bg-card/60 lg:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <AdminMobileNav />
                <h1 className="text-lg font-bold">HR System</h1>
              </div>
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  }

  // If not authenticated and not on public pages, redirect will happen
  // Return null to prevent flash of content
  return null;
}
