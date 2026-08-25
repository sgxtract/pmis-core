import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
        <div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      PMIS Dashboard
    </h1>

    <p className="mt-2 text-gray-600">
      Welcome to the Procurement Management Information System.
    </p>
  </div>

  <LogoutButton />
</div>
      <div className="mx-auto max-w-7xl">

        <h1 className="text-3xl font-bold text-gray-900">
          PMIS Dashboard
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to the Procurement Management Information System.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Logged in as
          </p>

          <p className="mt-1 font-medium text-gray-900">
            {user.email}
          </p>
        </div>

      </div>
    </main>
  );
}