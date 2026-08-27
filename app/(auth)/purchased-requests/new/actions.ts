"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createProcurementRequest(
  formData: FormData
) {
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

  const prNumber = String(
    formData.get("pr_number") ?? ""
  ).trim();

  const prDate = String(
    formData.get("pr_date") ?? ""
  ).trim();

  const typeOfPr = String(
    formData.get("type_of_pr") ?? ""
  ).trim();

  const endUser = String(
    formData.get("end_user") ?? ""
  ).trim();

  const particulars = String(
    formData.get("particulars") ?? ""
  ).trim();

  const abcValue = String(
    formData.get("abc") ?? ""
  ).trim();

  const modeValue = String(
    formData.get("mode_of_procurement_id") ?? ""
  ).trim();

  const modeId = modeValue
    ? Number(modeValue)
    : null;

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
    throw new Error(
      "Please complete all required fields."
    );
  }

  const abc = Number(abcValue);

  if (!Number.isFinite(abc) || abc < 0) {
    throw new Error(
      "ABC must be a valid amount."
    );
  }

  // -----------------------------------------
  // 4. Get the "Received" stage
  // -----------------------------------------

  const { data: receivedStage, error: stageError } =
    await supabase
      .from("procurement_stages")
      .select("id")
      .eq("name", "Received")
      .single();

  if (stageError || !receivedStage) {
    throw new Error(
      "The Received procurement stage was not found."
    );
  }

  // -----------------------------------------
  // 5. Create the Procurement Request
  // -----------------------------------------

  const {
    data: request,
    error: requestError,
  } = await supabase
    .from("procurement_requests")
    .insert({
      pr_number: prNumber,
      pr_date: prDate,
      type_of_pr: typeOfPr,
      end_user: endUser,
      particulars: particulars,
      abc: abc,
      mode_of_procurement_id: modeId,
      current_stage_id: receivedStage.id,
      status: "Active",
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (requestError || !request) {
    console.error(
      "CREATE PR ERROR:",
      requestError
    );

    throw new Error(
      requestError?.message ||
        "Unable to create procurement request."
    );
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
    console.error(
      "CREATE STAGE HISTORY ERROR:",
      historyError
    );

    throw new Error(
      "The PR was created, but its stage history could not be created."
    );
  }

  // -----------------------------------------
  // 7. Redirect to the new PR
  // -----------------------------------------

  redirect(
    `/purchased-requests/${request.id}`
  );
}