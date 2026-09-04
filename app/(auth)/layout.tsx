import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import Link from "next/link";
import SessionGuard from "@/components/auth/SessionGuard";
import { requireActiveUser } from "@/lib/auth/require-active-user";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireActiveUser();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the user's role
  const { data: roleData } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", profile.role_id)
    .single();

  const isAdmin = roleData?.name === "Admin";

  return (
    <div className="min-h-screen bg-gray-100">
      <SessionGuard />

      <header className="flex h-16 items-center justify-between border-b bg-white px-6">
        <div>
          <h1 className="font-bold text-gray-900">PMIS</h1>

          <p className="text-xs text-gray-500">
            Procurement Management Information System
          </p>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>

          <LogoutButton />
        </div>
      </header>

      <div className="flex">
        <aside className="min-h-[calc(100vh-4rem)] w-64 border-r bg-white p-4">
          <nav className="space-y-2">
            <p className="px-3 pb-2 text-xs font-semibold uppercase text-gray-400">
              Main Menu
            </p>

            <Link
              href="/dashboard"
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>

            <Link
              href="/purchased-requests"
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Purchased Requests
            </Link>

            <Link
              href="/reports"
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Reports
            </Link>

            {/* Admin-only menu */}
            {isAdmin && (
              <Link
                href="/audit-logs"
                className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Audit Logs
              </Link>
            )}

            {/* Admin-only menu */}
            {isAdmin && (
              <div className="pt-4">
                <p className="px-3 pb-2 text-xs font-semibold uppercase text-gray-400">
                  Administration
                </p>

                <Link
                  href="/administration"
                  className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
              </div>
            )}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
