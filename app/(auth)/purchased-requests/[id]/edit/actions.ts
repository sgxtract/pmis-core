"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { requireActiveUser } from "@/lib/auth/require-active-user";

export type UpdatePRState = {
  error?: string;
  success?: boolean;
};

export async function updateProcurementRequest(
  id: string,
  _previousState: UpdatePRState,
  formData: FormData,
): Promise<UpdatePRState> {
  await requireActiveUser();

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      error: "Your user profile could not be found.",
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
    .select(
      `
        id,
        pr_number,
        reference_id_id,
        pr_date,
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

  if (existingRequestError || !existingRequest) {
    return {
      error: "The procurement request could not be found.",
    };
  }

  // -----------------------------------------
  // 5B. Find or create Reference ID
  // -----------------------------------------

  let newReferenceIdDbId: number | null = null;
  let oldReferenceIdValue: string | null = null;

  if (existingRequest.reference_id_id) {
    const { data: oldReference } = await supabase
      .from("reference_ids")
      .select("reference_id")
      .eq("id", existingRequest.reference_id_id)
      .maybeSingle();

    oldReferenceIdValue = oldReference?.reference_id ?? null;
  }

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
        error: "Unable to verify the Reference ID.",
      };
    }

    if (existingReference) {
      newReferenceIdDbId = existingReference.id;
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
          error: "Unable to create the Reference ID. Please try again.",
        };
      }

      newReferenceIdDbId = newReference.id;
    }
  }

  // -----------------------------------------
  // 5C. Get procurement mode names for audit
  // -----------------------------------------

  let oldModeName: string | null = null;
  let newModeName: string | null = null;

  if (existingRequest.mode_of_procurement_id) {
    const { data: oldMode } = await supabase
      .from("modes_of_procurement")
      .select("name")
      .eq("id", existingRequest.mode_of_procurement_id)
      .maybeSingle();

    oldModeName = oldMode?.name ?? null;
  }

  if (modeId) {
    const { data: newMode } = await supabase
      .from("modes_of_procurement")
      .select("name")
      .eq("id", modeId)
      .maybeSingle();

    newModeName = newMode?.name ?? null;
  }

  const auditChanges = [
    {
      field: "reference_id",
      oldValue: oldReferenceIdValue,
      newValue: referenceIdValue || null,
    },
    {
      field: "pr_number",
      oldValue: existingRequest.pr_number,
      newValue: prNumber,
    },
    {
      field: "pr_date",
      oldValue: existingRequest.pr_date,
      newValue: prDate,
    },
    {
      field: "type_of_pr",
      oldValue: existingRequest.type_of_pr,
      newValue: typeOfPr,
    },
    {
      field: "end_user",
      oldValue: existingRequest.end_user,
      newValue: endUser,
    },
    {
      field: "particulars",
      oldValue: existingRequest.particulars,
      newValue: particulars,
    },
    {
      field: "abc",
      oldValue: existingRequest.abc,
      newValue: abc,
    },
    {
      field: "mode_of_procurement",
      oldValue: oldModeName,
      newValue: newModeName,
    },
    {
      field: "account_code",
      oldValue: existingRequest.account_code,
      newValue: accountCode || null,
    },
    {
      field: "calendar_days",
      oldValue: existingRequest.calendar_days,
      newValue: calendarDays,
    },
    {
      field: "sol_no",
      oldValue: existingRequest.sol_no,
      newValue: solNo || null,
    },
  ].filter(
    (change) => String(change.oldValue ?? "") !== String(change.newValue ?? ""),
  );

  // -----------------------------------------
  // 6. Update PR
  // -----------------------------------------

  const { data: updatedRequest, error } = await supabase
    .from("procurement_requests")
    .update({
      pr_number: prNumber,
      pr_date: prDate,
      reference_id_id: newReferenceIdDbId,
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
      error: "Unable to update procurement request. Please try again.",
    };
  }

  //-----------------------------------------
  // 8. Audit log changes
  // -----------------------------------------

  const adminSupabase = createAdminClient();

  for (const change of auditChanges) {
    const { error: auditError } = await adminSupabase
      .from("audit_logs")
      .insert({
        user_id: user.id,
        username: profile.full_name,
        pr_id: existingRequest.id,
        pr_number: prNumber,
        module: "Procurement Requests",
        field_name: change.field,
        old_value: String(change.oldValue ?? ""),
        new_value: String(change.newValue ?? ""),
      });

    if (auditError) {
      console.error("AUDIT LOG ERROR:", {
        message: auditError.message,
        details: auditError.details,
        hint: auditError.hint,
        code: auditError.code,
      });

      return {
        error: `The PR was updated, but the audit log could not be recorded. [${auditError.code ?? "NO_CODE"}] ${auditError.message}`,
      };
    }
  }

  // -----------------------------------------
  // 9. Success
  // -----------------------------------------

  redirect(`/purchased-requests/${id}?updated=1`);
}
