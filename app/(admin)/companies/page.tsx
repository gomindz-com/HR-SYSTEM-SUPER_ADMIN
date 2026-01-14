"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, Users, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status_badge";
import { useSuperAdminStore } from "@/store/superadmin.store";
import { useAuthStore } from "@/store/auth.store";
import type { Company } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompaniesPage() {
  const router = useRouter();
  const { companies, companiesLoading, companiesPagination, fetchCompanies } =
    useSuperAdminStore();
  const { isAuthenticated, checkingAuth } = useAuthStore();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search change
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch companies with real-time filtering
  useEffect(() => {
    if (!checkingAuth && isAuthenticated) {
      fetchCompanies({
        page,
        pageSize: 10,
        search: debouncedSearch || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        subscriptionStatus: subscriptionStatus || undefined,
      });
    }
  }, [
    checkingAuth,
    isAuthenticated,
    page,
    debouncedSearch,
    dateFrom,
    dateTo,
    subscriptionStatus,
    fetchCompanies,
  ]);

  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setSubscriptionStatus("");
    setPage(1);
  };

  const hasActiveFilters = search || dateFrom || dateTo || subscriptionStatus;

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">Manage and view all companies</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
        <p className="text-muted-foreground">Manage and view all companies</p>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Companies List</CardTitle>
              <CardDescription>
                {companiesLoading
                  ? "Loading companies..."
                  : `${companiesPagination?.totalCount || 0} total companies`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 w-full">
          {/* Filters in table header */}
          <div className="border-b p-4 bg-muted/30 w-full">
            <div className="flex flex-wrap items-end gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or TIN..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              {/* Subscription Status Filter */}
              <div className="w-[180px] shrink-0">
                <Select
                  value={subscriptionStatus ? subscriptionStatus : "all"}
                  onValueChange={(value) => {
                    setSubscriptionStatus(value === "all" ? "" : value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Subscription Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="LIFETIME">Lifetime</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="w-[160px] shrink-0">
                <Input
                  type="date"
                  placeholder="Date From"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Date To */}
              <div className="w-[160px] shrink-0">
                <Input
                  type="date"
                  placeholder="Date To"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full"
                />
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="whitespace-nowrap shrink-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            {companiesLoading && companies.length === 0 ? (
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Company Name</TableHead>
                    <TableHead className="w-[200px]">Email</TableHead>
                    <TableHead className="w-[120px]">TIN</TableHead>
                    <TableHead className="w-[100px]">Employees</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : companies.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No companies found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "No companies have been registered yet"}
                </p>
              </div>
            ) : (
              <>
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Company Name</TableHead>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead className="w-[120px]">TIN</TableHead>
                      <TableHead className="w-[100px]">Employees</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[120px]">Created</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company: Company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium w-[180px]">
                          <div className="truncate" title={company.name}>
                            {company.name}
                          </div>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div
                            className="truncate"
                            title={company.email || "N/A"}
                          >
                            {company.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div
                            className="truncate"
                            title={company.tin || "N/A"}
                          >
                            {company.tin || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span>{company.employeeCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <StatusBadge status={company.status} />
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="text-sm">
                              {new Date(company.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              router.push(`/companies/${company.id}`)
                            }
                            className="whitespace-nowrap"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {companiesPagination && companiesPagination.totalPages > 1 && (
                  <div className="border-t p-4 w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Page {companiesPagination.currentPage} of{" "}
                        {companiesPagination.totalPages} (
                        {companiesPagination.totalCount} total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={
                            !companiesPagination.hasPrevPage || companiesLoading
                          }
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={
                            !companiesPagination.hasNextPage || companiesLoading
                          }
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
