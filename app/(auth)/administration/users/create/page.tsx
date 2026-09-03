import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

import CreateUserForm from "./CreateUserForm";

export default async function CreateUserPage() {
  await requireAdmin();

  const supabase = await createClient();

  const { data: roles, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
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
          <CreateUserForm roles={roles ?? []} />
        </div>
      </div>
    </main>
  );
}
