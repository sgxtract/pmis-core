import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Return Home */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            <span>Return Home</span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <Link
            href="/"
            className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <h1 className="text-center text-3xl font-bold text-gray-900">
              PMIS
            </h1>

            <p className="mt-2 mb-5 text-center text-gray-500">
              Procurement Management Information System
            </p>
          </Link>

          {accountDisabled && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Account Disabled</p>

              <p className="my-1">
                Your account has been disabled. Please contact a system
                administrator.
              </p>
            </div>
          )}

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
