"use client";

import { useActionState } from "react";
import Link from "next/link";

import { updateProcurementRequest, type UpdatePRState } from "./actions";

type ProcurementRequest = {
  id: number;
  pr_number: string;
  reference_id_id: number | null;
  pr_date: string;
  type_of_pr: string;
  end_user: string;
  particulars: string;
  abc: number | null;
  mode_of_procurement_id: number | null;
  account_code: string | null;
  calendar_days: number | null;
  sol_no: string | null;
};

type ProcurementMode = {
  id: number;
  name: string;
};

type Props = {
  request: ProcurementRequest;
  referenceId: string | null;
  procurementModes: ProcurementMode[];
};

const initialState: UpdatePRState = {};

export default function EditPRForm({
  request,
  referenceId,
  procurementModes,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    updateProcurementRequest.bind(null, String(request.id)),
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-8 rounded-xl border bg-white shadow-sm"
    >
      {/* Header */}

      <div className="border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">
          Procurement Request Information
        </h2>
      </div>

      {/* Error Message */}

      {state?.error && (
        <div
          role="alert"
          className="mx-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <span className="font-semibold">Error:</span>

            <span>{state.error}</span>
          </div>
        </div>
      )}

      {/* Fields */}

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
            defaultValue={request.pr_number}
            className={`text-gray-500 mt-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 ${
              state?.error?.includes("PR Number")
                ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
            }`}
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
            defaultValue={request.pr_date}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Reference ID */}

        <div>
          <label
            htmlFor="reference_id"
            className="block text-sm font-medium text-gray-700"
          >
            Reference ID
          </label>

          <input
            id="reference_id"
            name="reference_id"
            type="text"
            defaultValue={referenceId ?? ""}
            placeholder="Optional"
            maxLength={100}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="mt-1 text-xs text-gray-500">
            Use the same Reference ID for related procurement requests.
          </p>
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
            defaultValue={request.type_of_pr}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            defaultValue={request.end_user}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            rows={5}
            defaultValue={request.particulars}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
            defaultValue={request.abc ?? ""}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
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
            defaultValue={request.mode_of_procurement_id ?? ""}
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Not yet assigned</option>

            {procurementModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Code */}
        <div>
          <label
            htmlFor="account_code"
            className="block text-sm font-medium text-gray-700"
          >
            Account Code
          </label>

          <input
            id="account_code"
            name="account_code"
            type="text"
            defaultValue={request.account_code ?? ""}
            placeholder="Optional"
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Calendar Days */}
        <div>
          <label
            htmlFor="calendar_days"
            className="block text-sm font-medium text-gray-700"
          >
            CD / Calendar Days
          </label>

          <input
            id="calendar_days"
            name="calendar_days"
            type="number"
            min="0"
            step="1"
            defaultValue={request.calendar_days ?? ""}
            placeholder="Optional"
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* SOL Number */}
        <div>
          <label
            htmlFor="sol_no"
            className="block text-sm font-medium text-gray-700"
          >
            SOL No.
          </label>

          <input
            id="sol_no"
            name="sol_no"
            type="text"
            defaultValue={request.sol_no ?? ""}
            placeholder="Optional"
            className="text-gray-500 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Buttons */}

      <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
        <Link
          href={`/purchased-requests/${request.id}`}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
