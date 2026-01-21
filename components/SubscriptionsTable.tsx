"use client";

import { useMemo, useState, useEffect } from "react";
import { useSubscriptionStore } from "@/store/subscription.store";
import {
  MoreHorizontal,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCcw,
  Eye,
  Edit,
  Building2,
  Calendar,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import SubscriptionViewModal from "./SubscriptionViewModal";
import SubscriptionEditModal from "./SubscriptionEditModal";
import type {
  SubscriptionListItem,
  LifetimeCompany,
} from "@/store/subscription.store";

const statusConfig: Record<
  string,
  { label: string; icon: React.ElementType; className: string; bgClass: string }
> = {
  TRIAL: {
    label: "Trial",
    icon: Clock,
    className: "text-blue-600",
    bgClass: "bg-blue-50 border-blue-200",
  },
  PENDING: {
    label: "Pending",
    icon: AlertCircle,
    className: "text-amber-600",
    bgClass: "bg-amber-50 border-amber-200",
  },
  ACTIVE: {
    label: "Active",
    icon: CheckCircle2,
    className: "text-green-600",
    bgClass: "bg-green-50 border-green-200",
  },
  EXPIRED: {
    label: "Expired",
    icon: XCircle,
    className: "text-red-600",
    bgClass: "bg-red-50 border-red-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className: "text-gray-600",
    bgClass: "bg-gray-50 border-gray-200",
  },
};

export function SubscriptionsTable() {
  const {
    subscriptions,
    subscriptionsLoading,
    subscriptionsPagination,
    lifetimeCompanies,
    lifetimeCompaniesLoading,
    lifetimeCompaniesPagination,
    fetchSubscriptions,
    fetchLifetimeCompanies,
  } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<"subscriptions" | "lifetime">(
    "subscriptions"
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedSubscription, setSelectedSubscription] =
    useState<SubscriptionListItem | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === "subscriptions") {
      fetchSubscriptions({
        page,
        pageSize,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      });
    } else {
      fetchLifetimeCompanies({
        page,
        pageSize,
        search: debouncedSearch || undefined,
      });
    }
  }, [
    page,
    pageSize,
    debouncedSearch,
    statusFilter,
    activeTab,
    fetchSubscriptions,
    fetchLifetimeCompanies,
  ]);

  // Subscription columns
  const subscriptionColumns: ColumnDef<SubscriptionListItem>[] = useMemo(
    () => [
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => {
          const subscription = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-medium block">
                  {subscription.company.companyName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {subscription.company.companyEmail || "No email"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "plan",
        header: "Plan",
        accessorFn: (row) => row.plan.name,
        cell: ({ row }) => {
          const subscription = row.original;
          return (
            <Badge variant="outline" className="bg-purple-50 border-purple-200">
              {subscription.plan.name}
            </Badge>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        filterFn: (row, id, value) => {
          const status = row.getValue(id) as string;
          return value.includes(status);
        },
        cell: ({ row }) => {
          const subscription = row.original;
          const status = subscription.status;
          const config = statusConfig[status] || statusConfig.PENDING;
          const StatusIcon = config.icon;
          return (
            <Badge variant="outline" className={cn("text-xs", config.bgClass)}>
              <StatusIcon className={cn("size-3 mr-1", config.className)} />
              <span className={config.className}>{config.label}</span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => {
          const subscription = row.original;
          if (!subscription.startDate) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              {format(new Date(subscription.startDate), "MMM d, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => {
          const subscription = row.original;
          if (!subscription.endDate) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              {format(new Date(subscription.endDate), "MMM d, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "trialEndDate",
        header: "Trial End",
        cell: ({ row }) => {
          const subscription = row.original;
          if (!subscription.trialEndDate) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          return (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {format(new Date(subscription.trialEndDate), "MMM d, yyyy")}
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const subscription = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    setViewModalOpen(true);
                  }}
                >
                  <Eye className="size-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedSubscription(subscription);
                    setEditModalOpen(true);
                  }}
                >
                  <Edit className="size-4 mr-2" />
                  Edit Subscription
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  // Lifetime companies columns
  const lifetimeColumns: ColumnDef<LifetimeCompany>[] = useMemo(
    () => [
      {
        accessorKey: "companyName",
        header: "Company",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <span className="text-sm font-medium block">
                  {company.companyName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {company.companyEmail || "No email"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "hr",
        header: "HR Manager",
        cell: ({ row }) => {
          const company = row.original;
          if (!company.hr) {
            return (
              <span className="text-sm text-muted-foreground">No HR manager</span>
            );
          }
          return (
            <div>
              <span className="text-sm font-medium block">{company.hr.name}</span>
              <span className="text-xs text-muted-foreground">
                {company.hr.email}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "_count.employees",
        header: "Employees",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <Badge variant="outline" className="bg-blue-50 border-blue-200">
              {company._count.employees} employees
            </Badge>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
          const company = row.original;
          return (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="size-3.5" />
              {format(new Date(company.createdAt), "MMM d, yyyy")}
            </div>
          );
        },
      },
    ],
    []
  );

  const subscriptionTable = useReactTable<SubscriptionListItem>({
    data: subscriptions || [],
    columns: subscriptionColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    pageCount: subscriptionsPagination?.totalPages || 0,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const lifetimeTable = useReactTable<LifetimeCompany>({
    data: lifetimeCompanies || [],
    columns: lifetimeColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    manualPagination: true,
    pageCount: lifetimeCompaniesPagination?.totalPages || 0,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const currentTable =
    activeTab === "subscriptions" ? subscriptionTable : lifetimeTable;
  const currentData =
    activeTab === "subscriptions" ? subscriptions : lifetimeCompanies;
  const currentLoading =
    activeTab === "subscriptions"
      ? subscriptionsLoading
      : lifetimeCompaniesLoading;
  const currentPagination =
    activeTab === "subscriptions"
      ? subscriptionsPagination
      : lifetimeCompaniesPagination;
  const currentColumns =
    activeTab === "subscriptions" ? subscriptionColumns : lifetimeColumns;

  const isInitialLoading = currentLoading && currentData.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Subscriptions Management</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all company subscriptions
          </p>
        </div>
        {currentLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Updating...</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2">
            <TabsTrigger value="subscriptions" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Subscriptions</span>
              <Badge 
                variant="secondary" 
                className="ml-1.5 h-5 min-w-5 px-1.5 text-xs font-semibold bg-primary/10 text-primary border-0"
              >
                {subscriptionsPagination?.totalCount || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="lifetime" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>Lifetime Access</span>
              <Badge 
                variant="secondary" 
                className="ml-1.5 h-5 min-w-5 px-1.5 text-xs font-semibold bg-primary/10 text-primary border-0"
              >
                {lifetimeCompaniesPagination?.totalCount || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div
            className={cn(
              "rounded-xl border border-border bg-card transition-opacity duration-200",
              currentLoading && "opacity-60 pointer-events-none"
            )}
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-3">Subscription Listings</div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 w-full md:w-[200px]"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      {statusFilter === ""
                        ? "All Status"
                        : statusConfig[statusFilter]?.label || "All Status"}
                      <ChevronDown className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => setStatusFilter("")}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <DropdownMenuItem
                        key={key}
                        onClick={() => setStatusFilter(key)}
                      >
                        <span className={config.className}>{config.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {currentTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-muted-foreground font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {currentTable.getRowModel().rows?.length ? (
                    currentTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={currentColumns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <RefreshCcw className="h-10 w-10 mb-2 opacity-50" />
                          <p className="font-medium">No subscriptions found</p>
                          <p className="text-sm">
                            {debouncedSearch || statusFilter
                              ? "Try adjusting your filters"
                              : "No subscriptions available"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {currentPagination && currentPagination.totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, currentPagination.totalPages) },
                      (_, i) => {
                        let pageNum: number;
                        if (currentPagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= currentPagination.totalPages - 2) {
                          pageNum = currentPagination.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        const isActive = page === pageNum;
                        return (
                          <button
                            key={i}
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "size-8 rounded-lg text-sm font-semibold",
                              isActive
                                ? "bg-muted text-foreground"
                                : "text-foreground hover:bg-muted"
                            )}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                    {currentPagination.totalPages > 5 && (
                      <>
                        <span className="px-2 text-muted-foreground">...</span>
                        <button
                          onClick={() => setPage(currentPagination.totalPages)}
                          className="size-8 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
                        >
                          {currentPagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= currentPagination.totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setPage(currentPagination.totalPages)}
                    disabled={page >= currentPagination.totalPages}
                  >
                    <ChevronsRight className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Showing{" "}
                    {currentPagination.total > 0
                      ? (page - 1) * pageSize + 1
                      : 0}{" "}
                    to {Math.min(page * pageSize, currentPagination.total)} of{" "}
                    {currentPagination.total} items
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-2">
                        Show {pageSize}
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {[5, 10, 20, 50].map((size) => (
                        <DropdownMenuItem
                          key={size}
                          onClick={() => {
                            setPageSize(size);
                            setPage(1);
                          }}
                        >
                          Show {size}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Lifetime Access Tab */}
        <TabsContent value="lifetime" className="space-y-4">
          <div
            className={cn(
              "rounded-xl border border-border bg-card transition-opacity duration-200",
              currentLoading && "opacity-60 pointer-events-none"
            )}
          >
            {/* Filters */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-border p-4">
              <div className="flex items-center gap-3">Lifetime Access Companies</div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9 w-full md:w-[200px]"
                  />
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  {lifetimeTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="bg-muted/50">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="text-muted-foreground font-medium"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {lifetimeTable.getRowModel().rows?.length ? (
                    lifetimeTable.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={lifetimeColumns.length}
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <RefreshCcw className="h-10 w-10 mb-2 opacity-50" />
                          <p className="font-medium">No companies found</p>
                          <p className="text-sm">
                            {debouncedSearch
                              ? "Try adjusting your filters"
                              : "No companies with lifetime access"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {lifetimeCompaniesPagination &&
              lifetimeCompaniesPagination.totalPages > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                    >
                      <ChevronsLeft className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.min(
                            5,
                            lifetimeCompaniesPagination.totalPages
                          ),
                        },
                        (_, i) => {
                          let pageNum: number;
                          if (lifetimeCompaniesPagination.totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (
                            page >=
                            lifetimeCompaniesPagination.totalPages - 2
                          ) {
                            pageNum =
                              lifetimeCompaniesPagination.totalPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          const isActive = page === pageNum;
                          return (
                            <button
                              key={i}
                              onClick={() => setPage(pageNum)}
                              className={cn(
                                "size-8 rounded-lg text-sm font-semibold",
                                isActive
                                  ? "bg-muted text-foreground"
                                  : "text-foreground hover:bg-muted"
                              )}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}
                      {lifetimeCompaniesPagination.totalPages > 5 && (
                        <>
                          <span className="px-2 text-muted-foreground">...</span>
                          <button
                            onClick={() =>
                              setPage(lifetimeCompaniesPagination.totalPages)
                            }
                            className="size-8 rounded-lg text-sm font-semibold text-foreground hover:bg-muted"
                          >
                            {lifetimeCompaniesPagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= lifetimeCompaniesPagination.totalPages}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setPage(lifetimeCompaniesPagination.totalPages)
                      }
                      disabled={page >= lifetimeCompaniesPagination.totalPages}
                    >
                      <ChevronsRight className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Showing{" "}
                      {lifetimeCompaniesPagination.total > 0
                        ? (page - 1) * pageSize + 1
                        : 0}{" "}
                      to{" "}
                      {Math.min(
                        page * pageSize,
                        lifetimeCompaniesPagination.total
                      )}{" "}
                      of {lifetimeCompaniesPagination.total} companies
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                          Show {pageSize}
                          <ChevronDown className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[5, 10, 20, 50].map((size) => (
                          <DropdownMenuItem
                            key={size}
                            onClick={() => {
                              setPageSize(size);
                              setPage(1);
                            }}
                          >
                            Show {size}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedSubscription && (
        <>
          <SubscriptionViewModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
          />
          <SubscriptionEditModal
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedSubscription(null);
            }}
            subscription={selectedSubscription}
            onSuccess={() => {
              setEditModalOpen(false);
              setSelectedSubscription(null);
              // Refresh data
              if (activeTab === "subscriptions") {
                fetchSubscriptions({
                  page,
                  pageSize,
                  search: debouncedSearch || undefined,
                  status: statusFilter || undefined,
                });
              }
            }}
          />
        </>
      )}
    </div>
  );
}
