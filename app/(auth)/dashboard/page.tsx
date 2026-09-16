import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function getStatusClass(status: string | null) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getStatusCardClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "border-blue-200 bg-blue-50";

    case "completed":
      return "border-green-200 bg-green-50";

    case "cancelled":
    case "canceled":
      return "border-red-200 bg-red-50";

    case "pending":
      return "border-yellow-200 bg-yellow-50";

    default:
      return "border-gray-200 bg-gray-50";
  }
}

function getStageClass(stage: string | null) {
  if (!stage) {
    return "bg-gray-100 text-gray-700";
  }

  if (stage === "Completed") {
    return "bg-green-100 text-green-700";
  }

  return "bg-blue-100 text-blue-700";
}

function getStageName(
  stage: { name: string | null } | { name: string | null }[] | null | undefined,
) {
  if (Array.isArray(stage)) {
    return stage[0]?.name ?? null;
  }

  return stage?.name ?? null;
}

export default async function DashboardPage() {
  // await new Promise((resolve) => setTimeout(resolve, 3000));
  // throw new Error("TEST DASHBOARD ERROR");

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

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <p className="mt-2 text-gray-600">
        Welcome to the Procurement Management Information System.
      </p>

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
            Current procurement requests across the procurement workflow.
          </p>
        </div>

        <div className="overflow-x-auto px-6 py-8">
          <div className="min-w-225">
            <div className="relative">
              {/* Connecting workflow line */}
              <div className="absolute left-0 right-0 top-5 h-1 rounded-full bg-gray-200" />

              <div className="relative grid grid-flow-col auto-cols-fr">
                {(stageCounts ?? []).map((stage, index) => {
                  const count = stage.procurement_requests?.[0]?.count ?? 0;
                  const isCompleted = stage.name === "Completed";
                  const hasRequests = count > 0;

                  return (
                    <Link
                      key={stage.id}
                      href={`/purchased-requests?stage=${encodeURIComponent(stage.name ?? "")}`}
                      className="group relative flex flex-col items-center"
                    >
                      {/* Stage node */}
                      <div
                        className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm transition ${
                          isCompleted
                            ? "bg-green-600"
                            : hasRequests
                              ? "bg-blue-600"
                              : "bg-gray-300"
                        }`}
                      >
                        <span className="text-xs font-bold text-white">
                          {index + 1}
                        </span>
                      </div>

                      {/* Stage information */}
                      <div className="mt-4 text-center">
                        <div className="flex h-12 items-start justify-center">
                          <p className="max-w-32.5 text-sm font-semibold leading-5 text-gray-900 group-hover:text-blue-600">
                            {stage.name}
                          </p>
                        </div>

                        <p
                          className={`mt-1 text-2xl font-bold ${
                            isCompleted
                              ? "text-green-600"
                              : hasRequests
                                ? "text-blue-600"
                                : "text-gray-400"
                          }`}
                        >
                          {count}
                        </p>

                        <p className="text-xs text-gray-500">
                          {count === 1 ? "PR" : "PRs"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Total Procurement Requests:{" "}
              <span className="font-semibold text-gray-900">
                {totalPRs ?? 0}
              </span>
            </p>

            <Link
              href="/purchased-requests"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All →
            </Link>
          </div>
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
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              No procurement requests found.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              New procurement requests will appear here once they are recorded.
            </p>
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
                {(recentPRs ?? []).map((request) => {
                  const stageName = getStageName(request.procurement_stages);

                  return (
                    <tr
                      key={request.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/purchased-requests/${request.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {request.pr_number}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {new Date(request.pr_date).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="max-w-md px-6 py-4 text-gray-900">
                        <div
                          className="truncate"
                          title={request.particulars || ""}
                        >
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

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStageClass(
                            stageName,
                          )}`}
                        >
                          {stageName || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            request.status,
                          )}`}
                        >
                          {request.status || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Procurement Status Overview */}
      {/* Procurement Status Overview */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Procurement Status Overview
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Summary of procurement requests by current status.
            </p>
          </div>

          <Link
            href="/purchased-requests"
            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All →
          </Link>
        </div>

        {Object.keys(statusCounts).length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              No procurement status data available.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Status information will appear here once procurement requests are
              recorded.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Link
                key={status}
                href={`/purchased-requests?status=${encodeURIComponent(status)}`}
                className={`rounded-lg border p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${getStatusCardClass(
                  status,
                )}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-700">
                    {status}
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      status,
                    )}`}
                  >
                    View
                  </span>
                </div>

                <p className="mt-4 text-3xl font-bold text-gray-900">{count}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Procurement request{count === 1 ? "" : "s"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Active procurement requests requiring attention */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View All Active →
          </Link>
        </div>

        {attentionPRs?.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">
              No active procurement requests require attention.
            </p>

            <p className="mt-1 text-sm text-gray-500">
              All active procurement requests are currently accounted for.
            </p>
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
                {(attentionPRs ?? []).map((request) => {
                  const stageName = getStageName(request.procurement_stages);

                  return (
                    <tr
                      key={request.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/purchased-requests/${request.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {request.pr_number}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {new Date(request.pr_date).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="max-w-md px-6 py-4 text-gray-900">
                        <div
                          className="truncate"
                          title={request.particulars || ""}
                        >
                          {request.particulars || "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStageClass(
                            stageName,
                          )}`}
                        >
                          {stageName || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/purchased-requests/${request.id}`}
                          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                        >
                          Review PR
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
