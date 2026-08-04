import { Link } from "react-router-dom";

export default function Forbidden403Page() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
        403 Forbidden
      </p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        You don&apos;t have access to this page
      </h1>
      <p className="mt-2 max-w-md text-slate-600">
        Your account is signed in, but this route is restricted to a different
        role. Use the navigation for your workspace or contact an administrator.
      </p>
      <Link
        to="/login"
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Back to sign in
      </Link>
    </div>
  );
}
