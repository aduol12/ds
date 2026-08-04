const roles = ["Super Admin", "Admin", "Agronomist", "Field Technician", "Farmer"];
const categories = ["View", "Create", "Edit", "Delete", "Manage", "Configure", "Approve"];

const matrix: Record<string, boolean[]> = {
  "Super Admin": [true, true, true, true, true, true, true],
  Admin: [true, true, true, false, true, true, true],
  Agronomist: [true, true, false, false, false, false, false],
  "Field Technician": [true, false, true, false, false, false, false],
  Farmer: [true, false, false, false, false, false, false],
};

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Roles & Permissions</h2>
        <p className="mt-1 text-sm text-slate-500">Review and manage what each role can view, create, edit, or configure.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-700">Role</th>
              {categories.map((category) => (
                <th key={category} className="px-5 py-3 text-center font-semibold text-slate-700">{category}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roles.map((role) => (
              <tr key={role}>
                <td className="px-5 py-4 font-medium text-slate-900">{role}</td>
                {matrix[role].map((allowed, index) => (
                  <td key={categories[index]} className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                        allowed ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{allowed ? "check" : "close"}</span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
