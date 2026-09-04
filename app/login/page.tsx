import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const params = await searchParams;

  const accountDisabled = params.error === "account_disabled";

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">PMIS</h1>

        <p className="mt-2 mb-5 text-center text-gray-500">
          Procurement Management Information System
        </p>
        {accountDisabled && (
          <div className="mb-1 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">Account Disabled</p>

            <p className="my-1">
              Your account has been disabled. Please contact a system
              administrator.
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
