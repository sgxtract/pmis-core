"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type UpdatePRState = {
  error?: string;
  success?: boolean;
};

export async function updateProcurementRequest(
  id: string,
  _previousState: UpdatePRState,
  formData: FormData,
): Promise<UpdatePRState> {
  const supabase = await createClient();

  // -----------------------------------------
  // 1. Check authenticated user
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // -----------------------------------------
  // 2. Get form values
  // -----------------------------------------

  const prNumber = String(formData.get("pr_number") ?? "").trim();

  const prDate = String(formData.get("pr_date") ?? "").trim();

  const typeOfPr = String(formData.get("type_of_pr") ?? "").trim();

  const endUser = String(formData.get("end_user") ?? "").trim();

  const particulars = String(formData.get("particulars") ?? "").trim();

  const abcValue = String(formData.get("abc") ?? "").trim();

  const modeValue = String(formData.get("mode_of_procurement_id") ?? "").trim();

  const modeId = modeValue ? Number(modeValue) : null;

  const accountCode = String(formData.get("account_code") ?? "").trim();

  const calendarDaysValue = String(formData.get("calendar_days") ?? "").trim();

  const solNo = String(formData.get("sol_no") ?? "").trim();

  const calendarDays = calendarDaysValue ? Number(calendarDaysValue) : null;

  // -----------------------------------------
  // 3. Validate required fields
  // -----------------------------------------

  if (
    !prNumber ||
    !prDate ||
    !typeOfPr ||
    !endUser ||
    !particulars ||
    !abcValue
  ) {
    return {
      error: "Please complete all required fields.",
    };
  }

  // -----------------------------------------
  // 4. Validate ABC
  // -----------------------------------------

  const abc = Number(abcValue);

  if (!Number.isFinite(abc) || abc < 0) {
    return {
      error: "ABC must be a valid amount.",
    };
  }

  if (
    calendarDays !== null &&
    (!Number.isInteger(calendarDays) || calendarDays < 0)
  ) {
    return {
      error: "CD / Calendar Days must be a valid whole number.",
    };
  }

  // -----------------------------------------
  // 5. Check that the PR exists
  // -----------------------------------------

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("procurement_requests")
    .select("id")
    .eq("id", id)
    .single();

  if (existingRequestError || !existingRequest) {
    return {
      error: "The procurement request could not be found.",
    };
  }

  // -----------------------------------------
  // 6. Update PR
  // -----------------------------------------

  const { data: updatedRequest, error } = await supabase
    .from("procurement_requests")
    .update({
      pr_number: prNumber,
      pr_date: prDate,
      type_of_pr: typeOfPr,
      end_user: endUser,
      particulars: particulars,
      abc: abc,
      mode_of_procurement_id: modeId,

      account_code: accountCode || null,
      calendar_days: calendarDays,
      sol_no: solNo || null,

      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  // -----------------------------------------
  // 7. Handle update errors
  // -----------------------------------------

  if (error || !updatedRequest) {
    console.error("UPDATE PR ERROR:", error);

    // Duplicate PR number
    if (
      error?.code === "23505" &&
      error.message.includes("procurement_requests_pr_number_key")
    ) {
      return {
        error:
          "This PR Number already exists. Please enter a different PR Number.",
      };
    }

    return {
      error:
        error?.message ||
        "Unable to update procurement request. Please try again.",
    };
  }

  // -----------------------------------------
  // 8. Success
  // -----------------------------------------

  redirect(`/purchased-requests/${id}`);
}
