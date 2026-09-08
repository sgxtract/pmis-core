import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
  const supabase = await createClient();

  const { count: totalPRs } = await supabase
    .from("procurement_requests")
    .select("*", {
      count: "exact",
      head: true,
    });

  const { count: activePRs } = await supabase
    .from("procurement_requests")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "Active");

  const { count: completedPRs } = await supabase
    .from("procurement_requests")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "Completed");

  const { count: cancelledPRs } = await supabase
    .from("procurement_requests")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "Cancelled");

  return (
    <div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Reports
        </h1>

        <p className="mt-2 text-gray-600">
          Procurement reports and summary information.
        </p>
      </div>

      {/* Procurement Summary */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">
          Procurement Summary
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Overview of procurement requests by status.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total PRs
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalPRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">
              Active PRs
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-900">
              {activePRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">
              Completed PRs
            </p>

            <p className="mt-2 text-3xl font-bold text-green-900">
              {completedPRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">
              Cancelled PRs
            </p>

            <p className="mt-2 text-3xl font-bold text-red-900">
              {cancelledPRs ?? 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}