const devices = [
  { id: "D-401", name: "Soil Sensor A12", farm: "North Valley Farm", status: "Online", battery: "82%" },
  { id: "D-402", name: "Pump Controller", farm: "Riverbend Acres", status: "Offline", battery: "12%" },
];

export default function FieldTechnicianDevicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Devices</h2>
        <p className="mt-1 text-sm text-slate-500">Devices linked to your assigned farms.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-700">Device</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Farm</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Status</th>
              <th className="px-5 py-3 font-semibold text-slate-700">Battery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {devices.map((device) => (
              <tr key={device.id}>
                <td className="px-5 py-4 text-slate-900">{device.name}</td>
                <td className="px-5 py-4 text-slate-600">{device.farm}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${device.status === "Online" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {device.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-600">{device.battery}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
