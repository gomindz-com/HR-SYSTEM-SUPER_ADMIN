"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Calendar, Clock } from "lucide-react";
import { useSubscriptionStore } from "@/store/subscription.store";
import type { SubscriptionListItem, UpdateSubscriptionData } from "@/store/subscription.store";

// Zod schema for form validation
const subscriptionUpdateSchema = z.object({
  status: z.enum(["TRIAL", "PENDING", "ACTIVE", "EXPIRED", "CANCELLED"]),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  trialEndDate: z.string().optional().nullable(),
  planId: z.string().optional(),
}).refine(
  (data) => {
    // If status is ACTIVE or CANCELLED, endDate is required
    if ((data.status === "ACTIVE" || data.status === "CANCELLED") && !data.endDate) {
      return false;
    }
    // If status is TRIAL, trialEndDate is required
    if (data.status === "TRIAL" && !data.trialEndDate) {
      return false;
    }
    return true;
  },
  {
    message: "End date is required for ACTIVE/CANCELLED, Trial end date is required for TRIAL",
    path: ["endDate"],
  }
);

type SubscriptionUpdateFormData = z.infer<typeof subscriptionUpdateSchema>;

interface SubscriptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionListItem;
  onSuccess: () => void;
}

export default function SubscriptionEditModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
}: SubscriptionEditModalProps) {
  const { updateSubscription } = useSubscriptionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SubscriptionUpdateFormData>({
    resolver: zodResolver(subscriptionUpdateSchema),
    defaultValues: {
      status: subscription.status,
      startDate: subscription.startDate
        ? new Date(subscription.startDate).toISOString().split("T")[0]
        : "",
      endDate: subscription.endDate
        ? new Date(subscription.endDate).toISOString().split("T")[0]
        : "",
      trialEndDate: subscription.trialEndDate
        ? new Date(subscription.trialEndDate).toISOString().split("T")[0]
        : "",
      planId: subscription.planId,
    },
  });

  // Update form when subscription changes
  useEffect(() => {
    if (subscription) {
      form.reset({
        status: subscription.status,
        startDate: subscription.startDate
          ? new Date(subscription.startDate).toISOString().split("T")[0]
          : "",
        endDate: subscription.endDate
          ? new Date(subscription.endDate).toISOString().split("T")[0]
          : "",
        trialEndDate: subscription.trialEndDate
          ? new Date(subscription.trialEndDate).toISOString().split("T")[0]
          : "",
        planId: subscription.planId,
      });
    }
  }, [subscription, form]);

  const onSubmit = async (data: SubscriptionUpdateFormData) => {
    setIsSubmitting(true);
    try {
      const updateData: UpdateSubscriptionData = {
        status: data.status,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        trialEndDate: data.trialEndDate || null,
        planId: data.planId,
      };

      await updateSubscription(subscription.id, updateData);
      onSuccess();
    } catch (error) {
      console.error("Subscription update failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = form.watch("status");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Edit Subscription
          </DialogTitle>
          <DialogDescription>
            Update subscription details for {subscription.company.companyName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Subscription Status
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TRIAL">Trial</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plan ID */}
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Plan ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter plan ID"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Current plan: {subscription.plan.name}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Start Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date - Required for ACTIVE and CANCELLED */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    End Date
                    {(currentStatus === "ACTIVE" ||
                      currentStatus === "CANCELLED") && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  {(currentStatus === "ACTIVE" ||
                    currentStatus === "CANCELLED") && (
                    <FormDescription className="text-xs text-amber-600">
                      End date is required for {currentStatus} status
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Trial End Date - Required for TRIAL */}
            <FormField
              control={form.control}
              name="trialEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Trial End Date
                    {currentStatus === "TRIAL" && (
                      <span className="text-red-500">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  {currentStatus === "TRIAL" && (
                    <FormDescription className="text-xs text-amber-600">
                      Trial end date is required for TRIAL status and must be in the future
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Updating..." : "Update Subscription"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
