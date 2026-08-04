const modules = [
  { title: "Regenerative Agriculture", description: "Learn practical methods to improve soil health and conserve water." },
  { title: "Syntropic Agroforestry", description: "Explore mixed planting techniques for resilience and biodiversity." },
  { title: "Water Conservation", description: "Simple habits and systems that reduce water waste on the farm." },
];

export default function LearningPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Training</h2>
        <p className="mt-2 text-sm text-slate-500">Use these short modules to improve farm resilience and water use efficiency.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <div key={module.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{module.description}</p>
            <button className="mt-4 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800">
              Start Module
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
