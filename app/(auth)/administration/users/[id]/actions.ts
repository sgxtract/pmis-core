"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

type State = {
  error?: string;
  success?: string;
};

export async function updateUser(
  previousState: State,
  formData: FormData,
): Promise<State> {
  try {
    await requireAdmin();

    const id = String(formData.get("id") || "").trim();
    const fullName = String(formData.get("full_name") || "").trim();
    const office = String(formData.get("office") || "").trim();
    const roleId = Number(formData.get("role_id"));
    const isActive = formData.get("is_active") === "true";

    if (!id) {
      return {
        error: "User ID is missing.",
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

    if (!Number.isInteger(roleId)) {
      return {
        error: "Please select a valid role.",
      };
    }

    const supabase = await createClient();

    const { error } = await supabase.rpc("admin_update_user", {
      target_user_id: id,
      new_full_name: fullName,
      new_office: office,
      new_role_id: roleId,
      new_is_active: isActive,
    });

    if (error) {
      return {
        error: error.message,
      };
    }

    return {
      success: "User information updated successfully.",
    };
  } catch (error) {
    console.error(error);

    return {
      error: "An unexpected error occurred.",
    };
  }
}
