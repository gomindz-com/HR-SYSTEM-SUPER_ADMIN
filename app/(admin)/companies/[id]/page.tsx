"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Users,
  MapPin,
  Briefcase,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  Clock,
  FileText,
  ArrowLeft,
  Activity,
  Settings,
  Globe,
  Timer,
  Map,
  Hash,
} from "lucide-react";
import useCompanyDetailStore, {
  type Employee,
  type Department,
  type Location,
  type WorkdayConfig,
} from "@/store/company.store";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { company, detailLoading, fetchCompanyDetail } =
    useCompanyDetailStore();

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetail(params.id as string);
    }
  }, [params.id, fetchCompanyDetail]);

  if (detailLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Company not found</p>
        </div>
      </div>
    );
  }

  const trialInfo = company.trialInfo;
  const subscription = company.subscription;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "TRIAL":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </button>
          <h1 className="text-3xl font-bold tracking-tight">
            Company Details
          </h1>
          <p className="text-muted-foreground">
            View comprehensive information about this company
          </p>
        </div>
      </div>

      {/* Trial Warning Banner */}
      {trialInfo?.isTrial && !trialInfo.isExpired && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">
                  Trial Period Active
                </p>
                <p className="text-sm text-yellow-700">
                  {trialInfo.daysRemaining}{" "}
                  {trialInfo.daysRemaining === 1 ? "day" : "days"} remaining
                  until {new Date(trialInfo.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expired Trial Banner */}
      {trialInfo?.isExpired && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">
                  Trial Period Expired
                </p>
                <p className="text-sm text-red-700">
                  Trial ended on{" "}
                  {new Date(trialInfo.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Overview
              </CardTitle>
              <CardDescription>
                Basic company information and contact details
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {company.hasLifetimeAccess && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  Lifetime Access
                </Badge>
              )}
              {subscription && (
                <Badge className={getStatusColor(subscription.subscriptionStatus)}>
                  {subscription.subscriptionStatus}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Company Name</p>
              <p className="font-semibold">
                {company.companyName || (
                  <span className="italic text-muted-foreground">Not set</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {company.companyEmail || (
                  <span className="italic text-muted-foreground">Not set</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">TIN Number</p>
              <p className="font-semibold flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                {company.companyTin || (
                  <span className="italic text-muted-foreground">Not set</span>
                )}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-semibold flex items-center gap-2">
                <Map className="w-4 h-4 text-muted-foreground" />
                {company.companyAddress || (
                  <span className="italic text-muted-foreground">Not set</span>
                )}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">
                {company.companyDescription || (
                  <span className="italic text-muted-foreground">No description</span>
                )}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Timezone</p>
              <p className="font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                {company.timezone != null && company.timezone !== ""
                  ? company.timezone
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-semibold">
                {company.createdAt
                  ? new Date(company.createdAt).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Employees
                </p>
                <p className="text-3xl font-bold">{company._count.employees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Departments
                </p>
                <p className="text-3xl font-bold">
                  {company._count.departments}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Locations</p>
                <p className="text-3xl font-bold">{company._count.locations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Attendances
                </p>
                <p className="text-3xl font-bold">
                  {company._count.attendances}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Attendance Settings
          </CardTitle>
          <CardDescription>
            Work hours and attendance configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Morning Shift Start
              </p>
              <p className="font-semibold">
                {company.workStartTime != null && company.workStartTime !== ""
                  ? company.workStartTime
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Morning Shift End
              </p>
              <p className="font-semibold">
                {company.workEndTime != null && company.workEndTime !== ""
                  ? company.workEndTime
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Evening Shift Start
              </p>
              <p className="font-semibold">
                {company.workStartTime2 != null && company.workStartTime2 !== ""
                  ? company.workStartTime2
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Evening Shift End
              </p>
              <p className="font-semibold">
                {company.workEndTime2 != null && company.workEndTime2 !== ""
                  ? company.workEndTime2
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Morning Late Threshold (minutes)</p>
              <p className="font-semibold">
                {company.lateThreshold != null
                  ? `${company.lateThreshold} min`
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Morning Check-in Deadline (minutes)</p>
              <p className="font-semibold">
                {company.checkInDeadline != null
                  ? `${company.checkInDeadline} min`
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Evening Late Threshold (minutes)</p>
              <p className="font-semibold">
                {company.lateThreshold2 != null
                  ? `${company.lateThreshold2} min`
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Evening Check-in Deadline (minutes)</p>
              <p className="font-semibold">
                {company.checkInDeadline2 != null
                  ? `${company.checkInDeadline2} min`
                  : <span className="italic text-muted-foreground">Not set</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* HR Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                HR Contact
              </CardTitle>
              <CardDescription>
                Primary HR representative for this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              {company.hr ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">
                      {company.hr.firstName || "Not set"}{" "}
                      {company.hr.lastName || ""}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {company.hr.email || (
                        <span className="italic text-muted-foreground">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {company.hr.phoneNumber || (
                        <span className="italic text-muted-foreground">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic py-4">
                  No HR contact assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Employees */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Employees ({company.employees.length})
              </CardTitle>
              <CardDescription>
                Latest employees added to the company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {company.employees.map((employee: Employee) => (
                  <div
                    key={employee.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {(employee.firstName?.[0] || "N")}
                          {(employee.lastName?.[0] || "")}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold">
                          {employee.firstName || "Not set"}{" "}
                          {employee.lastName || ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {employee.position || (
                            <span className="italic">No position</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        employee.employeeStatus === "ACTIVE"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : employee.employeeStatus === "INACTIVE"
                          ? "bg-gray-100 text-gray-800 border-gray-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {employee.employeeStatus || "Not set"}
                    </Badge>
                  </div>
                ))}
                {company.employees.length === 0 && (
                  <p className="text-muted-foreground text-center py-8 italic">
                    No employees found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Departments ({company.departments.length})
              </CardTitle>
              <CardDescription>
                All departments within this company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.departments.map((dept: Department) => (
                  <div
                    key={dept.id}
                    className="p-4 bg-muted/50 rounded-lg border"
                  >
                    <p className="font-semibold mb-1">
                      {dept.departmentName || "Not set"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dept._count.employees}{" "}
                      {dept._count.employees === 1 ? "employee" : "employees"}
                    </p>
                  </div>
                ))}
                {company.departments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8 col-span-2 italic">
                    No departments found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Subscription Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Current subscription and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Plan Type</p>
                    <p className="font-semibold">
                      {subscription.planType || "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={getStatusColor(subscription.subscriptionStatus)}
                    >
                      {subscription.subscriptionStatus || "Not set"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-semibold">
                      {subscription.startDate
                        ? new Date(subscription.startDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-semibold">
                      {subscription.endDate
                        ? new Date(subscription.endDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic py-4">
                  No subscription information
                </p>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations ({company.locations.length})
              </CardTitle>
              <CardDescription>
                Company office locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {company.locations.map((location: Location) => (
                  <div
                    key={location.id}
                    className="p-4 bg-muted/50 rounded-lg border"
                  >
                    <p className="font-semibold">
                      {location.locationName != null && location.locationName !== ""
                        ? location.locationName
                        : <span className="italic text-muted-foreground">Not set</span>}
                    </p>
                    {location.address ? (
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.address}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        No address
                      </p>
                    )}
                  </div>
                ))}
                {company.locations.length === 0 && (
                  <p className="text-muted-foreground text-center py-8 italic">
                    No locations found
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Overview
              </CardTitle>
              <CardDescription>
                Company activity statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Attendances</span>
                  <span className="font-bold text-lg">
                    {company._count.attendances}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Leave Requests</span>
                  <span className="font-bold text-lg">
                    {company._count.leaveRequests}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workday Configuration */}
          {company.WorkdayDaysConfig.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Workday Schedule
                </CardTitle>
                <CardDescription>
                  Weekly workday configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {company.WorkdayDaysConfig.map((day: WorkdayConfig) => (
                    <div
                      key={day.id}
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="font-medium">{day.dayOfWeek}</span>
                      {day.isWorkday ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
