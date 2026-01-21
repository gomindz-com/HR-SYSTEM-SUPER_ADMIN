"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  FileText,
  MapPin,
  DollarSign,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { SubscriptionListItem } from "@/store/subscription.store";

interface SubscriptionViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionListItem;
}

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

export default function SubscriptionViewModal({
  isOpen,
  onClose,
  subscription,
}: SubscriptionViewModalProps) {
  const status = statusConfig[subscription.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Subscription Details
          </DialogTitle>
          <DialogDescription>
            View complete subscription information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className={cn("text-sm px-4 py-2", status.bgClass)}
            >
              <StatusIcon className={cn("size-4 mr-2", status.className)} />
              <span className={status.className}>{status.label}</span>
            </Badge>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Company Name
                </p>
                <p className="text-sm font-semibold">
                  {subscription.company.companyName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Company Email
                </p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {subscription.company.companyEmail || "No email"}
                  </p>
                </div>
              </div>
              {subscription.company.companyTin && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Company TIN
                  </p>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{subscription.company.companyTin}</p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Lifetime Access
                </p>
                <Badge
                  variant="outline"
                  className={
                    subscription.company.hasLifetimeAccess
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }
                >
                  {subscription.company.hasLifetimeAccess ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription Plan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Plan Name
                </p>
                <Badge variant="outline" className="bg-purple-50 border-purple-200">
                  {subscription.plan.name}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Price per User/Month
                </p>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">
                    {subscription.plan.price} GMD
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Max Employees
                </p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {subscription.plan.maxEmployees
                      ? subscription.plan.maxEmployees
                      : "Unlimited"}
                  </p>
                </div>
              </div>
              {subscription.plan.features && subscription.plan.features.length > 0 && (
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {subscription.plan.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50 border-blue-200 text-blue-700"
                      >
                        {feature.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Subscription Dates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {subscription.startDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(subscription.startDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              {subscription.endDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(new Date(subscription.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              )}
              {subscription.trialEndDate && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Trial End Date
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {format(
                        new Date(subscription.trialEndDate),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    {format(new Date(subscription.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription ID */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground">Subscription ID</p>
            <p className="text-sm font-mono mt-1">{subscription.id}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
