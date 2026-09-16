"use client";

import { useEffect } from "react";
import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error("GLOBAL APPLICATION ERROR:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-600">
          !
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-gray-900">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          We were unable to complete your request. Please try again. If the
          problem continues, return to the home page and try again later.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
