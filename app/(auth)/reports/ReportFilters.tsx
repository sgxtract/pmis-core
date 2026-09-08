"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(
    searchParams.get("from") ?? "",
  );

  const [to, setTo] = useState(
    searchParams.get("to") ?? "",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (from) {
      params.set("from", from);
    }

    if (to) {
      params.set("to", to);
    }

    const query = params.toString();

    router.push(query ? `/reports?${query}` : "/reports");
  }

  function handleClear() {
    setFrom("");
    setTo("");
    router.push("/reports");
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="from"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            From Date
          </label>

          <input
            id="from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex-1">
          <label
            htmlFor="to"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            To Date
          </label>

          <input
            id="to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}