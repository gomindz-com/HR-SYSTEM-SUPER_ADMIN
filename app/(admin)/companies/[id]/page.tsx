"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Building2, Mail, Hash, MapPin, Users, Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatusBadge } from "@/components/status_badge"
import { getCompanyById, updateCompany } from "@/lib/api"
import type { Company } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function CompanyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Company>>({})

  useEffect(() => {
    async function fetchCompany() {
      const response = await getCompanyById(params.id as string)
      if (response.success && response.data) {
        setCompany(response.data)
        setFormData(response.data)
      }
      setLoading(false)
    }
    fetchCompany()
  }, [params.id])

  const handleSave = async () => {
    if (!company) return

    const response = await updateCompany(company.id, formData)
    if (response.success && response.data) {
      setCompany(response.data)
      setEditing(false)
      toast({
        title: "Success",
        description: "Company details updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: response.error || "Failed to update company",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Company not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{company.name}</h2>
            <p className="text-muted-foreground">Company details and settings</p>
          </div>
        </div>
        <StatusBadge status={company.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Company profile and contact details</CardDescription>
            </div>
            {!editing ? (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditing(false)
                    setFormData(company)
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Company Name
              </Label>
              <Input
                id="name"
                value={editing ? formData.name : company.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editing ? formData.email : company.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tin" className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                TIN
              </Label>
              <Input
                id="tin"
                value={editing ? formData.tin : company.tin}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Address
              </Label>
              <Input
                id="address"
                value={editing ? formData.address || "" : company.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeCount" className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Employee Count
              </Label>
              <Input
                id="employeeCount"
                type="number"
                value={editing ? formData.employeeCount : company.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: Number.parseInt(e.target.value) })}
                disabled={!editing}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created Date
              </Label>
              <Input value={new Date(company.createdAt).toLocaleDateString()} disabled />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-chart-2 bg-chart-2/5">
            <CardHeader>
              <CardTitle>HR Manager</CardTitle>
              <CardDescription>Primary contact for this company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Name</Label>
                <Input
                  value={editing ? formData.hrManagerName || "" : company.hrManagerName || "Not set"}
                  onChange={(e) => setFormData({ ...formData, hrManagerName: e.target.value })}
                  disabled={!editing}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  value={editing ? formData.hrManagerEmail || "" : company.hrManagerEmail || "Not set"}
                  onChange={(e) => setFormData({ ...formData, hrManagerEmail: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </CardContent>
          </Card>

          {company.subscription && (
            <Card className="border-l-4 border-l-accent bg-accent/5">
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Current subscription information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="text-sm font-medium">{company.subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={company.subscription.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm font-medium">
                    {new Date(company.subscription.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <span className="text-sm font-medium">
                    {new Date(company.subscription.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Lifetime Access</span>
                  <span className="text-sm font-medium">{company.subscription.hasLifetimeAccess ? "Yes" : "No"}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
