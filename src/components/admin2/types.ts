export type NavItem = {
  label: string;
  icon: string;
  active?: boolean;
};

export type KpiTrend = {
  label: string;
  tone: "positive" | "warning";
};

export type KpiCardData = {
  title: string;
  value: string;
  icon: string;
  iconTone?: "primary" | "secondary" | "error" | "warning";
  trend?: KpiTrend;
  accent?: "primary" | "error";
};

export type AlertLevel = "CRITICAL" | "WARNING";

export type AlertData = {
  level: AlertLevel;
  title: string;
  meta: string;
  icon: string;
};

export type DeviceStatusData = {
  label: string;
  valueLabel: string;
  percentage: number;
  tone: "primary" | "error";
};
