"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProcurementRequestError({ error, reset }: Props) {
  useEffect(() => {
    console.error("PROCUREMENT REQUEST PAGE ERROR:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        role="alert"
        className="w-full max-w-lg rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl text-red-600">
          !
        </div>

        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          Unable to load procurement request
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Something went wrong while loading this procurement request. Please
          try again.
        </p>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
