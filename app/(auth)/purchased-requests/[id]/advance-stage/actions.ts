"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type AdvanceStageState = {
  error?: string;
};

export async function advanceProcurementStage(
  requestId: string,
  _previousState: AdvanceStageState,
  formData: FormData
): Promise<AdvanceStageState> {
  const supabase = await createClient();

  // -----------------------------------------
  // Check authenticated user
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // -----------------------------------------
  // Get remarks
  // -----------------------------------------

  const remarks = String(
    formData.get("remarks") ?? ""
  ).trim();

  // -----------------------------------------
  // Call PostgreSQL function
  // -----------------------------------------

  const { data, error } = await supabase.rpc(
    "advance_procurement_stage",
    {
      p_request_id: Number(requestId),
      p_remarks: remarks || null,
    }
  );

  if (error) {
    console.error(
      "ADVANCE STAGE ERROR:",
      error
    );

    return {
      error:
        error.message ||
        "Unable to move the procurement request to the next stage.",
    };
  }

  console.log(
    "ADVANCE STAGE RESULT:",
    data
  );

  // -----------------------------------------
  // Successful transition
  // -----------------------------------------

  redirect(
    `/purchased-requests/${requestId}`
  );
}