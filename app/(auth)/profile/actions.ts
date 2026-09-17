"use server";

import { createClient } from "@/lib/supabase/server";

export type EditProfileState = {
  error?: string;
  success?: string;
};

export async function updateOwnProfile(
  _previousState: EditProfileState,
  formData: FormData,
): Promise<EditProfileState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "You must be logged in to update your profile.",
      };
    }

    const fullName = String(formData.get("full_name") ?? "").trim();

    if (!fullName) {
      return {
        error: "Full name is required.",
      };
    }

    const { error } = await supabase.rpc("update_own_profile", {
      p_full_name: fullName,
    });

    if (error) {
      console.error("UPDATE OWN PROFILE ERROR:", error);

      return {
        error: "Unable to update your profile. Please try again.",
      };
    }

    return {
      success: "Your profile has been updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE OWN PROFILE ERROR:", error);

    return {
      error: "Unable to update your profile. Please try again.",
    };
  }
}
