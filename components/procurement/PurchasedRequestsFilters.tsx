"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

type PurchasedRequestsFiltersProps = {
  modes: string[];
  stages: string[];
  statuses: string[];
  typeOfPrs: string[];
};

export default function PurchasedRequestsFilters({
  modes,
  stages,
  statuses,
  typeOfPrs,
}: PurchasedRequestsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [mode, setMode] = useState(searchParams.get("mode") ?? "");
  const [stage, setStage] = useState(searchParams.get("stage") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [typeOfPr, setTypeOfPr] = useState(
    searchParams.get("type_of_pr") ?? "",
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") ?? "");

  const hasActiveFilters = Boolean(
    search.trim() || mode || stage || status || typeOfPr || dateFrom || dateTo,
  );

  const [isOpen, setIsOpen] = useState(Boolean(hasActiveFilters));

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

    if (typeOfPr) {
      params.set("type_of_pr", typeOfPr);
    }

    if (dateFrom) {
      params.set("date_from", dateFrom);
    }

    if (dateTo) {
      params.set("date_to", dateTo);
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
    setTypeOfPr("");
    setDateFrom("");
    setDateTo("");

    router.push("/purchased-requests");
  }

  return (
    <div>
      {/* Search & Filters Toggle */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-blue-600"
          aria-expanded={isOpen}
        >
          <svg
            className="h-4 w-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <span className="text-sm">Search & Filters</span>

          {hasActiveFilters && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              Active
            </span>
          )}

          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m6 9 6 6 6-6"
            />
          </svg>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] font-medium text-gray-500 transition-colors hover:text-red-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Collapsible Search & Filters */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 border-t pt-4">
          {/* Search */}
          <div className="mb-4">
            <label
              htmlFor="search"
              className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500"
            >
              Search
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="PR Number, Reference ID, or Particulars..."
                className="w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Filter Results
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {/* Mode */}
              <div>
                <label
                  htmlFor="mode"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Mode
                </label>

                <select
                  id="mode"
                  value={mode}
                  onChange={(event) => setMode(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Current Stage
                </label>

                <select
                  id="stage"
                  value={stage}
                  onChange={(event) => setStage(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
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
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Statuses</option>

                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type of PR */}
              <div>
                <label
                  htmlFor="type_of_pr"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  Type of PR
                </label>

                <select
                  id="type_of_pr"
                  value={typeOfPr}
                  onChange={(event) => setTypeOfPr(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Types</option>

                  {typeOfPrs.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label
                  htmlFor="date_from"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  PR Date From
                </label>

                <input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Date To */}
              <div>
                <label
                  htmlFor="date_to"
                  className="mb-1 block text-xs font-medium text-gray-600"
                >
                  PR Date To
                </label>

                <input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
