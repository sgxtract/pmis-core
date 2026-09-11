"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type PurchasedRequestsFiltersProps = {
  modes: string[];
  stages: string[];
  statuses: string[];
};

export default function PurchasedRequestsFilters({
  modes,
  stages,
  statuses,
}: PurchasedRequestsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [mode, setMode] = useState(searchParams.get("mode") ?? "");
  const [stage, setStage] = useState(searchParams.get("stage") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (mode) {
      params.set("mode", mode);
    }

    if (stage) {
      params.set("stage", stage);
    }

    if (status) {
      params.set("status", status);
    }

    params.set("page", "1");

    const queryString = params.toString();

    router.push(
      queryString
        ? `/purchased-requests?${queryString}`
        : "/purchased-requests",
    );
  }

  function handleClear() {
    setSearch("");
    setMode("");
    setStage("");
    setStatus("");

    router.push("/purchased-requests");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Search
        </label>

        <input
          id="search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="PR Number, Reference ID, or Particulars..."
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />

        <p className="mt-1 text-xs text-gray-500">
          Search by PR Number, Reference ID, or Particulars.
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Mode */}
        <div>
          <label
            htmlFor="mode"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Mode of Procurement
          </label>

          <select
            id="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Modes</option>

            {modes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label
            htmlFor="stage"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Current Stage
          </label>

          <select
            id="stage"
            value={stage}
            onChange={(event) => setStage(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Stages</option>

            {stages.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>

            {statuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
