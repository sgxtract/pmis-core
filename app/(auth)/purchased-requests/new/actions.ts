"use server";

import { createClient } from "@/lib/supabase/server";

export async function createProcurementRequest(formData: FormData) {
  const supabase = await createClient();

  // -----------------------------------------
  // 1. Check authenticated user
  // -----------------------------------------

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Your session has expired. Please log in again.",
    };
  }

  // -----------------------------------------
  // 2. Get form values
  // -----------------------------------------

  const prNumber = String(formData.get("pr_number") ?? "").trim();

  const prDate = String(formData.get("pr_date") ?? "").trim();

  const referenceIdValue = String(formData.get("reference_id") ?? "").trim();

  const typeOfPr = String(formData.get("type_of_pr") ?? "").trim();

  const endUser = String(formData.get("end_user") ?? "").trim();

  const particulars = String(formData.get("particulars") ?? "").trim();

  const abcValue = String(formData.get("abc") ?? "").trim();

  const modeValue = String(formData.get("mode_of_procurement_id") ?? "").trim();

  const modeId = modeValue ? Number(modeValue) : null;

  if (modeId !== null && (!Number.isInteger(modeId) || modeId <= 0)) {
    return {
      success: false,
      error: "Procurement Mode is invalid.",
    };
  }

  const accountCode = String(formData.get("account_code") ?? "").trim();

  const calendarDaysValue = String(formData.get("calendar_days") ?? "").trim();

  const solNo = String(formData.get("sol_no") ?? "").trim();

  const calendarDays = calendarDaysValue ? Number(calendarDaysValue) : null;

  if (
    calendarDays !== null &&
    (!Number.isInteger(calendarDays) || calendarDays < 0)
  ) {
    return {
      success: false,
      error: "CD / Calendar Days must be a valid whole number.",
    };
  }

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
      success: false,
      error: "Please complete all required fields.",
    };
  }

  const abc = Number(abcValue);

  if (!Number.isFinite(abc) || abc < 0) {
    return {
      success: false,
      error: "ABC must be a valid amount.",
    };
  }

  const parsedDate = new Date(prDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      success: false,
      error: "PR Date must be a valid date.",
    };
  }

  // -----------------------------------------
  // 3B. Find or create Reference ID
  // -----------------------------------------

  let referenceIdDbId: number | null = null;

  if (referenceIdValue) {
    const { data: existingReference, error: referenceLookupError } =
      await supabase
        .from("reference_ids")
        .select("id")
        .eq("reference_id", referenceIdValue)
        .maybeSingle();

    if (referenceLookupError) {
      console.error("REFERENCE ID LOOKUP ERROR:", referenceLookupError);

      return {
        success: false,
        error: "Unable to verify the Reference ID.",
      };
    }

    if (existingReference) {
      referenceIdDbId = existingReference.id;
    } else {
      const { data: newReference, error: referenceCreateError } = await supabase
        .from("reference_ids")
        .insert({
          reference_id: referenceIdValue,
          created_by: user.id,
        })
        .select("id")
        .single();

      if (referenceCreateError || !newReference) {
        console.error("REFERENCE ID CREATE ERROR:", referenceCreateError);

        return {
          success: false,
          error: "Unable to create the Reference ID. Please try again.",
        };
      }

      referenceIdDbId = newReference.id;
    }
  }

  // -----------------------------------------
  // 4. Get the "Received" stage
  // -----------------------------------------

  const { data: receivedStage, error: stageError } = await supabase
    .from("procurement_stages")
    .select("id")
    .eq("name", "Received")
    .single();

  if (stageError || !receivedStage) {
    console.error("RECEIVED STAGE ERROR:", stageError);

    return {
      success: false,
      error: "The Received procurement stage could not be found.",
    };
  }

  // -----------------------------------------
  // 5. Create the Procurement Request
  // -----------------------------------------

  const { data: request, error: requestError } = await supabase
    .from("procurement_requests")
    .insert({
      pr_number: prNumber,
      pr_date: prDate,
      reference_id_id: referenceIdDbId,
      type_of_pr: typeOfPr,
      end_user: endUser,
      particulars: particulars,
      abc: abc,
      mode_of_procurement_id: modeId,

      account_code: accountCode || null,
      calendar_days: calendarDays,
      sol_no: solNo || null,

      current_stage_id: receivedStage.id,
      status: "Active",
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (requestError || !request) {
    console.error("CREATE PR ERROR:", requestError);

    if (
      requestError?.code === "23505" &&
      requestError?.message.includes("procurement_requests_pr_number_key")
    ) {
      return {
        success: false,
        error: "PR Number already exists. Please enter a different PR Number.",
      };
    }

    return {
      success: false,
      error: "Unable to create procurement request. Please try again.",
    };
  }

  // -----------------------------------------
  // 6. Create initial stage history
  // -----------------------------------------

  const { error: historyError } = await supabase
    .from("procurement_stage_history")
    .insert({
      request_id: request.id,
      stage_id: receivedStage.id,
      changed_by: user.id,
      remarks: "Initial procurement request created.",
    });

  if (historyError) {
    console.error("CREATE STAGE HISTORY ERROR:", historyError);

    return {
      success: false,
      error:
        "The PR was created, but its stage history could not be recorded. Please contact an administrator.",
    };
  }

  // -----------------------------------------
  // 7. Redirect to the new PR
  // -----------------------------------------

  return {
    success: true,
    id: request.id,
  };
}
