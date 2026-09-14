import { notFound } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireUserManager } from "@/lib/auth/require-user-manager";
import EditUserForm from "./EditUserForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ManageUserPage({ params }: Props) {
  await requireUserManager();

  const { id } = await params;

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      employee_id,
      role_id,
      user_type_id,
      is_active,
      roles (
        name
      )
    `,
    )
    .eq("id", id)
    .single();

  if (error || !user) {
    notFound();
  }

  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("id, name")
    .order("id");

  if (rolesError || !roles) {
    throw new Error("Unable to load roles.");
  }

  const { data: userTypes, error: userTypesError } = await supabase
    .from("user_types")
    .select("id, name")
    .order("id");

  if (userTypesError || !userTypes) {
    throw new Error("Unable to load user types.");
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/administration/users"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to User Management
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">Manage User</h1>

        <p className="mt-1 text-sm text-gray-500">
          Update this user account&apos;s information and access.
        </p>
      </div>

      <EditUserForm
        user={{
          id: user.id,
          full_name: user.full_name,
          employee_id: user.employee_id,
          role_id: user.role_id,
          user_type_id: user.user_type_id,
          is_active: user.is_active,
        }}
        roles={roles}
        userTypes={userTypes}
      />

      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <h2 className="font-semibold text-yellow-900">Account Status</h2>

        <p className="mt-1 text-sm text-yellow-800">
          Disabled users will remain in the system for historical accountability
          but will not be allowed to access the PMIS.
        </p>
      </div>
    </div>
  );
}
