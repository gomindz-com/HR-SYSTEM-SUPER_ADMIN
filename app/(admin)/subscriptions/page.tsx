"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Clock, Infinity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status_badge"
import {
  getSubscriptions,
  grantLifetimeAccess,
  revokeLifetimeAccess,
  extendTrial,
  activateSubscription,
  revokeAccess,
} from "@/lib/api"
import type { Subscription, SubscriptionStatus } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

type ActionType = "lifetime" | "revoke-lifetime" | "extend-trial" | "activate" | "revoke"

export default function SubscriptionsPage() {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "ALL">("ALL")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: ActionType | null
    subscription: Subscription | null
  }>({ open: false, type: null, subscription: null })
  const [trialDays, setTrialDays] = useState(30)

  useEffect(() => {
    fetchSubscriptions()
  }, [statusFilter, page])

  async function fetchSubscriptions() {
    setLoading(true)
    const response = await getSubscriptions({
      page,
      pageSize: 10,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
    })

    if (response.success && response.data) {
      setSubscriptions(response.data.data)
      setTotalPages(response.data.totalPages)
    }
    setLoading(false)
  }

  async function handleAction() {
    if (!actionDialog.subscription || !actionDialog.type) return

    let response
    switch (actionDialog.type) {
      case "lifetime":
        response = await grantLifetimeAccess(actionDialog.subscription.id)
        break
      case "revoke-lifetime":
        response = await revokeLifetimeAccess(actionDialog.subscription.id)
        break
      case "extend-trial":
        response = await extendTrial(actionDialog.subscription.id, trialDays)
        break
      case "activate":
        response = await activateSubscription(actionDialog.subscription.id)
        break
      case "revoke":
        response = await revokeAccess(actionDialog.subscription.id)
        break
    }

    if (response?.success) {
      toast({
        title: "Success",
        description: "Subscription updated successfully",
      })
      fetchSubscriptions()
    } else {
      toast({
        title: "Error",
        description: response?.error || "Failed to update subscription",
        variant: "destructive",
      })
    }

    setActionDialog({ open: false, type: null, subscription: null })
  }

  const openActionDialog = (type: ActionType, subscription: Subscription) => {
    setActionDialog({ open: true, type, subscription })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
        <p className="text-muted-foreground">Manage company subscriptions and access</p>
      </div>

      <Card className="border-l-4 border-l-accent bg-accent/5">
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
          <CardDescription>View and manage all company subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as SubscriptionStatus | "ALL")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="TRIAL">Trial</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Company ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Lifetime</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-12" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-8 w-32 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-mono text-sm">{subscription.companyId.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium">{subscription.plan}</TableCell>
                      <TableCell>
                        <StatusBadge status={subscription.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {subscription.hasLifetimeAccess ? (
                          <Infinity className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!subscription.hasLifetimeAccess ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog("lifetime", subscription)}
                            >
                              <Infinity className="h-4 w-4 mr-2" />
                              Grant Lifetime
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog("revoke-lifetime", subscription)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke Lifetime
                            </Button>
                          )}

                          {subscription.status === "TRIAL" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog("extend-trial", subscription)}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Extend Trial
                            </Button>
                          )}

                          {subscription.status !== "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog("activate", subscription)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </Button>
                          )}

                          {subscription.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openActionDialog("revoke", subscription)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={actionDialog.open}
        onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, subscription: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === "lifetime" && "Grant Lifetime Access"}
              {actionDialog.type === "revoke-lifetime" && "Revoke Lifetime Access"}
              {actionDialog.type === "extend-trial" && "Extend Trial Period"}
              {actionDialog.type === "activate" && "Activate Subscription"}
              {actionDialog.type === "revoke" && "Revoke Access"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === "lifetime" && "This will grant permanent access to the company."}
              {actionDialog.type === "revoke-lifetime" && "This will remove lifetime access from the company."}
              {actionDialog.type === "extend-trial" && "Extend the trial period for this company."}
              {actionDialog.type === "activate" && "This will activate the subscription immediately."}
              {actionDialog.type === "revoke" && "This will revoke access and mark the subscription as cancelled."}
            </DialogDescription>
          </DialogHeader>

          {actionDialog.type === "extend-trial" && (
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                value={trialDays}
                onChange={(e) => setTrialDays(Number.parseInt(e.target.value))}
                min={1}
                max={365}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, type: null, subscription: null })}>
              Cancel
            </Button>
            <Button onClick={handleAction}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
