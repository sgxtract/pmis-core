"use client";

import { useState } from "react";
import { useActionState } from "react";
import { cancelProcurementRequest } from "./actions";

type CancelPRFormProps = {
  requestId: number;
};

const initialState = {
  error: "",
  success: false,
};

export default function CancelPRForm({ requestId }: CancelPRFormProps) {
  const [state, formAction, isPending] = useActionState(
    cancelProcurementRequest.bind(null, String(requestId)),
    initialState,
  );

  const [showConfirmation, setShowConfirmation] = useState(false);

  function handleConfirm() {
    setShowConfirmation(false);

    const form = document.getElementById(
      "cancel-pr-form",
    ) as HTMLFormElement | null;

    form?.requestSubmit();
  }

  return (
    <>
      <form id="cancel-pr-form" action={formAction} className="space-y-4">
        <button
          type="button"
          onClick={() => setShowConfirmation(true)}
          disabled={isPending}
          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Cancelling..." : "Cancel PR"}
        </button>

        {state?.error && (
          <p className="text-sm font-medium text-red-600">{state.error}</p>
        )}
      </form>

      {/* Confirmation Modal */}

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Header */}

            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Cancel Procurement Request
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700">
                Are you sure you want to cancel this procurement request?
              </p>

              <p className="mt-3 text-sm text-gray-500">
                The request will no longer be allowed to advance until it is
                restored.
              </p>

              <div className="mt-4">
                <label
                  htmlFor="cancel-remarks"
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  Remarks{" "}
                  <span className="font-normal text-gray-400">(Optional)</span>
                </label>

                <textarea
                  id="cancel-remarks"
                  name="remarks"
                  form="cancel-pr-form"
                  rows={3}
                  maxLength={2000}
                  placeholder="Explain why this procurement request is being cancelled..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* Actions */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Keep Request
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, Cancel PR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
