import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import ReportFilters from "./ReportFilters";
import PrintReportButton from "./PrintReportButton";
import StageDistributionChart from "./StageDistributionChart";
import ModeDistributionChart from "./ModeDistributionChart";
import StatusDistributionChart from "./StatusDistributionChart";
import ABCByModeChart from "./ABCByModeChart";

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

type ModeABC = {
  mode_id: number | null;
  mode_name: string;
  total_abc: number;
};

function formatReportDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const from = params.from ?? "";
  const to = params.to ?? "";

  let reportingPeriod = "All Time";

  if (from && to) {
    reportingPeriod = `${formatReportDate(from)} – ${formatReportDate(to)}`;
  } else if (from) {
    reportingPeriod = `From ${formatReportDate(from)}`;
  } else if (to) {
    reportingPeriod = `Up to ${formatReportDate(to)}`;
  }

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

  const statusCounts = [
    {
      status_name: "Active",
      request_count: activePRs ?? 0,
    },
    {
      status_name: "Completed",
      request_count: completedPRs ?? 0,
    },
    {
      status_name: "Cancelled",
      request_count: cancelledPRs ?? 0,
    },
  ];

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

  let abcQuery = supabase.from("procurement_requests").select("abc");

  if (from) {
    abcQuery = abcQuery.gte("pr_date", from);
  }

  if (to) {
    abcQuery = abcQuery.lte("pr_date", to);
  }

  const { data: abcRows } = await abcQuery;

  const totalABC = (abcRows ?? []).reduce(
    (sum, row) => sum + Number(row.abc ?? 0),
    0,
  );

  const { data: modeABCData } = await supabase.rpc("get_report_mode_abc", {
    p_from_date: from || null,
    p_to_date: to || null,
  });

  const modeABC = (modeABCData ?? []) as ModeABC[];

  return (
    <div className="min-w-0 w-full max-w-full space-y-6 print:space-y-4">
      <div className="hidden print:block">
        <div className="mb-5 flex items-center gap-4 border-b border-gray-300 pb-4">
          <Image
            src="/sorsogon-logo.png"
            alt="Sorsogon Province"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />

          <div>
            <p className="text-sm font-medium text-gray-600">
              Provincial Bids and Awards Committee
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Province of Sorsogon
            </h1>

            <p className="mt-1 text-sm text-gray-500">Procurement Report</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Reporting Period
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {reportingPeriod}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Procurement Requests
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {totalPRs ?? 0}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Total Approved Budget (ABC)
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatCurrency(totalABC)}
            </p>
          </div>
        </div>
      </div>

      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            Procurement analytics and summary information.
          </p>
        </div>

        <PrintReportButton />
      </div>

      <div className="print:hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-gray-900">
            Report Filters
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a reporting period to update the procurement analysis.
          </p>
        </div>

        <ReportFilters />
      </div>

      {/* Reporting Period and Total PRs */}
      <div className="print:hidden min-w-0 w-full rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reporting Period
            </p>

            <p className="mt-1 text-base font-semibold text-gray-900 sm:text-lg">
              {reportingPeriod}
            </p>
          </div>

          <div className="border-t border-gray-100 pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Procurement Requests
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {totalPRs ?? 0}
            </p>
          </div>
        </div>
      </div>

      {(totalPRs ?? 0) === 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="font-medium text-yellow-800">
            No procurement requests found
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            There are no procurement requests within the selected reporting
            period.
          </p>
        </div>
      )}

      {/* Procurement Summary */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Key Metrics
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Current procurement request totals by status.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 print:*:mt-0 print:grid-cols-4">
          {/* Total */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Total PRs</p>

              <span className="h-2.5 w-2.5 rounded-full bg-gray-400" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {totalPRs ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              All procurement requests
            </p>
          </div>

          {/* Active */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Active PRs</p>

              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {activePRs ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-500">Currently in progress</p>
          </div>

          {/* Completed */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Completed PRs</p>

              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {completedPRs ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-500">Successfully completed</p>
          </div>

          {/* Cancelled */}
          <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Cancelled PRs</p>

              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
              {cancelledPRs ?? 0}
            </p>

            <p className="mt-1 text-xs text-gray-500">Cancelled requests</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">
          Financial Overview
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Approved Budget of procurement requests within the selected reporting
          period.
        </p>

        <div className="mt-4">
          <div className="relative min-w-0 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Approved Budget (ABC)
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {formatCurrency(totalABC)}
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Combined ABC of all procurement requests in the selected
                  period.
                </p>
              </div>

              <div className="hidden h-16 w-px bg-gray-200 sm:block" />

              <div className="sm:min-w-48 sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Reporting Period
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                  {reportingPeriod}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ABC by Procurement Mode */}
      <div className="mt-10 print:break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            ABC by Procurement Mode
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Comparison of approved budget amounts across procurement modes.
          </p>
        </div>

        <div className="p-4 sm:p-6 print:hidden hidden md:block">
          <ABCByModeChart
            data={modeABC
              .filter((mode) => Number(mode.total_abc) > 0)
              .map((mode) => ({
                mode_name: mode.mode_name,
                total_abc: Number(mode.total_abc),
              }))}
          />
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {modeABC.map((mode) => (
            <div
              key={mode.mode_id ?? "unassigned"}
              className="rounded-lg border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="min-h-10 text-sm font-medium leading-5 text-gray-600">
                  {mode.mode_name}
                </p>

                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
              </div>

              <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                {formatCurrency(Number(mode.total_abc ?? 0))}
              </p>

              <p className="mt-1 text-xs text-gray-500">Total ABC</p>
            </div>
          ))}
        </div>
      </div>

      {/* Procurement by Status */}
      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Procurement by Status
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Distribution of procurement requests by current status.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <StatusDistributionChart
            data={statusCounts.filter((status) => status.request_count > 0)}
          />
        </div>
      </div>

      {/* Procurement by Stage */}
      <div className="mt-10 print:break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Procurement by Stage
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Number of procurement requests currently at each stage.
          </p>
        </div>

        <div className="p-4 sm:p-6 print:hidden">
          <StageDistributionChart
            data={stageCounts.map((stage) => ({
              stage_name: stage.stage_name,
              request_count: stage.request_count,
            }))}
          />
        </div>

        <div className="divide-y divide-gray-100">
          {stageCounts.map((stage) => {
            const count = stage.request_count ?? 0;

            return (
              <div
                key={stage.stage_id}
                className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {stage.sequence_number}
                  </span>

                  <span className="min-w-0 truncate font-medium text-gray-900">
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
      <div className="mt-10 print:break-inside-avoid overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Procurement by Mode
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Number of procurement requests by procurement mode.
          </p>
        </div>

        <div className="p-4 sm:p-6">
          <ModeDistributionChart
            data={modeCounts
              .filter((mode) => mode.request_count > 0)
              .map((mode) => ({
                mode_name: mode.mode_name,
                request_count: mode.request_count,
              }))}
          />
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4">
          {modeCounts.map((mode) => {
            const count = mode.request_count ?? 0;

            return (
              <div
                key={mode.mode_id ?? "unassigned"}
                className="rounded-lg border border-gray-200 bg-gray-50 p-5"
              >
                <p className="min-h-10 text-sm font-medium leading-5 text-gray-600">
                  {mode.mode_name}
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">{count}</p>

                <p className="mt-1 text-xs text-gray-500">
                  Procurement request{count === 1 ? "" : "s"}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="hidden print:block border-t border-gray-300 pt-3 mt-8">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div>
            <p className="font-semibold text-gray-700">Province of Sorsogon</p>
            <p>Provincial Bids and Awards Committee</p>
          </div>

          <div className="text-right">
            <p>
              Report generated on{" "}
              {new Date().toLocaleString("en-PH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
