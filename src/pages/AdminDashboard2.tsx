import Admin2Sidebar from "../components/admin2/Admin2Sidebar";
import Admin2Topbar from "../components/admin2/Admin2Topbar";
import DeviceStatusCard from "../components/admin2/DeviceStatusCard";
import FloatingActionButton from "../components/admin2/FloatingActionButton";
import KpiCard from "../components/admin2/KpiCard";
import LiveAlertsPanel from "../components/admin2/LiveAlertsPanel";
import RegionalMonitoringCard from "../components/admin2/RegionalMonitoringCard";
import WaterUsageChart from "../components/admin2/WaterUsageChart";
import { AlertData, DeviceStatusData, KpiCardData, NavItem } from "../components/admin2/types";

const navItems: NavItem[] = [
  { label: "Dashboard", icon: "dashboard", active: true },
  { label: "Users", icon: "group" },
  { label: "Farms", icon: "agriculture" },
  { label: "Devices", icon: "router" },
  { label: "Irrigation Control", icon: "water_drop" },
  { label: "Monitoring", icon: "monitoring" },
  { label: "Alerts", icon: "notifications_active" },
  { label: "Field Operations", icon: "assignment" },
  { label: "Reports", icon: "assessment" },
  { label: "Settings", icon: "settings" },
];

const kpiCards: KpiCardData[] = [
  {
    title: "Total Farmers",
    value: "1,240",
    icon: "person",
    iconTone: "primary",
    trend: { label: "+2%", tone: "positive" },
  },
  { title: "Active Farms", value: "850", icon: "eco", iconTone: "primary" },
  {
    title: "Devices Online",
    value: "3,120",
    icon: "sensors",
    iconTone: "primary",
    accent: "primary",
  },
  {
    title: "Devices Offline",
    value: "45",
    icon: "sensors_off",
    iconTone: "error",
    accent: "error",
  },
  { title: "Water Usage (Daily)", value: "12.4M L", icon: "water", iconTone: "secondary" },
  {
    title: "Active Alerts",
    value: "12",
    icon: "warning",
    iconTone: "warning",
  },
];

const alerts: AlertData[] = [
  {
    level: "CRITICAL",
    title: "Device ID #402 Offline",
    meta: "2 mins ago • Sector A-12",
    icon: "wifi_off",
  },
  {
    level: "WARNING",
    title: "Low Soil Moisture - Sector 4",
    meta: "15 mins ago • South Vineyard",
    icon: "opacity",
  },
  {
    level: "CRITICAL",
    title: "Pump Failure - North Field",
    meta: "1 hour ago • Zone B4",
    icon: "settings_input_component",
  },
];

const waterUsageBars = [40, 60, 85, 70, 55, 90, 75];

const deviceStatus: DeviceStatusData[] = [
  { label: "Online", valueLabel: "3,120 (98.5%)", percentage: 98.5, tone: "primary" },
  { label: "Offline", valueLabel: "45 (1.5%)", percentage: 1.5, tone: "error" },
];

function AdminDashboard2() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] text-[#191c1e]">
      <Admin2Sidebar navItems={navItems} />

      <main className="ml-0 min-h-screen lg:ml-64">
        <Admin2Topbar />

        <div className="p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-[#191c1e]">Dashboard Overview</h2>
            <p className="text-sm text-[#42493e]">Real-time telemetry and network health status.</p>
          </div>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {kpiCards.map((card) => (
              <KpiCard key={card.title} data={card} />
            ))}
          </section>

          <section className="grid grid-cols-12 gap-4">
            <RegionalMonitoringCard />
            <LiveAlertsPanel alerts={alerts} />
            <WaterUsageChart bars={waterUsageBars} />
            <DeviceStatusCard statuses={deviceStatus} />
          </section>
        </div>
      </main>

      <FloatingActionButton />
    </div>
  );
}

export default AdminDashboard2;
