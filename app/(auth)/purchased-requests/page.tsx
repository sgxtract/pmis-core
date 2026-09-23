import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PurchasedRequestsFilters from "@/components/procurement/PurchasedRequestsFilters";

type SearchParams = {
  search?: string;
  mode?: string;
  stage?: string;
  status?: string;
  type_of_pr?: string;
  date_from?: string;
  date_to?: string;
  page?: string;
};

type PurchasedRequest = {
  id: number;
  pr_number: string;
  pr_date: string;
  particulars: string | null;
  abc: number | null;
  reference_id: string | null;
  mode_of_procurement: string | null;
  current_stage: string | null;
  status: string | null;
  total_count: number;
};

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

function getStageClass(stage: string | null) {
  if (!stage) {
    return "bg-gray-100 text-gray-700";
  }

  if (stage.toLowerCase() === "completed") {
    return "bg-green-100 text-green-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default async function PurchasedRequestsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = params.search ?? "";
  const mode = params.mode ?? "";
  const stage = params.stage ?? "";
  const status = params.status ?? "";
  const typeOfPr = params.type_of_pr ?? "";
  const dateFrom = params.date_from ?? "";
  const dateTo = params.date_to ?? "";
  const page = Number(params.page ?? "1");

  const supabase = await createClient();

  const { data: modes } = await supabase
    .from("modes_of_procurement")
    .select("name")
    .order("name");

  const { data: stages } = await supabase
    .from("procurement_stages")
    .select("name, sequence_number")
    .order("sequence_number");

  const { data: statusRows } = await supabase
    .from("procurement_requests")
    .select("status")
    .not("status", "is", null);

  const { data: typeOfPrRows } = await supabase
    .from("procurement_requests")
    .select("type_of_pr")
    .not("type_of_pr", "is", null)
    .order("type_of_pr");

  const typeOfPrOptions = Array.from(
    new Set(
      (typeOfPrRows ?? [])
        .map((row) => row.type_of_pr)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const modeOptions = [...new Set((modes ?? []).map((item) => item.name))];

  const stageOptions = [...new Set((stages ?? []).map((item) => item.name))];

  const statusOptions = [
    ...new Set((statusRows ?? []).map((item) => item.status)),
  ];

  const { data: requests, error } = await supabase.rpc(
    "get_purchased_requests",
    {
      p_search: search || null,
      p_mode: mode || null,
      p_stage: stage || null,
      p_status: status || null,
      p_type_of_pr: typeOfPr || null,
      p_date_from: dateFrom || null,
      p_date_to: dateTo || null,
      p_page: page,
      p_page_size: 20,
    },
  );

  const totalCount = requests?.[0]?.total_count ?? 0;
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);
  const currentPageCount = requests?.length ?? 0;

  const startResult = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;

  const endResult =
    totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);

  function buildPageUrl(targetPage: number) {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (mode) params.set("mode", mode);
    if (stage) params.set("stage", stage);
    if (status) params.set("status", status);

    params.set("page", String(targetPage));

    return `/purchased-requests?${params.toString()}`;
  }

  if (error) {
    console.error("PROCUREMENT REQUEST ERROR:", error);

    return (
      <div className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Purchased Requests
            </h1>

            <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
              Manage and monitor procurement requests.
            </p>
          </div>

          <Link
            href="/purchased-requests"
            className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
          >
            Try Again
          </Link>
        </div>

        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 sm:mt-8"
        >
          <h2 className="text-sm font-semibold text-red-800">
            Unable to load procurement requests
          </h2>

          <p className="mt-1 text-sm text-red-700">
            Something went wrong while loading the procurement request list.
            Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Purchased Requests
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Manage and monitor procurement requests.
          </p>

          <p className="mt-1 text-xs font-medium text-gray-500">
            {totalCount === 0
              ? "No procurement requests found"
              : `Showing ${currentPageCount} of ${totalCount} procurement ${
                  totalCount === 1 ? "request" : "requests"
                }`}
          </p>
        </div>

        <Link
          href="/purchased-requests/new"
          className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          + New PR
        </Link>
      </div>

      {/* Procurement Requests Card */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm sm:mt-8">
        {/* Search Area */}
        <div className="border-b px-4 py-3 sm:px-5">
          <PurchasedRequestsFilters
            modes={modeOptions}
            stages={stageOptions}
            statuses={statusOptions}
            typeOfPrs={typeOfPrOptions}
          />
        </div>

        {/* Table */}
        {requests && requests.length > 0 ? (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-225 w-full text-left text-xs">
                <thead className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      PR Number
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      Reference ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      PR Date
                    </th>

                    <th className="px-4 py-3 sm:px-6 sm:py-4">Particulars</th>

                    <th className="whitespace-nowrap px-4 py-3 text-right sm:px-6 sm:py-4">
                      ABC
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      Stage
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((request: PurchasedRequest) => (
                    <tr
                      key={request.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                        <Link
                          href={`/purchased-requests/${request.id}`}
                          className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {request.pr_number}
                        </Link>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                        {request.reference_id ? (
                          <Link
                            href={`/purchased-requests/reference/${encodeURIComponent(
                              request.reference_id,
                            )}`}
                            className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                          >
                            {request.reference_id}
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-6 sm:py-4">
                        {new Intl.DateTimeFormat("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }).format(new Date(request.pr_date))}
                      </td>

                      <td className="max-w-87.5 px-4 py-3 text-gray-700 sm:px-6 sm:py-4">
                        <div
                          className="line-clamp-2"
                          title={request.particulars || undefined}
                        >
                          {request.particulars || "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-right text-gray-700 sm:px-6 sm:py-4">
                        {request.abc !== null
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(request.abc)
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStageClass(
                            request.current_stage,
                          )}`}
                        >
                          {request.current_stage || "Unknown"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusClass(
                            request.status,
                          )}`}
                        >
                          {request.status || "Unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y md:hidden">
              {requests.map((request: PurchasedRequest) => (
                <div
                  key={request.id}
                  className="p-4 transition-colors hover:bg-gray-50"
                >
                  {/* PR Number + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        PR Number
                      </p>

                      <Link
                        href={`/purchased-requests/${request.id}`}
                        className="mt-1 block wrap-break-word text-base font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {request.pr_number}
                      </Link>
                    </div>

                    <span
                      className={`shrink-0 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusClass(
                        request.status,
                      )}`}
                    >
                      {request.status || "Unknown"}
                    </span>
                  </div>

                  {/* Reference ID */}
                  {request.reference_id && (
                    <div className="mt-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Reference ID
                      </p>

                      <Link
                        href={`/purchased-requests/reference/${encodeURIComponent(
                          request.reference_id,
                        )}`}
                        className="mt-1 inline-flex max-w-full break-all rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                      >
                        {request.reference_id}
                      </Link>
                    </div>
                  )}

                  {/* PR Details */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {/* PR Date */}
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        PR Date
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {new Intl.DateTimeFormat("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                        }).format(new Date(request.pr_date))}
                      </p>
                    </div>

                    {/* ABC */}
                    <div className="min-w-0 text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        ABC
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-gray-700">
                        {request.abc !== null
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(request.abc)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Particulars */}
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Particulars
                    </p>

                    <p className="mt-1 text-sm leading-5 text-gray-700">
                      {request.particulars || "—"}
                    </p>
                  </div>

                  {/* Stage */}
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Current Stage
                    </p>

                    <span
                      className={`mt-1 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStageClass(
                        request.current_stage,
                      )}`}
                    >
                      {request.current_stage || "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                {/* Result Information */}
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium text-gray-900">
                    {startResult}–{endResult}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-900">
                    {totalCount}
                  </span>
                </p>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between gap-2 sm:justify-end">
                  {page > 1 ? (
                    <Link
                      href={buildPageUrl(page - 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      ← Previous
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                      ← Previous
                    </span>
                  )}

                  <span className="px-2 text-sm text-gray-600">
                    Page{" "}
                    <span className="font-medium text-gray-900">{page}</span> of{" "}
                    <span className="font-medium text-gray-900">
                      {totalPages}
                    </span>
                  </span>

                  {page < totalPages ? (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next →
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-400">
                      Next →
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <span className="text-xl text-gray-400">⌕</span>
            </div>

            <h2 className="mt-4 text-sm font-semibold text-gray-900 sm:text-base">
              No procurement requests found
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
              No procurement requests match your current search or filters. Try
              changing your search criteria or clearing the filters.
            </p>

            {(search || mode || stage || status) && (
              <Link
                href="/purchased-requests"
                className="mt-4 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Search & Filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
