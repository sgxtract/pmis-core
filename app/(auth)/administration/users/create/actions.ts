"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUserManager } from "@/lib/auth/require-user-manager";

export type CreateUserState = {
  error?: string;
  success?: string;
};

export async function createUser(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  try {
    // ---------------------------------------------
    // 1. Verify current user can manage users
    // ---------------------------------------------

    const { role: currentRole } = await requireUserManager();

    // ---------------------------------------------
    // 2. Read submitted values
    // ---------------------------------------------

    const fullName = String(formData.get("full_name") || "").trim();

    const employeeId = String(formData.get("employee_id") || "").trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    const roleId = Number(formData.get("role_id"));

    const userTypeValue = String(formData.get("user_type_id") || "").trim();

    const userTypeId = userTypeValue ? Number(userTypeValue) : null;

    // ---------------------------------------------
    // 3. Basic validation
    // ---------------------------------------------

    if (!fullName) {
      return {
        error: "Full name is required.",
      };
    }

    if (!email) {
      return {
        error: "Email is required.",
      };
    }

    if (!password) {
      return {
        error: "Password is required.",
      };
    }

    if (password.length < 8) {
      return {
        error: "Password must be at least 8 characters.",
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        error: "Password must contain at least one lowercase letter.",
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        error: "Password must contain at least one uppercase letter.",
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        error: "Password must contain at least one number.",
      };
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|<>?,./`~]/.test(password)) {
      return {
        error: "Password must contain at least one special character.",
      };
    }

    if (!Number.isInteger(roleId) || roleId <= 0) {
      return {
        error: "Please select a valid role.",
      };
    }

    // ---------------------------------------------
    // 4. Get actual role IDs
    // ---------------------------------------------

    const supabaseAdmin = createAdminClient();

    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from("roles")
      .select("id, name")
      .in("name", ["Admin", "Moderator", "User"]);

    if (roleError || !roleRows) {
      console.error("CREATE USER ROLE LOOKUP ERROR:", roleError);

      return {
        error: "Unable to validate the selected role. Please try again.",
      };
    }

    const adminRole = roleRows.find((role) => role.name === "Admin");

    const moderatorRole = roleRows.find((role) => role.name === "Moderator");

    const userRole = roleRows.find((role) => role.name === "User");

    if (!adminRole || !moderatorRole || !userRole) {
      console.error("CREATE USER ROLE CONFIGURATION ERROR");

      return {
        error:
          "User role configuration is incomplete. Please contact a system administrator.",
      };
    }

    // ---------------------------------------------
    // 5. Validate requested role
    // ---------------------------------------------

    const validRoleIds = [adminRole.id, moderatorRole.id, userRole.id];

    if (!validRoleIds.includes(roleId)) {
      return {
        error: "Invalid role selected.",
      };
    }

    // ---------------------------------------------
    // 6. Moderator restriction
    //
    // Moderator may create regular Users only.
    // ---------------------------------------------

    if (currentRole.name === "Moderator" && roleId !== userRole.id) {
      return {
        error: "Moderators can only create regular User accounts.",
      };
    }

    // ---------------------------------------------
    // 7. Validate User Type
    // ---------------------------------------------

    if (roleId === userRole.id) {
      if (
        userTypeId === null ||
        !Number.isInteger(userTypeId) ||
        userTypeId <= 0
      ) {
        return {
          error: "Please select a valid User Type.",
        };
      }

      const { data: userType, error: userTypeError } = await supabaseAdmin
        .from("user_types")
        .select("id")
        .eq("id", userTypeId)
        .maybeSingle();

      if (userTypeError || !userType) {
        return {
          error: "Please select a valid User Type.",
        };
      }
    } else {
      // Admin and Moderator accounts must not
      // have a User Type.
      if (userTypeId !== null) {
        return {
          error: "Admin and Moderator accounts cannot have a User Type.",
        };
      }
    }

    // ---------------------------------------------
    // 8. Create Authentication account
    // ---------------------------------------------

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("CREATE AUTH USER ERROR:", authError);

      return {
        error:
          "Unable to create the user account. Please check the information and try again.",
      };
    }

    if (!authData.user) {
      return {
        error: "User account could not be created.",
      };
    }

    const userId = authData.user.id;

    // ---------------------------------------------
    // 9. Create profile
    // ---------------------------------------------

    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        employee_id: employeeId || null,
        role_id: roleId,
        user_type_id: userTypeId,
      },
      {
        onConflict: "id",
      },
    );

    // ---------------------------------------------
    // 10. Roll back Auth account if profile fails
    // ---------------------------------------------

    if (profileError) {
      console.error("CREATE PROFILE ERROR:", profileError);

      await supabaseAdmin.auth.admin.deleteUser(userId);

      return {
        error:
          "The user account was created, but the profile could not be created. The operation was rolled back.",
      };
    }

    // ---------------------------------------------
    // 11. Success
    // ---------------------------------------------

    return {
      success: `User ${fullName} was created successfully.`,
    };
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return {
      error: "Unable to create user. Please try again.",
    };
  }
}
