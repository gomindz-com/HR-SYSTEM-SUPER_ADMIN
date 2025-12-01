"use client";
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  FileText
} from 'lucide-react';
import useCompanyDetailStore from '@/store/company.store';

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { company, detailLoading, fetchCompanyDetail } = useCompanyDetailStore();

  useEffect(() => {
    if (params.id) {
      fetchCompanyDetail(params.id as string);
    }
  }, [params.id, fetchCompanyDetail]);

  if (detailLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Company not found</p>
        </div>
      </div>
    );
  }

  const trialInfo = company.trialInfo;
  const subscription = company.subscription;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-flex items-center gap-2"
          >
            ← Back
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{company.companyName}</h1>
                  {company.companyDescription && (
                    <p className="text-gray-600 mt-2">{company.companyDescription}</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {company.hasLifetimeAccess && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Lifetime Access
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.subscriptionStatus === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : subscription?.subscriptionStatus === 'TRIAL'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {subscription?.subscriptionStatus || 'No Subscription'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Warning Banner */}
        {trialInfo?.isTrial && !trialInfo.isExpired && (
          <div className={`rounded-lg p-4 mb-6 ${
            trialInfo.daysRemaining <= 3 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                trialInfo.daysRemaining <= 3 
                  ? 'bg-red-100' 
                  : 'bg-yellow-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  trialInfo.daysRemaining <= 3 
                    ? 'text-red-600' 
                    : 'text-yellow-600'
                }`} />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  trialInfo.daysRemaining <= 3 
                    ? 'text-red-800' 
                    : 'text-yellow-800'
                }`}>
                  Trial Period Active
                </p>
                <p className={`text-sm ${
                  trialInfo.daysRemaining <= 3 
                    ? 'text-red-700' 
                    : 'text-yellow-700'
                }`}>
                  {trialInfo.daysRemaining} {trialInfo.daysRemaining === 1 ? 'day' : 'days'} remaining until {new Date(trialInfo.endDate).toLocaleDateString()}
                </p>
              </div>
              <button className={`px-4 py-2 rounded-lg font-medium text-sm ${
                trialInfo.daysRemaining <= 3 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } text-white`}>
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Expired Trial Banner */}
        {trialInfo?.isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Trial Period Expired</p>
                <p className="text-sm text-red-700">
                  Trial ended on {new Date(trialInfo.endDate).toLocaleDateString()}. Upgrade to continue.
                </p>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm">
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{company._count.employees}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Departments</p>
                <p className="text-3xl font-bold text-gray-900">{company._count.departments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Locations</p>
                <p className="text-3xl font-bold text-gray-900">{company._count.locations}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Attendances</p>
                <p className="text-3xl font-bold text-gray-900">{company._count.attendances}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* HR Information */}
            {company.hr && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  HR Contact
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-900">{company.hr.firstName} {company.hr.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {company.hr.email}
                    </p>
                  </div>
                  {company.hr.phoneNumber && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {company.hr.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Employees */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Recent Employees ({company.employees.length})
              </h2>
              <div className="space-y-3">
                {company.employees.map((employee:any) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold">
                          {employee.firstName[0]}{employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{employee.firstName} {employee.lastName}</p>
                        <p className="text-sm text-gray-600">{employee.position || 'No position'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      employee.employeeStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : employee.employeeStatus === 'INACTIVE'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {employee.employeeStatus}
                    </span>
                  </div>
                ))}
                {company.employees.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No employees found</p>
                )}
              </div>
            </div>

            {/* Departments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                Departments ({company.departments.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {company.departments.map((dept:any) => (
                  <div key={dept.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{dept.departmentName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {dept._count.employees} {dept._count.employees === 1 ? 'employee' : 'employees'}
                    </p>
                  </div>
                ))}
                {company.departments.length === 0 && (
                  <p className="text-gray-500 text-center py-4 col-span-2">No departments found</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Subscription Info */}
            {subscription && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Subscription Details
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Plan Type</p>
                    <p className="font-medium text-gray-900">{subscription.planType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      subscription.subscriptionStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : subscription.subscriptionStatus === 'TRIAL'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.subscriptionStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(subscription.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Locations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Locations ({company.locations.length})
              </h2>
              <div className="space-y-3">
                {company.locations.map((location:any) => (
                  <div key={location.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{location.locationName}</p>
                    {location.address && (
                      <p className="text-sm text-gray-600 mt-1">{location.address}</p>
                    )}
                  </div>
                ))}
                {company.locations.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No locations found</p>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Activity Overview
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Attendances</span>
                  <span className="font-semibold text-gray-900">{company._count.attendances}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Leave Requests</span>
                  <span className="font-semibold text-gray-900">{company._count.leaveRequests}</span>
                </div>
              </div>
            </div>

            {/* Workday Configuration */}
            {company.WorkdayDaysConfig.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Workday Schedule
                </h2>
                <div className="space-y-2">
                  {company.WorkdayDaysConfig.map((day:any) => (
                    <div key={day.id} className="flex justify-between items-center">
                      <span className="text-gray-700">{day.dayOfWeek}</span>
                      {day.isWorkday ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}