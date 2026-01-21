"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  Clock,
  XCircle,
  Infinity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  CreditCard,
} from "lucide-react";
import { MetricCard } from "@/components/metric_card";
import { useSuperAdminStore } from "@/store/superadmin.store";
import { useAuthStore } from "@/store/auth.store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const subscriptionTrendData = [
  { month: "Jan", active: 45, trial: 12, expired: 5 },
  { month: "Feb", active: 52, trial: 15, expired: 3 },
  { month: "Mar", active: 61, trial: 18, expired: 4 },
  { month: "Apr", active: 68, trial: 14, expired: 6 },
  { month: "May", active: 75, trial: 20, expired: 5 },
  { month: "Jun", active: 82, trial: 16, expired: 7 },
];

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 61000 },
  { month: "Apr", revenue: 68000 },
  { month: "May", revenue: 75000 },
  { month: "Jun", revenue: 82000 },
];

const companyGrowthData = [
  { month: "Jan", companies: 57 },
  { month: "Feb", companies: 67 },
  { month: "Mar", companies: 79 },
  { month: "Apr", companies: 82 },
  { month: "May", companies: 95 },
  { month: "Jun", companies: 98 },
];

export default function DashboardPage() {
  const { companyStats, statsLoading, fetchCompanyStats } =
    useSuperAdminStore();
  const { isAuthenticated, checkingAuth } = useAuthStore();

  // Only fetch stats after auth check is complete and user is authenticated
  // Also ensure token exists in localStorage
  useEffect(() => {
    // Don't fetch if still checking auth
    if (checkingAuth) return;

    // Wait a bit if we just logged in to ensure token is ready
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("jwt_token") ||
          localStorage.getItem("token") ||
          localStorage.getItem("jwt")
        : null;

    if (isAuthenticated && storedToken) {
      // Small delay to ensure axios interceptor has time to attach token
      const timeoutId = setTimeout(() => {
        fetchCompanyStats();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [checkingAuth, isAuthenticated, fetchCompanyStats]);

  const loading = statsLoading;
  const metrics = companyStats;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Monitor your HR system performance and metrics
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground">
          Monitor your HR system performance and metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Companies"
          value={metrics?.totalCompanies || 0}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics?.companiesWithActiveSubscription || 0}
          icon={Users}
          color="emerald"
        />
        <MetricCard
          title="Trial Subscriptions"
          value={metrics?.companiesWithTrialSubscription || 0}
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Expired Subscriptions"
          value={metrics?.companiesWithExpiredSubscription || 0}
          icon={XCircle}
          color="rose"
        />
        <MetricCard
          title="Lifetime Access"
          value={metrics?.companiesWithLifetimeAccess || 0}
          icon={Infinity}
          color="violet"
        />
        <MetricCard
          title="Pending Subscriptions"
          value={metrics?.companiesWithPendingSubscription || 0}
          icon={CreditCard}
          color="teal"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
          
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>
              Monthly revenue over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-hidden">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px] overflow-hidden"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Company Growth</CardTitle>
            <CardDescription>Total companies over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                companies: {
                  label: "Companies",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={companyGrowthData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Subscription Status Distribution</CardTitle>
          <CardDescription>
            Active, trial, and expired subscriptions over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              active: {
                label: "Active",
                color: "hsl(var(--chart-2))",
              },
              trial: {
                label: "Trial",
                color: "hsl(var(--chart-3))",
              },
              expired: {
                label: "Expired",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionTrendData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="active"
                  fill="hsl(var(--chart-2))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="trial"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expired"
                  fill="hsl(var(--chart-4))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithActiveSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingUp className="h-4 w-4 text-chart-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trial Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithTrialSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingUp className="h-4 w-4 text-chart-2" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Churn Rate</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithExpiredSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingDown className="h-4 w-4 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Subscription Overview</CardTitle>
            <CardDescription>Subscription status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Active Companies
              </span>
              <span className="text-sm font-medium">
                {metrics?.companiesWithActiveSubscription || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Trial Companies
              </span>
              <span className="text-sm font-medium">
                {metrics?.companiesWithTrialSubscription || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Lifetime Access
              </span>
              <span className="text-sm font-medium">
                {metrics?.companiesWithLifetimeAccess || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="text-sm font-medium">
                {metrics?.companiesWithPendingSubscription || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
