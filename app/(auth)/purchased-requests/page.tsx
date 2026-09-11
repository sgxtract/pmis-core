import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PurchasedRequestsFilters from "@/components/procurement/PurchasedRequestsFilters";

type SearchParams = {
  search?: string;
  mode?: string;
  stage?: string;
  status?: string;
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
      p_page: page,
      p_page_size: 20,
    },
  );

  const totalCount = requests?.[0]?.total_count ?? 0;
  const pageSize = 20;
  const totalPages = Math.ceil(totalCount / pageSize);

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
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Purchased Requests
        </h1>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mt-6">
          Unable to load procurement requests.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Purchased Requests
          </h1>

          <p className="mt-1 text-sm text-gray-600 sm:mt-2 sm:text-base">
            Manage and monitor procurement requests.
          </p>
        </div>

        <Link
          href="/purchased-requests/new"
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
        >
          + New PR
        </Link>
      </div>

      {/* Procurement Requests Card */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm sm:mt-8">
        {/* Search Area */}
        <div className="border-b p-4 sm:p-5">
          <PurchasedRequestsFilters
            modes={modeOptions}
            stages={stageOptions}
            statuses={statusOptions}
          />
        </div>

        {/* Table */}
        {requests && requests.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-225 w-full text-left text-sm">
                <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
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

                    <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
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
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                        <Link
                          href={`/purchased-requests/${request.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
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

                      <td className="max-w-87.5 px-4 py-3 text-gray-600 sm:px-6 sm:py-4">
                        <div className="line-clamp-2">
                          {request.particulars || "—"}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-6 sm:py-4">
                        {request.abc !== null
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(request.abc)
                          : "—"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 sm:px-6 sm:py-4">
                        {request.current_stage || "Unknown"}
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

            {totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={buildPageUrl(page - 1)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                      Previous
                    </span>
                  )}

                  {page < totalPages ? (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
                      Next
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center sm:p-12">
            <p className="text-sm text-gray-500 sm:text-base">
              No procurement requests found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
