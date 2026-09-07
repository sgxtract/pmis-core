import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get procurement statistics
  const { count: totalPRs } = await supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true });

  const { count: activePRs } = await supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  const { count: completedPRs } = await supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Completed");

  // Get total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Get procurement stage counts
  const { data: stageCounts } = await supabase
    .from("procurement_stages")
    .select(
      `
      id,
      name,
      sequence_number,
      procurement_requests(count)
    `,
    )
    .order("sequence_number");

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

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalPRs ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Active PRs</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {activePRs ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Completed</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {completedPRs ?? 0}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Users</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalUsers ?? 0}
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">
              Procurement Stage Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Number of procurement requests currently at each stage.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {(stageCounts ?? []).map((stage) => {
              const count = stage.procurement_requests?.[0]?.count ?? 0;

              return (
                <div
                  key={stage.id}
                  className="flex items-center justify-between px-6 py-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">{stage.name}</p>
                  </div>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
