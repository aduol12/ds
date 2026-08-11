import { Navigate, Route, Routes } from "react-router-dom";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { AgronomistLayout } from "@/layouts/AgronomistLayout";
import { FieldTechnicianLayout } from "@/layouts/FieldTechnicianLayout";
import { FarmerLayout } from "@/layouts/FarmerLayout";
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import AdminDashboardPage from "@/pages/admin/Dashboard";
import AdminUsersPage from "@/pages/admin/Users";
import AdminDevicesPage from "@/pages/admin/Devices";
import AdminDeviceDetailPage from "@/pages/admin/DeviceDetail";
import AdminAnalyticsPage from "@/pages/admin/Analytics";
import AdminAlertsPage from "@/pages/admin/Alerts";
import AdminSettingsPage from "@/pages/admin/Settings";
import AdminFarmersPage from "@/pages/admin/Farmers";
import AdminFarmerDetailsPage from "@/pages/admin/FarmerDetails";
import AdminFarmsPage from "@/pages/admin/Farms";
import AdminIrrigationPage from "@/pages/admin/Irrigation";
import AdminMonitoringPage from "@/pages/admin/Monitoring";
import AdminWeatherPage from "@/pages/admin/Weather";
import AdminSoilPage from "@/pages/admin/Soil";
import AdminSensorsPage from "@/pages/admin/Sensors";
import AdminFieldOperationsPage from "@/pages/admin/FieldOperations";
import AdminReportsPage from "@/pages/admin/Reports";
import SuperAdminDashboardPage from "@/pages/super-admin/Dashboard";
import OrganizationsPage from "@/pages/super-admin/Organizations";
import AdminsPage from "@/pages/super-admin/Admins";
import BillingPage from "@/pages/super-admin/Billing";
import SecurityPage from "@/pages/super-admin/Security";
import RolesPermissionsPage from "@/pages/super-admin/RolesPermissions";
import AuditLogsPage from "@/pages/super-admin/AuditLogs";
import IntegrationsPage from "@/pages/super-admin/Integrations";
import SystemSettingsPage from "@/pages/super-admin/SystemSettings";
import SuperAdminProfilePage from "@/pages/super-admin/Profile";
import StaffProfilePage from "@/pages/staff/StaffProfile";
import AgronomistDashboardPage from "@/pages/agronomist/Dashboard";
import AgronomistFarmsPage from "@/pages/agronomist/Farms";
import AgronomistMonitoringPage from "@/pages/agronomist/Monitoring";
import AgronomistIrrigationPage from "@/pages/agronomist/Irrigation";
import AgronomistAlertsPage from "@/pages/agronomist/Alerts";
import AgronomistReportsPage from "@/pages/agronomist/Reports";
import AgronomistProfilePage from "@/pages/agronomist/Profile";
import FieldTechnicianDashboardPage from "@/pages/field-technician/Dashboard";
import FieldTechnicianTasksPage from "@/pages/field-technician/Tasks";
import FieldTechnicianAssignedFarmsPage from "@/pages/field-technician/AssignedFarms";
import FieldTechnicianDevicesPage from "@/pages/field-technician/Devices";
import FieldTechnicianMaintenancePage from "@/pages/field-technician/Maintenance";
import FieldTechnicianAlertsPage from "@/pages/field-technician/Alerts";
import FieldTechnicianFieldReportsPage from "@/pages/field-technician/FieldReports";
import FieldTechnicianProfilePage from "@/pages/field-technician/Profile";
import FarmerHomePage from "@/pages/farmer/Home";
import FarmerProfilePage from "@/pages/farmer/Profile";
import FarmerIrrigationPage from "@/pages/farmer/Irrigation";
import FarmerNotificationsPage from "@/pages/farmer/Notifications";
import FarmerMyFarmPage from "@/pages/farmer/MyFarm";
import FarmerLearningPage from "@/pages/farmer/Learning";
import Forbidden403Page from "@/pages/errors/Forbidden403";
import NotFound from "@/pages/NotFound";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute, RoleGuard } from "@/routes/RoleGuard";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/403" element={<Forbidden403Page />} />

      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/farmers" element={<AdminFarmersPage />} />
            <Route path="/admin/farmers/:farmerId" element={<AdminFarmerDetailsPage />} />
            <Route path="/admin/farms" element={<AdminFarmsPage />} />
            <Route path="/admin/devices" element={<AdminDevicesPage />} />
            <Route path="/admin/devices/:id" element={<AdminDeviceDetailPage />} />
            <Route path="/admin/devices/:deviceId/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/irrigation" element={<AdminIrrigationPage />} />
            <Route path="/admin/monitoring" element={<AdminMonitoringPage />} />
            <Route path="/admin/monitoring/weather" element={<AdminWeatherPage />} />
            <Route path="/admin/monitoring/soil" element={<AdminSoilPage />} />
            <Route path="/admin/monitoring/sensors" element={<AdminSensorsPage />} />
            <Route path="/admin/alerts" element={<AdminAlertsPage />} />
            <Route path="/admin/field-operations" element={<AdminFieldOperationsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            <Route path="/admin/profile" element={<StaffProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard roles={["SUPER_ADMIN"]} />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboardPage />} />
            <Route path="/super-admin/users" element={<AdminUsersPage />} />
            <Route path="/super-admin/farmers" element={<AdminFarmersPage />} />
            <Route path="/super-admin/farmers/:farmerId" element={<AdminFarmerDetailsPage />} />
            <Route path="/super-admin/farms" element={<AdminFarmsPage />} />
            <Route path="/super-admin/devices" element={<AdminDevicesPage />} />
            <Route path="/super-admin/devices/:id" element={<AdminDeviceDetailPage />} />
            <Route path="/super-admin/devices/:deviceId/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/super-admin/irrigation" element={<AdminIrrigationPage />} />
            <Route path="/super-admin/monitoring" element={<AdminMonitoringPage />} />
            <Route path="/super-admin/alerts" element={<AdminAlertsPage />} />
            <Route path="/super-admin/field-operations" element={<AdminFieldOperationsPage />} />
            <Route path="/super-admin/reports" element={<AdminReportsPage />} />
            <Route path="/super-admin/organizations" element={<OrganizationsPage />} />
            <Route path="/super-admin/admins" element={<AdminsPage />} />
            <Route path="/super-admin/billing" element={<BillingPage />} />
            <Route path="/super-admin/security" element={<SecurityPage />} />
            <Route path="/super-admin/roles-permissions" element={<RolesPermissionsPage />} />
            <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="/super-admin/integrations" element={<IntegrationsPage />} />
            <Route path="/super-admin/system-settings" element={<SystemSettingsPage />} />
            <Route path="/super-admin/settings" element={<SystemSettingsPage />} />
            <Route path="/super-admin/profile" element={<SuperAdminProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard roles={["AGRONOMIST"]} />}>
          <Route element={<AgronomistLayout />}>
            <Route path="/agronomist" element={<AgronomistDashboardPage />} />
            <Route path="/agronomist/dashboard" element={<AgronomistDashboardPage />} />
            <Route path="/agronomist/farms" element={<AgronomistFarmsPage />} />
            <Route path="/agronomist/farms/:farmId" element={<AgronomistFarmsPage />} />
            <Route path="/agronomist/monitoring" element={<AgronomistMonitoringPage />} />
            <Route path="/agronomist/irrigation" element={<AgronomistIrrigationPage />} />
            <Route path="/agronomist/alerts" element={<AgronomistAlertsPage />} />
            <Route path="/agronomist/reports" element={<AgronomistReportsPage />} />
            <Route path="/agronomist/profile" element={<AgronomistProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard roles={["FIELD_TECHNICIAN"]} />}>
          <Route element={<FieldTechnicianLayout />}>
            <Route path="/field-technician" element={<FieldTechnicianDashboardPage />} />
            <Route path="/field-technician/dashboard" element={<FieldTechnicianDashboardPage />} />
            <Route path="/field-technician/tasks" element={<FieldTechnicianTasksPage />} />
            <Route path="/field-technician/farms" element={<FieldTechnicianAssignedFarmsPage />} />
            <Route path="/field-technician/devices" element={<FieldTechnicianDevicesPage />} />
            <Route path="/field-technician/maintenance" element={<FieldTechnicianMaintenancePage />} />
            <Route path="/field-technician/alerts" element={<FieldTechnicianAlertsPage />} />
            <Route path="/field-technician/reports" element={<FieldTechnicianFieldReportsPage />} />
            <Route path="/field-technician/profile" element={<FieldTechnicianProfilePage />} />
          </Route>
        </Route>

        <Route element={<RoleGuard roles={["FARMER"]} />}>
          <Route element={<FarmerLayout />}>
            <Route path="/farmer" element={<FarmerHomePage />} />
            <Route path="/farmer/home" element={<FarmerHomePage />} />
            <Route path="/farmer/farm" element={<FarmerMyFarmPage />} />
            <Route path="/farmer/monitoring" element={<FarmerMyFarmPage />} />
            <Route
              path="/farmer/irrigation"
              element={<FarmerIrrigationPage />}
            />
            <Route
              path="/farmer/notifications"
              element={<FarmerNotificationsPage />}
            />
            <Route path="/farmer/learning" element={<FarmerLearningPage />} />
            <Route path="/farmer/advisory" element={<FarmerLearningPage />} />
            <Route path="/farmer/alerts" element={<FarmerNotificationsPage />} />
            <Route path="/farmer/profile" element={<FarmerProfilePage />} />
            <Route path="/farmer/settings" element={<FarmerProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/devices" element={<Navigate to="/admin/devices" replace />} />
      <Route path="/settings" element={<Navigate to="/admin/alerts" replace />} />
      <Route path="/profile" element={<Navigate to="/farmer/profile" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

