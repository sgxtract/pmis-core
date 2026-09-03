import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdministrationPage() {
  await requireAdmin();

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>

          <p className="mt-1 text-sm text-gray-600">
            Manage users and system settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Users */}
          <Link
            href="/administration/users"
            className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              👥
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              User Management
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Create, manage, enable, and disable PMIS user accounts.
            </p>

            <div className="mt-5 text-sm font-semibold text-blue-600">
              Manage Users →
            </div>
          </Link>

          {/* Roles */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              🔐
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              Roles & Permissions
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Manage system roles and access permissions.
            </p>

            <div className="mt-5 text-sm text-gray-400">Coming later</div>
          </div>

          {/* Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
              ⚙️
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-900">
              System Settings
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Configure system-wide PMIS settings.
            </p>

            <div className="mt-5 text-sm text-gray-400">Coming later</div>
          </div>
        </div>
      </div>
    </main>
  );
}
