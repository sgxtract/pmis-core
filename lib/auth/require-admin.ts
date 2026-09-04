import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "./require-active-user";

export async function requireAdmin() {
  const { user, profile } = await requireActiveUser();

  const supabase = await createClient();

  const { data: roleData, error } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", profile.role_id)
    .single();

  if (error || !roleData) {
    redirect("/forbidden");
  }

  if (roleData.name !== "Admin") {
    redirect("/forbidden");
  }

  return {
    user,
    profile,
    role: roleData,
  };
}
