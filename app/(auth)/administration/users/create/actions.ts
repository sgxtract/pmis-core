"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

export type CreateUserState = {
  error?: string;
  success?: string;
};

export async function createUser(
  previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  try {
    // Make sure the current user is an Administrator
    await requireAdmin();

    const fullName = String(formData.get("full_name") || "").trim();

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();

    const password = String(formData.get("password") || "");

    const office = String(formData.get("office") || "").trim();

    const roleId = Number(formData.get("role_id"));

    // Basic validation
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

    if (!office) {
      return {
        error: "Office is required.",
      };
    }

    if (!roleId) {
      return {
        error: "Role is required.",
      };
    }

    const supabaseAdmin = createAdminClient();

    // Create the Authentication account
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      console.error("CREATE AUTH USER ERROR:", authError);

      return {
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        error: "User account could not be created.",
      };
    }

    const userId = authData.user.id;

    // Create/update the user's profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        full_name: fullName,
        office,
        role_id: roleId,
      },
      {
        onConflict: "id",
      },
    );

    if (profileError) {
      console.error("CREATE PROFILE ERROR:", profileError);

      // Roll back the Auth account if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return {
        error:
          "The user account was created, but the profile could not be created. The operation was rolled back.",
      };
    }

    return {
      success: `User ${fullName} was created successfully.`,
    };
  } catch (error) {
    console.error("CREATE USER ERROR:", error);

    return {
      error: error instanceof Error ? error.message : "Unable to create user.",
    };
  }
}
