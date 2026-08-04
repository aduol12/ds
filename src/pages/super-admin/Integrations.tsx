const integrations = [
  { name: "IoT Device Platform", description: "Sensor and gateway telemetry ingestion.", status: "Connected" },
  { name: "SMS Provider", description: "Delivers critical alerts to farmers via SMS.", status: "Connected" },
  { name: "Backend REST API", description: "Core DroughtSmart application data services.", status: "Connected" },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Integrations</h2>
        <p className="mt-1 text-sm text-slate-500">Review platform-level integrations currently connected to DroughtSmart.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {integrations.map((integration) => (
          <div key={integration.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-900">{integration.name}</h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {integration.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{integration.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
