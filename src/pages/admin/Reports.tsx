import { useState } from 'react';

const reportTypes = [
  { 
    id: 'system-health', 
    name: "System Health Report", 
    description: "Overview of all devices and sensors status",
    period: "Real-time" 
  },
  { 
    id: 'farm-performance', 
    name: "Farm Performance Report", 
    description: "Aggregated metrics across all farms",
    period: "Last 30 days" 
  },
  { 
    id: 'device-analytics', 
    name: "Device Analytics Report", 
    description: "Detailed sensor data and trends",
    period: "Last 30 days" 
  },
  { 
    id: 'irrigation-efficiency', 
    name: "Irrigation Efficiency Report", 
    description: "Water usage and irrigation patterns",
    period: "Last 30 days" 
  },
  { 
    id: 'alerts-summary', 
    name: "Alerts Summary Report", 
    description: "All critical and warning alerts logged",
    period: "Last 7 days" 
  },
  { 
    id: 'user-activity', 
    name: "User Activity Report", 
    description: "Admin and user access logs",
    period: "Last 30 days" 
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(true);
    try {
      // TODO: Implement actual report generation API call
      console.log('Generating report:', reportId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Download or display report
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-500">Generate and download comprehensive reports on system performance, farm metrics, and alerts.</p>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {reportTypes.map((report) => (
          <div 
            key={report.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedReport(report.id)}
          >
            <h3 className="font-semibold text-slate-900">{report.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{report.description}</p>
            <p className="mt-2 text-xs text-slate-500">Default: {report.period}</p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleGenerateReport(report.id);
              }}
              disabled={isGenerating}
              className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isGenerating && selectedReport === report.id ? 'Generating...' : 'Generate'}
            </button>
          </div>
        ))}
      </div>

      {/* Custom Report Builder */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Custom Report Builder</h3>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-600">
              Report Type
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select a report type...</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>{report.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-600">
              Date Range
              <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="last30">Last 30 Days</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </label>
          </div>

          {/* Custom Date Range */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-600">
              Start Date
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </label>
            <label className="block text-sm text-slate-600">
              End Date
              <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
              Generate Custom Report
            </button>
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Reports</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <p className="text-slate-500">No reports generated yet.</p>
          <p className="text-xs text-slate-400">Generated reports will appear here for easy download and sharing.</p>
        </div>
      </div>
    </div>
  );
}
