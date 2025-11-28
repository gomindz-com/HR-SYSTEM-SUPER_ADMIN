"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  CreditCard,
  Wallet,
  Menu,
  LogOut,
  Settings,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

const managementNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Companies",
    href: "/companies",
    icon: Building2,
  },
];

const financialNavigation = [
  {
    title: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: Wallet,
  },
];

const systemNavigation = [
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

// Helper functions shared between components
const isActive = (pathname: string, path: string) => {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
};

const getNavClasses = (pathname: string, path: string) => {
  const baseClasses =
    "w-full flex items-center gap-2 rounded-md p-2 text-sm transition-all duration-200 hover:bg-sidebar-accent/80";
  return isActive(pathname, path)
    ? `${baseClasses} bg-sidebar-accent text-sidebar-primary font-medium`
    : `${baseClasses} text-sidebar-foreground hover:text-sidebar-primary`;
};

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push("/login");
    }
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-sidebar-border bg-sidebar fixed inset-y-0 left-0 z-10 h-screen">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Image
              src="/gomind.png"
              alt="Gomindz"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-base font-semibold font-inter text-sidebar-foreground">
              HR System
            </h1>
            <p className="text-xs font-medium text-sidebar-primary">
              Super Admin
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-2 overflow-y-auto sidebar-scrollbar-hidden">
        {/* Management Section */}
        <div className="mb-6">
          <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
            Management
          </div>
          <div className="space-y-1">
            {managementNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getNavClasses(pathname, item.href)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Section */}
        <div className="mb-6">
          <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
            Financial
          </div>
          <div className="space-y-1">
            {financialNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getNavClasses(pathname, item.href)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* System Section */}
        <div>
          <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
            System
          </div>
          <div className="space-y-1">
            {systemNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getNavClasses(pathname, item.href)}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <div className="mb-3 px-3 py-2 text-sm">
          <p className="font-medium text-sidebar-foreground">
            {user?.name || "Super Admin"}
          </p>
          <p className="text-xs text-sidebar-foreground/70 truncate">
            {user?.email || ""}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push("/login");
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-sidebar-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">
                HR System
              </h1>
              <p className="text-xs font-medium text-sidebar-primary">
                Super Admin
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto sidebar-scrollbar-hidden">
          {/* Management Section */}
          <div className="mb-6">
            <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
              Management
            </div>
            <div className="space-y-1">
              {managementNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={getNavClasses(pathname, item.href)}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="ml-3">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Financial Section */}
          <div className="mb-6">
            <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
              Financial
            </div>
            <div className="space-y-1">
              {financialNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={getNavClasses(pathname, item.href)}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="ml-3">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* System Section */}
          <div>
            <div className="text-sidebar-foreground/70 text-xs font-semibold uppercase tracking-wider mb-2 px-2">
              System
            </div>
            <div className="space-y-1">
              {systemNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={getNavClasses(pathname, item.href)}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="ml-3">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
        <div className="p-2 border-t border-sidebar-border">
          <div className="mb-3 px-3 py-2 text-sm">
            <p className="font-medium text-sidebar-foreground">
              {user?.name || "Super Admin"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || ""}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
