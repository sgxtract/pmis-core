import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NewPRForm from "./NewPRForm";

export default async function NewPurchasedRequestPage() {
  const supabase = await createClient();

  const { data: procurementModes, error } = await supabase
    .from("modes_of_procurement")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("PROCUREMENT MODE ERROR:", error);

    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-900">
          New Procurement Request
        </h1>

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Unable to load procurement modes.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <Link
          href="/purchased-requests"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          ← Back to Purchased Requests
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          New Procurement Request
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Enter the basic information for the new procurement request.
        </p>
      </div>

      <NewPRForm procurementModes={procurementModes ?? []} />
    </div>
  );
}
