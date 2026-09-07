import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

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

export default async function AuditLogsPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: auditLogs, error } = await supabase
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
    )
    .order("changed_at", {
      ascending: false,
    });

  if (error) {
    console.error("AUDIT LOGS ERROR:", error);
  }

  const logs = (auditLogs ?? []) as AuditLog[];

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
        )}
      </div>
    </div>
  );
}
