import { notFound } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import EditUserForm from "./EditUserForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ManageUserPage({ params }: Props) {
  await requireAdmin();

  const { id } = await params;

  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("profiles")
    .select(`
      id,
      full_name,
      office,
      role_id,
      is_active,
      roles (
        name
      )
    `)
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
          office: user.office,
          role_id: user.role_id,
          is_active: user.is_active,
        }}
        roles={roles}
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
