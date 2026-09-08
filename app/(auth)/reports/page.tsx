import { createClient } from "@/lib/supabase/server";
import ReportFilters from "./ReportFilters";

type SearchParams = {
  from?: string;
  to?: string;
};

type StageCount = {
  stage_id: number;
  stage_name: string;
  sequence_number: number;
  request_count: number;
};

type ModeCount = {
  mode_id: number | null;
  mode_name: string;
  request_count: number;
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const from = params.from ?? "";
  const to = params.to ?? "";
  const supabase = await createClient();

  let totalQuery = supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true });

  if (from) {
    totalQuery = totalQuery.gte("pr_date", from);
  }

  if (to) {
    totalQuery = totalQuery.lte("pr_date", to);
  }

  const { count: totalPRs } = await totalQuery;

  let activeQuery = supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Active");

  if (from) {
    activeQuery = activeQuery.gte("pr_date", from);
  }

  if (to) {
    activeQuery = activeQuery.lte("pr_date", to);
  }

  const { count: activePRs } = await activeQuery;

  let completedQuery = supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Completed");

  if (from) {
    completedQuery = completedQuery.gte("pr_date", from);
  }

  if (to) {
    completedQuery = completedQuery.lte("pr_date", to);
  }

  const { count: completedPRs } = await completedQuery;

  let cancelledQuery = supabase
    .from("procurement_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "Cancelled");

  if (from) {
    cancelledQuery = cancelledQuery.gte("pr_date", from);
  }

  if (to) {
    cancelledQuery = cancelledQuery.lte("pr_date", to);
  }

  const { count: cancelledPRs } = await cancelledQuery;

  const { data: stageCountsData } = await supabase.rpc(
    "get_report_stage_counts",
    {
      p_from_date: from || null,
      p_to_date: to || null,
    },
  );

  const stageCounts = (stageCountsData ?? []) as StageCount[];

  const { data: modeCountsData } = await supabase.rpc(
    "get_report_mode_counts",
    {
      p_from_date: from || null,
      p_to_date: to || null,
    },
  );

  const modeCounts = (modeCountsData ?? []) as ModeCount[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

        <p className="mt-2 text-gray-600">
          Procurement reports and summary information.
        </p>
      </div>

      <ReportFilters />

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
            <p className="text-sm font-medium text-gray-500">Total PRs</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalPRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-700">Active PRs</p>

            <p className="mt-2 text-3xl font-bold text-blue-900">
              {activePRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-700">Completed PRs</p>

            <p className="mt-2 text-3xl font-bold text-green-900">
              {completedPRs ?? 0}
            </p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-red-700">Cancelled PRs</p>

            <p className="mt-2 text-3xl font-bold text-red-900">
              {cancelledPRs ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Procurement by Stage */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Procurement by Stage</h2>

          <p className="mt-1 text-sm text-gray-500">
            Number of procurement requests currently at each stage.
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {stageCounts.map((stage) => {
            const count = stage.request_count ?? 0;

            return (
              <div
                key={stage.stage_id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {stage.sequence_number}
                  </span>

                  <span className="font-medium text-gray-900">
                    {stage.stage_name}
                  </span>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Procurement by Mode of Procurement */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Procurement by Mode of Procurement
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Number of procurement requests by procurement mode.
          </p>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {modeCounts.map((mode) => {
            const count = mode.request_count ?? 0;

            return (
              <div
                key={mode.mode_id ?? "unassigned"}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              >
                <p className="font-medium text-gray-900">{mode.mode_name}</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Procurement request{count === 1 ? "" : "s"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
