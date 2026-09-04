import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  search?: string;
  mode?: string;
  stage?: string;
  status?: string;
  page?: string;
};

type PublicProcurement = {
  id: number;
  pr_number: string;
  pr_date: string;
  particulars: string | null;
  abc: number | null;
  mode_of_procurement: string | null;
  current_stage: string | null;
  status: string | null;
  total_count: number;
};

type FilterOptions = {
  modes: string[];
  stages: string[];
  statuses: string[];
};

const PAGE_SIZE = 20;

function buildPageUrl({
  search,
  mode,
  stage,
  status,
  page,
}: {
  search?: string;
  mode?: string;
  stage?: string;
  status?: string;
  page: number;
}) {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (mode) {
    params.set("mode", mode);
  }

  if (stage) {
    params.set("stage", stage);
  }

  if (status) {
    params.set("status", status);
  }

  params.set("page", String(page));

  return `/procurements?${params.toString()}`;
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "—";
  }

  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClass(status: string | null) {
  switch (status?.toLowerCase()) {
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

  return "bg-blue-50 text-blue-700";
}

export default async function PublicProcurementsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const mode = params.mode?.trim() ?? "";
  const stage = params.stage?.trim() ?? "";
  const status = params.status?.trim() ?? "";

  const requestedPage = Number(params.page ?? "1");

  const currentPage =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const supabase = await createClient();

  const [
    { data: procurementData, error: procurementError },
    { data: filterData, error: filterError },
  ] = await Promise.all([
    supabase.rpc("get_public_procurements", {
      p_search: search || null,
      p_mode: mode || null,
      p_stage: stage || null,
      p_status: status || null,
      p_page: currentPage,
      p_page_size: PAGE_SIZE,
    }),

    supabase.rpc("get_public_procurement_filter_options"),
  ]);

  if (procurementError) {
    console.error("Public procurements error:", procurementError);
  }

  if (filterError) {
    console.error("Public filter options error:", filterError);
  }

  const procurements = (procurementData ?? []) as PublicProcurement[];

  const filterOptions: FilterOptions = {
    modes: filterData?.[0]?.modes ?? [],
    stages: filterData?.[0]?.stages ?? [],
    statuses: filterData?.[0]?.statuses ?? [],
  };

  const totalCount =
    procurements.length > 0 ? Number(procurements[0].total_count) : 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;

  const endRecord = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-5">
          <Image
            src="/sorsogon-logo.png"
            alt="Sorsogon Province Logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Province of Sorsogon
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Public Procurement Information
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Search and Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Search Procurement
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search by PR Number or Particulars / Project Name.
            </p>
          </div>

          <form method="GET" action="/procurements" className="mt-5">
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Search procurement
                </label>

                <input
                  id="search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Enter PR Number or Project Name..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>

              {(search || mode || stage || status) && (
                <Link
                  href="/procurements"
                  className="rounded-lg border border-gray-300 px-6 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </Link>
              )}
            </div>

            {/* Filters */}
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div>
                <label
                  htmlFor="mode"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Mode of Procurement
                </label>

                <select
                  id="mode"
                  name="mode"
                  defaultValue={mode}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Modes</option>

                  {filterOptions.modes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="stage"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Current Stage
                </label>

                <select
                  id="stage"
                  name="stage"
                  defaultValue={stage}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Stages</option>

                  {filterOptions.stages.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={status}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">All Statuses</option>

                  {filterOptions.statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Procurement Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Publicly available procurement information.
              </p>
            </div>

            {totalCount > 0 && (
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium text-gray-800">{startRecord}</span>{" "}
                – <span className="font-medium text-gray-800">{endRecord}</span>{" "}
                of{" "}
                <span className="font-medium text-gray-800">
                  {totalCount.toLocaleString("en-PH")}
                </span>
              </p>
            )}
          </div>

          {procurements.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-medium text-gray-900">
                No procurement requests found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

              {(search || mode || stage || status) && (
                <Link
                  href="/procurements"
                  className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Clear search and filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        PR Number
                      </th>

                      <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        PR Date
                      </th>

                      <th className="min-w-45 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Particulars / Project Name
                      </th>

                      <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        ABC
                      </th>

                      <th className="min-w-45 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Mode of Procurement
                      </th>

                      <th className="min-w-45 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Current Stage
                      </th>

                      <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="whitespace-nowrap px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {procurements.map((pr) => (
                      <tr key={pr.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {pr.pr_number}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {formatDate(pr.pr_date)}
                        </td>

                        <td className="max-w-md px-6 py-4 text-sm text-gray-700">
                          {pr.particulars ?? "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                          {formatCurrency(pr.abc)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {pr.mode_of_procurement ?? "—"}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {pr.current_stage ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStageClass(
                                pr.current_stage,
                              )}`}
                            >
                              {pr.current_stage}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          {pr.status ? (
                            <span
                              className={`inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 inset-ring inset-ring-green-500/20 ${getStatusClass(
                                pr.status,
                              )}`}
                            >
                              {pr.status}
                            </span>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <Link
                            href={`/procurements/${pr.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  {hasPreviousPage ? (
                    <Link
                      href={buildPageUrl({
                        search,
                        mode,
                        stage,
                        status,
                        page: currentPage - 1,
                      })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400">
                      Previous
                    </span>
                  )}

                  <div className="hidden items-center gap-1 sm:flex">
                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter((page) => {
                        if (totalPages <= 7) {
                          return true;
                        }

                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, index, pages) => {
                        const previousPage = pages[index - 1];

                        const showEllipsis =
                          previousPage && page - previousPage > 1;

                        return (
                          <div key={page} className="flex items-center gap-1">
                            {showEllipsis && (
                              <span className="px-1 text-gray-400">...</span>
                            )}

                            <Link
                              href={buildPageUrl({
                                search,
                                mode,
                                stage,
                                status,
                                page,
                              })}
                              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                page === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </Link>
                          </div>
                        );
                      })}
                  </div>

                  {hasNextPage ? (
                    <Link
                      href={buildPageUrl({
                        search,
                        mode,
                        stage,
                        status,
                        page: currentPage + 1,
                      })}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-400">
                      Next
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
