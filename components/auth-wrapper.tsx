"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AdminMobileNav, AdminSidebar } from "@/components/admin_nav";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, checkingAuth, checkAuth } = useAuthStore();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Don't show sidebar on login page or root page
  const isLoginPage = pathname === "/login";
  const isRootPage = pathname === "/";

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

  // Redirect to login if not authenticated (except if already on login or root pages)
  if (!isAuthenticated && !isLoginPage && !isRootPage && !checkingAuth) {
    router.push("/login");
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

