import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      role_id,
      roles (
        name
      )
    `,
    )
    .eq("id", user.id)
    .single();

  const role = Array.isArray(profile?.roles)
    ? profile.roles[0]
    : profile?.roles;

  if (role?.name !== "Admin") {
    redirect("/forbidden");
  }

  return {
    user,
    profile,
    role,
  };
}
