"use client";

import { useState } from "react";
import { createProcurementRequest } from "./actions";

type NewPRFormProps = {
  procurementModes: {
    id: number;
    name: string;
  }[];
};

export default function NewPRForm({ procurementModes }: NewPRFormProps) {
  const [prNumber, setPrNumber] = useState("");
  const [prDate, setPrDate] = useState("");
  const [particulars, setParticulars] = useState("");
  const [abc, setAbc] = useState("");
  const [procurementMode, setProcurementMode] = useState("");
  const [typeOfPr, setTypeOfPr] = useState("");
  const [endUser, setEndUser] = useState("");
  const [accountCode, setAccountCode] = useState("");
  const [calendarDays, setCalendarDays] = useState("");
  const [solNo, setSolNo] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createProcurementRequest(formData);

      if (!result.success) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }
    } catch (error) {
      console.error("CREATE PR FORM ERROR:", error);

      setError("Unable to create the procurement request. Please try again.");

      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* PR Number */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">Unable to create PR</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="prNumber"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          PR Number <span className="text-red-500">*</span>
        </label>

        <input
          id="prNumber"
          name="pr_number"
          type="text"
          value={prNumber}
          onChange={(event) => setPrNumber(event.target.value)}
          placeholder="Enter PR Number"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* PR Date */}
      <div>
        <label
          htmlFor="prDate"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          PR Date <span className="text-red-500">*</span>
        </label>

        <input
          id="prDate"
          name="pr_date"
          type="date"
          value={prDate}
          onChange={(event) => setPrDate(event.target.value)}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Particulars */}
      <div>
        <label
          htmlFor="particulars"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Particulars / Project Name <span className="text-red-500">*</span>
        </label>

        <textarea
          id="particulars"
          name="particulars"
          value={particulars}
          onChange={(event) => setParticulars(event.target.value)}
          placeholder="Enter Particulars / Project Name"
          rows={4}
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* ABC */}
      <div>
        <label
          htmlFor="abc"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          ABC <span className="text-red-500">*</span>
        </label>

        <input
          id="abc"
          name="abc"
          type="number"
          min="0"
          step="0.01"
          value={abc}
          onChange={(event) => setAbc(event.target.value)}
          placeholder="Enter Approved Budget for the Contract"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Procurement Mode */}
      <div>
        <label
          htmlFor="procurementMode"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Mode of Procurement
        </label>

        <select
          id="procurementMode"
          name="mode_of_procurement_id"
          value={procurementMode}
          onChange={(event) => setProcurementMode(event.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Select Procurement Mode (Optional)</option>

          {procurementModes.map((mode) => (
            <option key={mode.id} value={mode.id}>
              {mode.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type of PR */}
      <div>
        <label
          htmlFor="typeOfPr"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Type of PR <span className="text-red-500">*</span>
        </label>

        <input
          id="typeOfPr"
          name="type_of_pr"
          type="text"
          value={typeOfPr}
          onChange={(event) => setTypeOfPr(event.target.value)}
          placeholder="e.g. Goods, Infrastructure, Consulting Services"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* End User */}
      <div>
        <label
          htmlFor="endUser"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          End-User <span className="text-red-500">*</span>
        </label>

        <input
          id="endUser"
          name="end_user"
          type="text"
          value={endUser}
          onChange={(event) => setEndUser(event.target.value)}
          placeholder="Enter End-User"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Account Code */}
      <div>
        <label
          htmlFor="account_code"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Account Code
        </label>

        <input
          id="account_code"
          name="account_code"
          type="text"
          placeholder="Optional"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Calendar Days */}
      <div>
        <label
          htmlFor="calendar_days"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          CD / Calendar Days
        </label>

        <input
          id="calendar_days"
          name="calendar_days"
          type="number"
          min="0"
          step="1"
          placeholder="Optional"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* SOL Number */}
      <div>
        <label
          htmlFor="sol_no"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          SOL No.
        </label>

        <input
          id="sol_no"
          name="sol_no"
          type="text"
          placeholder="Optional"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end border-t pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating PR..." : "Create PR"}
        </button>
      </div>
    </form>
  );
}
