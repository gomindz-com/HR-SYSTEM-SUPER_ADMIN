"use client";

import { useEffect } from "react";
import {
  Building2,
  Users,
  Clock,
  XCircle,
  Infinity,
  TrendingUp,
  TrendingDown,
  CreditCard,
} from "lucide-react";
import { MetricCard } from "@/components/metric_card";
import { useSuperAdminStore } from "@/store/superadmin.store";
import { useAuthStore } from "@/store/auth.store";
import useSubscriptionAnalyticsStore from "@/store/subscriptionTrend.store";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { companyStats, statsLoading, fetchCompanyStats } =
    useSuperAdminStore();
  const { isAuthenticated, checkingAuth } = useAuthStore();
  const { trends, trendsLoading, fetchSubscriptionTrends } =
    useSubscriptionAnalyticsStore();

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
        fetchSubscriptionTrends(6); // Fetch 6 months of subscription trends
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [checkingAuth, isAuthenticated, fetchCompanyStats, fetchSubscriptionTrends]);

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

      <Card className="shadow-sm border-border/40 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">
            Subscription Status Distribution
          </CardTitle>
          <CardDescription>
            Active, trial, and expired subscriptions over time
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          {trendsLoading ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : trends.length === 0 ? (
            <div className="h-[320px] flex items-center justify-center">
              <p className="text-muted-foreground">No subscription data available</p>
            </div>
          ) : (
            <ChartContainer
              config={{
                active: {
                  label: "Active",
                  color: "hsl(142, 76%, 36%)",
                },
                trial: {
                  label: "Trial",
                  color: "hsl(45, 93%, 47%)",
                },
                expired: {
                  label: "Expired",
                  color: "hsl(0, 84%, 60%)",
                },
              }}
              className="h-[320px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trends}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="activeGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(142, 76%, 36%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(142, 76%, 36%)"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient
                      id="trialGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(45, 93%, 47%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(45, 93%, 47%)"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                    <linearGradient
                      id="expiredGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="hsl(0, 84%, 60%)"
                        stopOpacity={0.9}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(0, 84%, 60%)"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.3}
                  />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                  />
                  <Bar
                    dataKey="active"
                    fill="url(#activeGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="trial"
                    fill="url(#trialGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="expired"
                    fill="url(#expiredGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <Card className="shadow-sm border-border/40 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Active Rate
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithActiveSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Trial Rate
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithTrialSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Churn Rate
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {metrics?.totalCompanies
                    ? Math.round(
                        (metrics.companiesWithExpiredSubscription /
                          metrics.totalCompanies) *
                          100
                      )
                    : 0}
                  %
                </span>
                <TrendingDown className="h-4 w-4 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Subscription Overview</CardTitle>
            <CardDescription>Subscription status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Active Companies
              </span>
              <span className="text-sm font-bold text-foreground">
                {metrics?.companiesWithActiveSubscription || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Trial Companies
              </span>
              <span className="text-sm font-bold text-foreground">
                {metrics?.companiesWithTrialSubscription || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Lifetime Access
              </span>
              <span className="text-sm font-bold text-foreground">
                {metrics?.companiesWithLifetimeAccess || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-sm font-medium text-muted-foreground">
                Pending
              </span>
              <span className="text-sm font-bold text-foreground">
                {metrics?.companiesWithPendingSubscription || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}