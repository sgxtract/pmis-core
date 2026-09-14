"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type CancelPRState = {
  error?: string;
  success?: boolean;
};

export async function cancelProcurementRequest(
  id: string,
  _previousState: CancelPRState,
  formData: FormData,
): Promise<CancelPRState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const remarks = String(formData.get("remarks") ?? "").trim();

  const { data, error } = await supabase.rpc("cancel_procurement_request", {
    p_request_id: Number(id),
    p_remarks: remarks || null,
  });

  if (error) {
    console.error("CANCEL PR ERROR:", error);

    return {
      error: "Unable to cancel procurement request. Please try again.",
    };
  }

  if (!data?.success) {
    return {
      error: "Unable to cancel procurement request.",
    };
  }

  redirect(`/purchased-requests/${id}`);
}
