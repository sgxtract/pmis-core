"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export async function changeUserEmail(
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  try {
    const { user, profile, role } = await requireUserManager();

    // Only Administrators can change user email addresses.
    if (role.name !== "Admin") {
      return {
        error: "Only Administrators can change user email addresses.",
      };
    }

    const userId = String(formData.get("user_id") ?? "").trim();
    const newEmail = String(formData.get("email") ?? "")
      .trim()
      .toLowerCase();

    if (!userId) {
      return {
        error: "User ID is required.",
      };
    }

    if (!newEmail) {
      return {
        error: "Email address is required.",
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return {
        error: "Please enter a valid email address.",
      };
    }

    const supabaseAdmin = createAdminClient();

    // Get the target user's current Auth account.
    const {
      data: { user: targetUser },
      error: targetUserError,
    } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (targetUserError || !targetUser) {
      console.error("GET TARGET USER ERROR:", targetUserError);

      return {
        error: "Unable to find the user account.",
      };
    }

    const oldEmail = targetUser.email ?? "";

    if (oldEmail.toLowerCase() === newEmail) {
      return {
        error:
          "The new email address is the same as the current email address.",
      };
    }

    // Update the user's Auth email.
    const { data: updatedUserData, error: updateEmailError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: newEmail,
      });

    if (updateEmailError || !updatedUserData.user) {
      console.error("UPDATE USER EMAIL ERROR:", updateEmailError);

      return {
        error:
          "Unable to change the email address. Please check the email address and try again.",
      };
    }

    // Record the email change for accountability.
    const { error: auditError } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: user.id,
        username: profile.full_name,
        pr_id: null,
        pr_number: null,
        module: "User Management",
        field_name: "email",
        old_value: oldEmail,
        new_value: newEmail,
      });

    if (auditError) {
      console.error("CHANGE EMAIL AUDIT ERROR:", auditError);

      return {
        error:
          "The email address was changed, but the audit record could not be created. Please contact an administrator.",
      };
    }

    return {
      success: "Email address updated successfully.",
    };
  } catch (error) {
    console.error("CHANGE USER EMAIL ERROR:", error);

    return {
      error: "Unable to change the email address. Please try again.",
    };
  }
}

export async function changeUserPassword(
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  try {
    const { role } = await requireUserManager();

    const userId = String(formData.get("user_id") ?? "").trim();
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (!userId) {
      return {
        error: "User ID is required.",
      };
    }

    if (!newPassword) {
      return {
        error: "New password is required.",
      };
    }

    if (newPassword.length < 8) {
      return {
        error: "Password must be at least 8 characters long.",
      };
    }

    if (!/[a-z]/.test(newPassword)) {
      return {
        error: "Password must contain at least one lowercase letter.",
      };
    }

    if (!/[A-Z]/.test(newPassword)) {
      return {
        error: "Password must contain at least one uppercase letter.",
      };
    }

    if (!/[0-9]/.test(newPassword)) {
      return {
        error: "Password must contain at least one number.",
      };
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return {
        error: "Password must contain at least one special character.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        error: "The passwords do not match.",
      };
    }

    // Moderators may only manage regular User accounts.
    if (role.name === "Moderator") {
      const supabase = await createClient();

      const { data: targetProfile, error: targetProfileError } = await supabase
        .from("profiles")
        .select("role_id")
        .eq("id", userId)
        .single();

      if (targetProfileError || !targetProfile) {
        return {
          error: "Unable to find the user account.",
        };
      }

      const { data: userRole, error: userRoleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "User")
        .single();

      if (userRoleError || !userRole) {
        console.error("GET USER ROLE ERROR:", userRoleError);

        return {
          error: "Unable to verify the target user's role.",
        };
      }

      if (targetProfile.role_id !== userRole.id) {
        return {
          error:
            "Moderators can only change passwords for regular User accounts.",
        };
      }
    }

    const supabaseAdmin = createAdminClient();

    const { data: updatedUserData, error: updatePasswordError } =
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

    if (updatePasswordError || !updatedUserData.user) {
      console.error("UPDATE USER PASSWORD ERROR:", updatePasswordError);

      return {
        error: "Unable to change the password. Please try again.",
      };
    }

    return {
      success: "Password changed successfully.",
    };
  } catch (error) {
    console.error("CHANGE USER PASSWORD ERROR:", error);

    return {
      error: "Unable to change the password. Please try again.",
    };
  }
}

export async function changeOwnPassword(
  _previousState: EditUserState,
  formData: FormData,
): Promise<EditUserState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "You must be logged in to change your password.",
      };
    }

    const currentPassword = String(formData.get("current_password") ?? "");
    const newPassword = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirm_password") ?? "");

    if (!currentPassword) {
      return {
        error: "Current password is required.",
      };
    }

    if (!newPassword) {
      return {
        error: "New password is required.",
      };
    }

    if (newPassword.length < 8) {
      return {
        error: "Password must be at least 8 characters long.",
      };
    }

    if (!/[a-z]/.test(newPassword)) {
      return {
        error: "Password must contain at least one lowercase letter.",
      };
    }

    if (!/[A-Z]/.test(newPassword)) {
      return {
        error: "Password must contain at least one uppercase letter.",
      };
    }

    if (!/[0-9]/.test(newPassword)) {
      return {
        error: "Password must contain at least one number.",
      };
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      return {
        error: "Password must contain at least one special character.",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        error: "The passwords do not match.",
      };
    }

    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: newPassword,
      current_password: currentPassword,
    });

    if (updatePasswordError) {
      console.error("CHANGE OWN PASSWORD ERROR:", updatePasswordError);

      return {
        error: "Unable to change your password. Please try again.",
      };
    }

    return {
      success: "Your password has been changed successfully.",
    };
  } catch (error) {
    console.error("CHANGE OWN PASSWORD ERROR:", error);

    return {
      error: "Unable to change your password. Please try again.",
    };
  }
}
