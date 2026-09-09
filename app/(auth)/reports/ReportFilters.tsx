"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthStart(year: number, month: number) {
  return new Date(year, month, 1);
}

function getMonthEnd(year: number, month: number) {
  return new Date(year, month + 1, 0);
}

function getQuarterStart(year: number, month: number) {
  const quarterStartMonth = Math.floor(month / 3) * 3;

  return new Date(year, quarterStartMonth, 1);
}

function getQuarterEnd(year: number, month: number) {
  const quarterStartMonth = Math.floor(month / 3) * 3;

  return new Date(year, quarterStartMonth + 3, 0);
}

export default function ReportFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  function applyDates(fromDate: string, toDate: string) {
    setFrom(fromDate);
    setTo(toDate);

    const params = new URLSearchParams();

    if (fromDate) {
      params.set("from", fromDate);
    }

    if (toDate) {
      params.set("to", toDate);
    }

    const query = params.toString();

    router.push(query ? `/reports?${query}` : "/reports");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    applyDates(from, to);
  }

  function handlePreset(
    preset: "all" | "this-month" | "last-month" | "this-quarter" | "this-year",
  ) {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    switch (preset) {
      case "all":
        applyDates("", "");
        break;

      case "this-month": {
        const start = getMonthStart(year, month);
        const end = getMonthEnd(year, month);

        applyDates(formatDate(start), formatDate(end));

        break;
      }

      case "last-month": {
        const start = getMonthStart(year, month - 1);
        const end = getMonthEnd(year, month - 1);

        applyDates(formatDate(start), formatDate(end));

        break;
      }

      case "this-quarter": {
        const start = getQuarterStart(year, month);
        const end = getQuarterEnd(year, month);

        applyDates(formatDate(start), formatDate(end));

        break;
      }

      case "this-year": {
        const start = new Date(year, 0, 1);
        const end = new Date(year, 11, 31);

        applyDates(formatDate(start), formatDate(end));

        break;
      }
    }
  }

  function handleClear() {
    applyDates("", "");
  }

  function getActivePreset() {
    const today = new Date();

    const year = today.getFullYear();
    const month = today.getMonth();

    const thisMonthFrom = formatDate(getMonthStart(year, month));
    const thisMonthTo = formatDate(getMonthEnd(year, month));

    const lastMonthFrom = formatDate(getMonthStart(year, month - 1));
    const lastMonthTo = formatDate(getMonthEnd(year, month - 1));

    const thisQuarterFrom = formatDate(getQuarterStart(year, month));
    const thisQuarterTo = formatDate(getQuarterEnd(year, month));

    const thisYearFrom = `${year}-01-01`;
    const thisYearTo = `${year}-12-31`;

    if (!from && !to) {
      return "all";
    }

    if (from === thisMonthFrom && to === thisMonthTo) {
      return "this-month";
    }

    if (from === lastMonthFrom && to === lastMonthTo) {
      return "last-month";
    }

    if (from === thisQuarterFrom && to === thisQuarterTo) {
      return "this-quarter";
    }

    if (from === thisYearFrom && to === thisYearTo) {
      return "this-year";
    }

    return null;
  }

  const activePreset = getActivePreset();

  return (
    <div>
      {/* Quick Date Range */}
      <div>
        <p className="text-sm font-semibold tracking-tight text-gray-900">
          Quick Date Range
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Select a preset reporting period.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePreset("all")}
            className={
              activePreset === "all"
                ? "rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            }
          >
            All Time
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-month")}
            className={
              activePreset === "this-month"
                ? "rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            }
          >
            This Month
          </button>

          <button
            type="button"
            onClick={() => handlePreset("last-month")}
            className={
              activePreset === "last-month"
                ? "rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            }
          >
            Last Month
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-quarter")}
            className={
              activePreset === "this-quarter"
                ? "rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            }
          >
            This Quarter
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-year")}
            className={
              activePreset === "this-year"
                ? "rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                : "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            }
          >
            This Year
          </button>
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="mt-5 border-t border-gray-100 pt-5">
        <p className="text-sm font-semibold tracking-tight text-gray-900">
          Custom Date Range
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Specify the exact reporting period.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <label
              htmlFor="from"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              From Date
            </label>

            <input
              id="from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="min-w-0">
            <label
              htmlFor="to"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              To Date
            </label>

            <input
              id="to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div className="flex min-w-0 items-end gap-2 sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
