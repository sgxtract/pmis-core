import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get currently logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get PMIS profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, office, role_id")
    .eq("id", user?.id)
    .single();

  // Get user's role
  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile?.role_id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome to the Procurement Management Information System.
      </p>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Logged in as</p>

        <p className="mt-1 text-lg font-semibold text-gray-900">
          {profile?.full_name || user?.email}
        </p>

        <p className="mt-2 text-sm text-gray-500">Email: {user?.email}</p>

        <p className="mt-1 text-sm text-gray-500">
          Office: {profile?.office || "Not assigned"}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          Role: {role?.name || "Not assigned"}
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total PRs</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Completed</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Users</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">0</p>
        </div>
      </div>
    </div>
  );
}
