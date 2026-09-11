import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{
    referenceId: string;
  }>;
};

type ProcurementRequest = {
  id: number;
  pr_number: string;
  pr_date: string;
  particulars: string | null;
  abc: number | null;
  mode_of_procurement: string | null;
  current_stage: string | null;
  status: string | null;
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

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function ReferenceIdPage({ params }: PageProps) {
  const { referenceId } = await params;

  const decodedReferenceId = decodeURIComponent(referenceId).trim();

  if (!decodedReferenceId) {
    notFound();
  }

  const supabase = await createClient();

  const { data: requests, error } = await supabase.rpc(
    "get_procurements_by_reference_id",
    {
      p_reference_id: decodedReferenceId,
    },
  );

  if (error) {
    console.error("REFERENCE ID REQUEST ERROR:", error);

    return (
      <div className="w-full">
        <Link
          href="/purchased-requests"
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Back to Purchased Requests
        </Link>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load procurement requests for this Reference ID.
        </div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    notFound();
  }

  return (
    <div className="w-full">
      {/* Back Link */}
      <Link
        href="/purchased-requests"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Purchased Requests
      </Link>

      {/* Page Header */}
      <div className="mt-6">
        <p className="text-sm font-medium text-blue-600">Reference ID</p>

        <h1 className="mt-1 wrap-break-word text-2xl font-bold text-gray-900 sm:text-3xl">
          {decodedReferenceId}
        </h1>

        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Procurement requests associated with this Reference ID.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-6 rounded-xl border bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
        <p className="text-sm text-gray-500">Related Procurement Requests</p>

        <p className="mt-1 text-2xl font-bold text-gray-900">
          {requests.length}
        </p>
      </div>

      {/* Requests */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b px-4 py-4 sm:px-6">
          <h2 className="font-semibold text-gray-900">Procurement Requests</h2>
        </div>

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
                  Mode
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
              {requests.map((request: ProcurementRequest) => (
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
                    {request.mode_of_procurement || "Not Assigned"}
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
      </div>
    </div>
  );
}
