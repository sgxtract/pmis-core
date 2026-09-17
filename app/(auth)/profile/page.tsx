import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ChangePassword from "./ChangePassword";
import EditProfile from "./EditProfile";

import SessionSecurity from "./SessionSecurity";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, employee_id, is_active, role_id, user_type_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    throw new Error("Unable to load your profile.");
  }

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();

  if (roleError || !role) {
    throw new Error("Unable to load your role.");
  }

  let userTypeName: string | null = null;

  if (profile.user_type_id) {
    const { data: userType, error: userTypeError } = await supabase
      .from("user_types")
      .select("name")
      .eq("id", profile.user_type_id)
      .single();

    if (userTypeError || !userType) {
      throw new Error("Unable to load your User Type.");
    }

    userTypeName = userType.name;
  }

  const roleName = role.name;

  const displayName = profile.full_name || user.email || "User";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile & Settings</h1>

        <p className="mt-1 text-sm text-gray-500">
          View your PMIS account information and settings.
        </p>
      </div>

      {/* Profile Summary */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-6 py-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-900">
              {displayName}
            </h2>

            <p className="mt-1 truncate text-sm text-gray-500">{user.email}</p>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                profile.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  profile.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              />

              {profile.is_active ? "Active" : "Disabled"}
            </span>
          </div>
        </div>
      </section>

      {/* Account Information */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Information
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your current PMIS account information.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-6 px-6 py-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Full Name</p>

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <p className="text-sm font-semibold text-gray-900">
                {profile.full_name || "Not assigned"}
              </p>

              <EditProfile currentFullName={profile.full_name || ""} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Employee ID</p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {profile.employee_id || "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>

            <p className="mt-1 break-all text-sm font-semibold text-gray-900">
              {user.email || "Not assigned"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {roleName}
            </p>
          </div>

          {roleName === "User" && (
            <div>
              <p className="text-sm font-medium text-gray-500">User Type</p>

              <p className="mt-1 text-sm font-semibold text-gray-900">
                {userTypeName || "Not assigned"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Account Settings */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Settings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage settings for your PMIS account.
          </p>
        </div>

        <div className="px-6 py-5">
          <ChangePassword />
          <SessionSecurity />
        </div>
      </section>
    </div>
  );
}
