import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      office,
      role_id,
      is_active,
      roles (
        name
      )
    `,
    )
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage PMIS user accounts.
            </p>
          </div>

          <Link
            href="/administration/users/create"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Create User
          </Link>
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Office
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users?.map((user) => {
                  const role = Array.isArray(user.roles)
                    ? user.roles[0]
                    : user.roles;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {user.full_name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.office || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {role?.name || "Not assigned"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {user.is_active ? (
                          <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/administration/users/${user.id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
