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
    throw new Error("Procurement Mode is invalid.");
  }

  const accountCode = String(formData.get("account_code") ?? "").trim();

  const calendarDaysValue = String(formData.get("calendar_days") ?? "").trim();

  const solNo = String(formData.get("sol_no") ?? "").trim();

  const calendarDays = calendarDaysValue ? Number(calendarDaysValue) : null;

  if (
    calendarDays !== null &&
    (!Number.isInteger(calendarDays) || calendarDays < 0)
  ) {
    throw new Error("CD / Calendar Days must be a valid whole number.");
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
    throw new Error("Please complete all required fields.");
  }

  const abc = Number(abcValue);

  if (!Number.isFinite(abc) || abc < 0) {
    throw new Error("ABC must be a valid amount.");
  }

  const parsedDate = new Date(prDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("PR Date must be a valid date.");
  }

  if (
    calendarDays !== null &&
    (!Number.isInteger(calendarDays) || calendarDays < 0)
  ) {
    throw new Error("CD / Calendar Days must be a valid whole number.");
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

      throw new Error("Unable to verify the Reference ID.");
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
    throw new Error("The Received procurement stage was not found.");
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
      error: requestError?.message || "Unable to create procurement request.",
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

    throw new Error(
      "The PR was created, but its stage history could not be created.",
    );
  }

  // -----------------------------------------
  // 7. Redirect to the new PR
  // -----------------------------------------

  return {
    success: true,
    id: request.id,
  };

  // redirect(`/purchased-requests/${request.id}`);
}

// "use server";

// import { createClient } from "@/lib/supabase/server";

// export async function createProcurementRequest(formData: FormData) {
//   const supabase = await createClient();

//   const prNumber = String(formData.get("prNumber") ?? "").trim();
//   const prDate = String(formData.get("prDate") ?? "").trim();
//   const particulars = String(formData.get("particulars") ?? "").trim();
//   const abcValue = String(formData.get("abc") ?? "").trim();
//   const procurementModeValue = String(
//     formData.get("procurementMode") ?? "",
//   ).trim();
//   const typeOfPr = String(formData.get("typeOfPr") ?? "").trim();
//   const endUser = String(formData.get("endUser") ?? "").trim();
//   const accountCode = String(formData.get("accountCode") ?? "").trim();
//   const calendarDaysValue = String(
//     formData.get("calendarDays") ?? "",
//   ).trim();
//   const solNo = String(formData.get("solNo") ?? "").trim();

//   if (
//     !prNumber ||
//     !prDate ||
//     !particulars ||
//     !abcValue ||
//     !typeOfPr ||
//     !endUser
//   ) {
//     return {
//       success: false,
//       error: "Please complete all required fields.",
//     };
//   }

//   const abc = Number(abcValue);

//   if (Number.isNaN(abc) || abc < 0) {
//     return {
//       success: false,
//       error: "ABC must be a valid amount.",
//     };
//   }

//   const modeOfProcurementId = procurementModeValue
//     ? Number(procurementModeValue)
//     : null;

//   const calendarDays = calendarDaysValue
//     ? Number(calendarDaysValue)
//     : null;

//   if (
//     modeOfProcurementId !== null &&
//     Number.isNaN(modeOfProcurementId)
//   ) {
//     return {
//       success: false,
//       error: "Invalid procurement mode.",
//     };
//   }

//   if (calendarDays !== null && Number.isNaN(calendarDays)) {
//     return {
//       success: false,
//       error: "CD / Calendar Days must be a valid number.",
//     };
//   }

//   const { data, error } = await supabase
//     .from("procurement_requests")
//     .insert({
//       pr_number: prNumber,
//       pr_date: prDate,
//       particulars,
//       abc,
//       mode_of_procurement_id: modeOfProcurementId,
//       type_of_pr: typeOfPr,
//       end_user: endUser,
//       account_code: accountCode || null,
//       calendar_days: calendarDays,
//       sol_no: solNo || null,
//     })
//     .select("id")
//     .single();

//   if (error) {
//     console.error("CREATE PR ERROR:", error);

//     return {
//       success: false,
//       error: error.message,
//     };
//   }

//   return {
//     success: true,
//     id: data.id,
//   };
// }
