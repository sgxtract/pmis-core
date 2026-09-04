"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

export type EditUserState = {
  error?: string;
  success?: string;
};

export async function updateUser(
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  await requireAdmin();

  const supabase = await createClient();

  const userId = String(formData.get("user_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const office = String(formData.get("office") ?? "").trim();
  const roleId = Number(formData.get("role_id"));
  const isActive = formData.get("is_active") === "true";

  if (!userId) {
    return {
      error: "User ID is required.",
    };
  }

  if (!fullName) {
    return {
      error: "Full name is required.",
    };
  }

  if (!office) {
    return {
      error: "Office is required.",
    };
  }

  if (!Number.isInteger(roleId) || roleId <= 0) {
    return {
      error: "Please select a valid role.",
    };
  }

  const { error } = await supabase.rpc("update_user_profile", {
    p_user_id: userId,
    p_full_name: fullName,
    p_office: office,
    p_role_id: roleId,
    p_is_active: isActive,
  });

  if (error) {
    console.error("Update user error:", error);

    return {
      error: error.message,
    };
  }

  return {
    success: "User account updated successfully.",
  };
}
