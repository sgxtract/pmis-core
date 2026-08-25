import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              PMIS Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Procurement Management Information System
            </p>
          </div>

          <LogoutButton />

        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">

          <p className="text-sm text-gray-500">
            Logged in as
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {user.email}
          </p>

        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Total PRs
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-sm font-medium text-gray-500">
              Users
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}