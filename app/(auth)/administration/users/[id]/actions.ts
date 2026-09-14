"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUserManager } from "@/lib/auth/require-user-manager";

export type EditUserState = {
  error?: string;
  success?: string;
};

export async function updateUser(
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  try {
    await requireUserManager();

    const supabase = await createClient();

    const userId = String(formData.get("user_id") ?? "");
    const fullName = String(formData.get("full_name") ?? "").trim();
    const employeeId = String(formData.get("employee_id") ?? "").trim();

    const roleId = Number(formData.get("role_id"));

    const userTypeValue = String(formData.get("user_type_id") ?? "").trim();

    const userTypeId = userTypeValue ? Number(userTypeValue) : null;

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

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return {
        error: "Please select a valid role.",
      };
    }

    if (
      userTypeId !== null &&
      (!Number.isInteger(userTypeId) || userTypeId <= 0)
    ) {
      return {
        error: "Please select a valid User Type.",
      };
    }

    const { error } = await supabase.rpc("update_user_profile", {
      p_user_id: userId,
      p_full_name: fullName,
      p_employee_id: employeeId,
      p_role_id: roleId,
      p_user_type_id: userTypeId,
      p_is_active: isActive,
    });

    if (error) {
      console.error("Update user error:", error);

      return {
        error: "Unable to update user account. Please try again.",
      };
    }

    return {
      success: "User account updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);

    return {
      error: "Unable to update user account. Please try again.",
    };
  }
}
