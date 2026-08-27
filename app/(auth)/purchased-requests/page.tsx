import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function PurchasedRequestsPage() {
  const supabase = await createClient();

  const {
    data: requests,
    error,
  } = await supabase
    .from("procurement_requests")
    .select(`
      id,
      pr_number,
      pr_date,
      type_of_pr,
      end_user,
      particulars,
      abc,
      mode_of_procurement_id,
      current_stage_id,
      status
    `)
    .order("pr_date", { ascending: false });

    const { data: stages } = await supabase
      .from("procurement_stages")
      .select("id, name");

      // const { data: procurementModes } = await supabase
      // .from("modes_of_procurement")
      // .select("id, name");

      const stageMap = new Map(
      stages?.map((stage) => [stage.id, stage.name])
    );

  if (error) {
    console.error("PROCUREMENT REQUEST ERROR:", error);

    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Purchased Requests
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load procurement requests.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Purchased Requests
          </h1>

          <p className="mt-2 text-gray-600">
            Manage and monitor procurement requests.
          </p>
        </div>

        <Link
          href="/purchased-requests/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New PR
        </Link>

        {/* <button
          disabled
          className="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600"
        >
          + New PR
        </button> */}
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm">

        <div className="border-b p-4">
          <input
            type="text"
            placeholder="Search PR Number..."
            disabled
            className="placeholder-gray-400 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none"
          />
        </div>

        {requests && requests.length > 0 ? (
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">

                <tr>
                  <th className="px-6 py-4">
                    PR Number
                  </th>

                  <th className="px-6 py-4">
                    PR Date
                  </th>

                  <th className="px-6 py-4">
                    Type of PR
                  </th>

                  <th className="px-6 py-4">
                    ABC
                  </th>

                  <th className="px-6 py-4">
                    Stage
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y">

                {requests.map((request) => (

                  <tr
                    key={request.id}
                    className="hover:bg-gray-50"
                  >

                    <td className="px-6 py-4">
                      <Link
                        href={`/purchased-requests/${request.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {request.pr_number}
                      </Link>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {new Intl.DateTimeFormat("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      }).format(new Date(request.pr_date))}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {request.type_of_pr || "—"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {request.abc !== null
                        ? new Intl.NumberFormat("en-PH", {
                            style: "currency",
                            currency: "PHP",
                          }).format(request.abc)
                        : "—"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {stageMap.get(request.current_stage_id) || "Unknown"}
                    </td>

                    <td className="px-6 py-4">

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                        {request.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        ) : (

          <div className="p-12 text-center">

            <p className="text-gray-500">
              No procurement requests found.
            </p>

          </div>

        )}

      </div>
    </div>
  );
}