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

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700">Quick Date Range</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePreset("all")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All Time
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-month")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            This Month
          </button>

          <button
            type="button"
            onClick={() => handlePreset("last-month")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Last Month
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-quarter")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            This Quarter
          </button>

          <button
            type="button"
            onClick={() => handlePreset("this-year")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            This Year
          </button>
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="mb-3 text-sm font-medium text-gray-700">
          Custom Date Range
        </p>

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
              className="text-gray-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              className="text-gray-500 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
    </div>
  );
}
