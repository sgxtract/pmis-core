import Link from "next/link";
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

  const { count: cancelledPRs } = await supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Cancelled");

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

  // Get recent procurement requests
  const { data: recentPRs } = await supabase
    .from("procurement_requests")
    .select(
      `
      id,
      pr_number,
      pr_date,
      particulars,
      abc,
      status,
      procurement_stages (
        name
      )
    `,
    )
    .order("pr_date", { ascending: false })
    .order("id", { ascending: false })
    .limit(5);

  // Get procurement status counts
  const { data: statusRows } = await supabase
    .from("procurement_requests")
    .select("status");

  const statusCounts = (statusRows ?? []).reduce<Record<string, number>>(
    (counts, request) => {
      const status = request.status?.trim() || "Unknown";

      counts[status] = (counts[status] ?? 0) + 1;

      return counts;
    },
    {},
  );

  const maxStageCount = Math.max(
    1,
    ...(stageCounts ?? []).map(
      (stage) => stage.procurement_requests?.[0]?.count ?? 0,
    ),
  );

  // Get active procurement requests requiring attention
  const { data: attentionPRs } = await supabase
    .from("procurement_requests")
    .select(
      `
      id,
      pr_number,
      pr_date,
      particulars,
      status,
      procurement_stages (
        name
      )
    `,
    )
    .eq("status", "Active")
    .order("pr_date", { ascending: true })
    .order("id", { ascending: true })
    .limit(5);

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
        <Link
          href="/purchased-requests"
          className="block rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">Total PRs</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalPRs ?? 0}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            View all procurement requests →
          </p>
        </Link>

        <Link
          href="/purchased-requests?status=Active"
          className="block rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">Active PRs</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {activePRs ?? 0}
          </p>

          <p className="mt-2 text-xs text-gray-500">View active requests →</p>
        </Link>

        <Link
          href="/purchased-requests?status=Completed"
          className="block rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">Completed</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {completedPRs ?? 0}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            View completed requests →
          </p>
        </Link>

        <Link
          href="/purchased-requests?status=Cancelled"
          className="block rounded-xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-medium text-gray-500">Cancelled PRs</p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {cancelledPRs ?? 0}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            View cancelled requests →
          </p>
        </Link>
      </div>

      {/* Procurement Stage Overview */}
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

            const percentage = (count / maxStageCount) * 100;

            return (
              <div key={stage.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="min-w-0 truncate font-medium text-gray-900">
                    {stage.name}
                  </p>

                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    {count}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent procurement request */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Recent Procurement Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              The latest procurement requests recorded in the system.
            </p>
          </div>

          <Link
            href="/purchased-requests"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All →
          </Link>
        </div>

        {recentPRs?.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No procurement requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    PR Number
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Particulars
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-right font-semibold text-gray-700">
                    ABC
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    Stage
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {(recentPRs ?? []).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <a
                        href={`/purchased-requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {request.pr_number}
                      </a>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {new Date(request.pr_date).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="max-w-md px-6 py-4 text-gray-900">
                      <div className="truncate">
                        {request.particulars || "—"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right text-gray-900">
                      {request.abc !== null
                        ? `₱${Number(request.abc).toLocaleString("en-PH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {request.procurement_stages?.[0]?.name ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {request.status || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Procurement Status Overview */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Procurement Status Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Summary of procurement requests by current status.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div
              key={status}
              className="rounded-lg border border-gray-200 bg-gray-50 p-5"
            >
              <p className="text-sm font-medium text-gray-500">{status}</p>

              <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>

              <p className="mt-1 text-xs text-gray-500">
                Procurement request{count === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Active procurement requests requiring attention */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Requests Requiring Attention
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Active procurement requests that may need review or action.
            </p>
          </div>

          <Link
            href="/purchased-requests?status=Active"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All Active →
          </Link>
        </div>

        {attentionPRs?.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No active procurement requests require attention.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    PR Number
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    PR Date
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-700">
                    Particulars
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    Current Stage
                  </th>

                  <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {(attentionPRs ?? []).map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <a
                        href={`/purchased-requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {request.pr_number}
                      </a>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {new Date(request.pr_date).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    <td className="max-w-md px-6 py-4 text-gray-900">
                      <div className="truncate">
                        {request.particulars || "—"}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {request.procurement_stages?.[0]?.name ?? "—"}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <a
                        href={`/purchased-requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View PR
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
