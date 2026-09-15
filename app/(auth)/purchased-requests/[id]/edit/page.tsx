import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveUser } from "@/lib/auth/require-active-user";

import EditPRForm from "./EditPRForm";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProcurementRequestPage({
  params,
}: PageProps) {
  await requireActiveUser();
  const { id } = await params;

  const supabase = await createClient();

  // -----------------------------------------
  // Get PR
  // -----------------------------------------

  const { data: request, error } = await supabase
    .from("procurement_requests")
    .select(
      `
      id,
      pr_number,
      pr_date,
      reference_id_id,
      type_of_pr,
      end_user,
      particulars,
      abc,
      mode_of_procurement_id,
      account_code,
      calendar_days,
      sol_no
    `,
    )
    .eq("id", id)
    .single();

  if (error || !request) {
    notFound();
  }

  let referenceId: string | null = null;

  if (request.reference_id_id) {
    const { data: reference } = await supabase
      .from("reference_ids")
      .select("reference_id")
      .eq("id", request.reference_id_id)
      .maybeSingle();

    referenceId = reference?.reference_id ?? null;
  }

  // -----------------------------------------
  // Get procurement modes
  // -----------------------------------------

  const { data: procurementModes } = await supabase
    .from("modes_of_procurement")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div>
      {/* Back */}

      <Link
        href={`/purchased-requests/${id}`}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to PR Details
      </Link>

      {/* Heading */}

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Procurement Request
        </h1>

        <p className="mt-2 text-gray-600">
          Update the procurement request information.
        </p>
      </div>

      {/* Form */}

      <EditPRForm
        request={request}
        referenceId={referenceId}
        procurementModes={procurementModes ?? []}
      />
    </div>
  );
}
