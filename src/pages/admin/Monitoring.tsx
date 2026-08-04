import { useState } from "react";

type TabKey = "soil" | "climate" | "rainfall";

const tabs: { key: TabKey; label: string }[] = [
  { key: "soil", label: "Soil Moisture" },
  { key: "climate", label: "Temperature & Humidity" },
  { key: "rainfall", label: "Rainfall" },
];

const timeRanges = ["24 hours", "7 days", "30 days", "3 months", "1 year"];

const currentReadings: Record<TabKey, { label: string; value: string; status: "Normal" | "Warning" | "Critical" }[]> = {
  soil: [
    { label: "Average soil moisture", value: "68%", status: "Normal" },
    { label: "Lowest reading (Farm 12)", value: "31%", status: "Warning" },
    { label: "Sensors reporting", value: "142 / 150", status: "Normal" },
  ],
  climate: [
    { label: "Average temperature", value: "26.4°C", status: "Normal" },
    { label: "Average humidity", value: "58%", status: "Normal" },
    { label: "Highest temperature (Farm 4)", value: "34.1°C", status: "Warning" },
  ],
  rainfall: [
    { label: "Rainfall (24h)", value: "3.2 mm", status: "Normal" },
    { label: "Rainfall (7d)", value: "18.6 mm", status: "Normal" },
    { label: "Stations reporting rainfall", value: "38 / 45", status: "Normal" },
  ],
};

export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("soil");
  const [timeRange, setTimeRange] = useState(timeRanges[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Environmental Monitoring</h2>
          <p className="mt-1 text-sm text-slate-500">
            Observed, sensor-collected readings from the field. This view does not include weather forecasting.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            <option>All Farms</option>
            <option>North Valley Farm</option>
            <option>Green Ridge Plot</option>
            <option>Riverbend Acres</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
          >
            {timeRanges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {currentReadings[activeTab].map((reading) => (
          <div key={reading.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{reading.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{reading.value}</p>
            <span
              className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                reading.status === "Normal"
                  ? "bg-emerald-100 text-emerald-700"
                  : reading.status === "Warning"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-rose-100 text-rose-700"
              }`}
            >
              {reading.status} · Current reading
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900">Historical Trend</h3>
            <p className="text-sm text-slate-500">Sensor-recorded values over the selected time range ({timeRange}).</p>
          </div>
        </div>
        <div className="flex h-56 items-end gap-2">
          {[45, 60, 55, 70, 65, 72, 68, 74, 69, 71, 66, 73].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-lg bg-emerald-100" style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
