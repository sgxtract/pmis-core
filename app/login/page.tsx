import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="text-center text-3xl font-bold text-gray-900">
          PMIS
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Procurement Management Information System
        </p>

        <LoginForm />

      </div>
    </main>
  );
}