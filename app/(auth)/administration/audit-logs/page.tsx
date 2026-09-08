import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

type SearchParams = {
  page?: string;
};

type AuditLog = {
  id: number;
  username: string | null;
  pr_number: string | null;
  module: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();

  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1"));
  const pageSize = 20;

  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const {
    data: auditLogs,
    error,
    count,
  } = await supabase
    .from("audit_logs")
    .select(
      `
      id,
      username,
      pr_number,
      module,
      field_name,
      old_value,
      new_value,
      changed_at
    `,
      {
        count: "exact",
      },
    )
    .order("changed_at", {
      ascending: false,
    })
    .range(from, to);

  if (error) {
    console.error("AUDIT LOGS ERROR:", error);
  }

  const logs = (auditLogs ?? []) as AuditLog[];

  const totalCount = count ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const startRecord = totalCount === 0 ? 0 : from + 1;

  const endRecord = Math.min(from + logs.length, totalCount);

  function buildPageUrl(targetPage: number) {
    return targetPage === 1
      ? "/administration/audit-logs"
      : `/administration/audit-logs?page=${targetPage}`;
  }

  return (
    <div>
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>

        <p className="mt-2 text-gray-600">
          Review changes made to procurement records.
        </p>
      </div>

      {/* Audit Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Change History</h2>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No audit records found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      Date & Time
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      User
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      PR Number
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      Module
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      Field
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      Old Value
                    </th>

                    <th className="whitespace-nowrap px-6 py-3 text-left font-semibold text-gray-700">
                      New Value
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {formatDateTime(log.changed_at)}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {log.username ?? "Unknown"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                        {log.pr_number ?? "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                        {log.module}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {log.field_name}
                      </td>

                      <td className="max-w-xs px-6 py-4 text-gray-500">
                        {log.old_value || "—"}
                      </td>

                      <td className="max-w-xs px-6 py-4 font-medium text-gray-900">
                        {log.new_value || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="font-medium text-gray-700">
                    {startRecord}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-gray-700">{endRecord}</span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {totalCount}
                  </span>{" "}
                  records
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
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400">
                      Previous
                    </span>
                  )}

                  <span className="px-2 text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link
                      href={buildPageUrl(page + 1)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  ) : (
                    <span className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-400">
                      Next
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
