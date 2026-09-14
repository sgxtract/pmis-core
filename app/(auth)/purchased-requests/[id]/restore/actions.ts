"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type RestorePRState = {
  error?: string;
  success?: boolean;
};

export async function restoreProcurementRequest(
  id: string,
  _previousState: RestorePRState,
  formData: FormData,
): Promise<RestorePRState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const remarks = String(formData.get("remarks") ?? "").trim();

  const { data, error } = await supabase.rpc("restore_procurement_request", {
    p_request_id: Number(id),
    p_remarks: remarks || null,
  });

  if (error) {
    console.error("RESTORE PR ERROR:", error);

    return {
      error: "Unable to restore procurement request. Please try again.",
    };
  }

  if (!data?.success) {
    return {
      error: "Unable to restore procurement request.",
    };
  }

  redirect(`/purchased-requests/${id}`);
}
