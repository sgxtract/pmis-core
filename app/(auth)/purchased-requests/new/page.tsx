import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { createProcurementRequest } from "./actions";

export default async function NewProcurementRequestPage() {
  const supabase = await createClient();

  const { data: procurementModes } = await supabase
    .from("modes_of_procurement")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div>

      <Link
        href="/purchased-requests"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Purchased Requests
      </Link>

      <div className="mt-6">
        <h1 className="text-3xl font-bold text-gray-900">
          New Procurement Request
        </h1>

        <p className="mt-2 text-gray-600">
          Create a new procurement request.
        </p>
      </div>

      <form
        action={createProcurementRequest}
        className="mt-8 rounded-xl border bg-white shadow-sm"
      >

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Procurement Request Information
          </h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">

          {/* PR Number */}
          <div>
            <label
              htmlFor="pr_number"
              className="block text-sm font-medium text-gray-700"
            >
              PR Number
            </label>

            <input
              id="pr_number"
              name="pr_number"
              type="text"
              required
              placeholder="PR-2026-002"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* PR Date */}
          <div>
            <label
              htmlFor="pr_date"
              className="block text-sm font-medium text-gray-700"
            >
              PR Date
            </label>

            <input
              id="pr_date"
              name="pr_date"
              type="date"
              required
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Type of PR */}
          <div>
            <label
              htmlFor="type_of_pr"
              className="block text-sm font-medium text-gray-700"
            >
              Type of PR
            </label>

            <input
              id="type_of_pr"
              name="type_of_pr"
              type="text"
              required
              placeholder="Goods"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* End User */}
          <div>
            <label
              htmlFor="end_user"
              className="block text-sm font-medium text-gray-700"
            >
              End User
            </label>

            <input
              id="end_user"
              name="end_user"
              type="text"
              required
              placeholder="Information Technology Office"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Particulars */}
          <div className="md:col-span-2">
            <label
              htmlFor="particulars"
              className="block text-sm font-medium text-gray-700"
            >
              Particulars
            </label>

            <textarea
              id="particulars"
              name="particulars"
              required
              rows={4}
              placeholder="Enter description of the procurement..."
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* ABC */}
          <div>
            <label
              htmlFor="abc"
              className="block text-sm font-medium text-gray-700"
            >
              ABC
            </label>

            <input
              id="abc"
              name="abc"
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="500000.00"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-gray-500">
              Amount should be entered in Philippine Peso.
            </p>
          </div>

          {/* Mode of Procurement */}
          <div>
            <label
              htmlFor="mode_of_procurement_id"
              className="block text-sm font-medium text-gray-700"
            >
              Mode of Procurement
            </label>

            <select
              id="mode_of_procurement_id"
              name="mode_of_procurement_id"
              defaultValue=""
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Not yet assigned
              </option>

              {procurementModes?.map((mode) => (
                <option
                  key={mode.id}
                  value={mode.id}
                >
                  {mode.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

          <Link
            href="/purchased-requests"
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Create PR
          </button>

        </div>

      </form>

    </div>
  );
}