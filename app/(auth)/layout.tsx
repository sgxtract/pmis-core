import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SessionGuard from "@/components/auth/SessionGuard";
import { requireActiveUser } from "@/lib/auth/require-active-user";
import MobileNav from "@/components/layout/MobileNav";
import UserMenu from "@/components/layout/UserMenu";
import Sidebar from "@/components/layout/Sidebar";

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

      <header className="flex min-h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav isAdmin={isAdmin} />

          <div className="min-w-0">
            <h1 className="font-bold text-gray-900">PMIS</h1>

            <p className="text-xs text-gray-500">
              Procurement Management Information System
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <UserMenu fullName={profile?.full_name} email={user.email} />
        </div>
      </header>

      <div className="flex">
        <Sidebar isAdmin={isAdmin} />

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
