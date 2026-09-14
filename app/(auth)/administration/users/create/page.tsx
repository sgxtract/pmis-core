import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireUserManager } from "@/lib/auth/require-user-manager";

import CreateUserForm from "./CreateUserForm";

export default async function CreateUserPage() {
  const { role } = await requireUserManager();

  const supabase = await createClient();

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("id, name")
    .order("id", {
      ascending: true,
    });

  if (rolesError) {
    throw new Error("Unable to load roles.");
  }

  const availableRoles =
    role.name === "Admin"
      ? (roles ?? [])
      : (roles ?? []).filter((item) => item.name === "User");

  const { data: userTypes, error: userTypesError } = await supabase
    .from("user_types")
    .select("id, name")
    .order("id", {
      ascending: true,
    });

  if (userTypesError) {
    throw new Error("Unable to load user types.");
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/administration/users"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Users
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create User</h1>

          <p className="mt-1 text-sm text-gray-600">
            Create a new PMIS user account.
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <CreateUserForm roles={availableRoles} userTypes={userTypes ?? []} />
        </div>
      </div>
    </main>
  );
}
