"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AdminMobileNav, AdminSidebar } from "@/components/admin_nav";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkingAuth, checkAuth, logout, justLoggedIn } =
    useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth on mount - only once, skip if already authenticated or just logged in
  useEffect(() => {
    if (hasCheckedAuth) return;

    // If we just logged in, don't run checkAuth - trust the login state
    if (justLoggedIn && isAuthenticated) {
      setTimeout(() => setHasCheckedAuth(true), 0);
      return;
    }

    // If we already have a token and are authenticated, don't re-check immediately
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt")
        : null;

    if (!storedToken) {
      // No token, mark as checked
      setTimeout(() => setHasCheckedAuth(true), 0);
      return;
    }

    if (storedToken && !isAuthenticated) {
      // We have a token but not authenticated - verify it
      checkAuth().finally(() => {
        setTimeout(() => setHasCheckedAuth(true), 0);
      });
    } else {
      // Already authenticated (likely from login), mark as checked
      setTimeout(() => setHasCheckedAuth(true), 0);
    }
  }, [checkAuth, isAuthenticated, hasCheckedAuth, justLoggedIn]);

  // Listen for auth-clear events from axios interceptor
  useEffect(() => {
    const handleAuthClear = () => {
      console.log("Auth clear event received");
      logout();
      // Use setTimeout to avoid updating router during render
      setTimeout(() => {
        router.push("/login");
      }, 0);
    };

    window.addEventListener("auth-clear", handleAuthClear);

    return () => {
      window.removeEventListener("auth-clear", handleAuthClear);
    };
  }, [logout, router]);

  // Don't show sidebar on login page or root page
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";

  // Redirect to login if not authenticated (except if already on login or root pages)
  // Do this in useEffect to avoid "Cannot update component during render" error
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated && !isLoginPage && !isRootPage) {
      router.push("/login");
    }
  }, [checkingAuth, isAuthenticated, isLoginPage, isRootPage, router]);

  // Show loading state while checking auth (except on login and root pages)
  if (checkingAuth && !isLoginPage && !isRootPage) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-64 border-r border-border p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <Skeleton className="h-16 w-full" />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-full w-full" />
          </main>
        </div>
      </div>
    );
  }

  // Don't render protected routes if not authenticated (redirect will happen in useEffect above)
  if (!isAuthenticated && !isLoginPage && !isRootPage) {
    return null;
  }

  // Show login page or root page without sidebar
  if (isLoginPage || isRootPage) {
    return <>{children}</>;
  }

  // Show authenticated layout with sidebar
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
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

  return null;
}
