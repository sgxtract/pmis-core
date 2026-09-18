"use client";

import { useActionState } from "react";
import { useState } from "react";

import { advanceProcurementStage, type AdvanceStageState } from "./actions";

type Props = {
  requestId: number;
  currentStageName: string;
  nextStageName: string;
};

const initialState: AdvanceStageState = {};

export default function AdvanceStageForm({
  requestId,
  currentStageName,
  nextStageName,
}: Props) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [state, formAction, isPending] = useActionState(
    advanceProcurementStage.bind(null, String(requestId)),
    initialState,
  );

  return (
    <>
      <form id="advance-stage-form" action={formAction}>
        {state?.error && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.error}
          </div>
        )}

        <label
          htmlFor="remarks"
          className="block text-sm font-medium text-gray-700"
        >
          Remarks
          <span className="font-normal text-gray-500"> (Optional)</span>
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id="remarks"
            name="remarks"
            rows={2}
            placeholder="Add remarks..."
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            disabled={isPending}
            className="shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Advance Stage →
          </button>
        </div>
      </form>

      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Advance Procurement Stage
              </h2>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to move this procurement request to the
                next stage?
              </p>

              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <div className="text-sm text-gray-500">Current Stage</div>

                <div className="mt-1 font-semibold text-gray-900">
                  {currentStageName}
                </div>

                <div className="my-3 text-center text-gray-400">↓</div>

                <div className="text-sm text-gray-500">Next Stage</div>

                <div className="mt-1 font-semibold text-blue-600">
                  {nextStageName}
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                This action will be recorded in the procurement stage history
                and audit log.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isPending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Keep Current Stage
              </button>

              <button
                type="submit"
                form="advance-stage-form"
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Moving..." : `Move to ${nextStageName}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
