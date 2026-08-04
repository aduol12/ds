export default function FarmerDetailsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Farmer Profile</h2>
        <p className="mt-2 text-sm text-slate-500">Detailed visibility into farm productivity, irrigation, and live conditions.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Farmer Information</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Full Name</p>
              <p className="mt-1 font-semibold text-slate-900">Amina Otieno</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-1 font-semibold text-slate-900">+254 712 000 111</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Location</p>
              <p className="mt-1 font-semibold text-slate-900">Nakuru County</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Account Status</p>
              <p className="mt-1 font-semibold text-slate-900">Active</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Current Conditions</h3>
          <div className="mt-4 space-y-3">
            {[
              ["Soil moisture", "72%"],
              ["Temperature", "27°C"],
              ["Rainfall", "3.2 mm"],
              ["Humidity", "61%"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
