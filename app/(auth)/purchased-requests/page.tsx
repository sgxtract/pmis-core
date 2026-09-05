import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PurchasedRequestsPage() {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("procurement_requests")
    .select(
      `
      id,
      pr_number,
      pr_date,
      particulars,
      end_user,
      abc,
      mode_of_procurement_id,
      current_stage_id,
      status
    `,
    )
    .order("pr_date", { ascending: false });

  const { data: stages } = await supabase
    .from("procurement_stages")
    .select("id, name");

  const stageMap = new Map(stages?.map((stage) => [stage.id, stage.name]));

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
          <input
            type="text"
            placeholder="Search PR Number..."
            disabled
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Table */}
        {requests && requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-225 w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                    PR Number
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
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      <Link
                        href={`/purchased-requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {request.pr_number}
                      </Link>
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
                      {stageMap.get(request.current_stage_id) || "Unknown"}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 sm:px-6 sm:py-4">
                      <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-500 inset-ring inset-ring-green-500/20">
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
