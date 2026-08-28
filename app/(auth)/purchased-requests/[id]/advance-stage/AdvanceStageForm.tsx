"use client";

import { useActionState } from "react";

import {
  advanceProcurementStage,
  type AdvanceStageState,
} from "./actions";

type Props = {
  requestId: number;
  nextStageName: string;
};

const initialState: AdvanceStageState = {};

export default function AdvanceStageForm({
  requestId,
  nextStageName,
}: Props) {
  const [state, formAction, isPending] =
    useActionState(
      advanceProcurementStage.bind(
        null,
        String(requestId)
      ),
      initialState
    );

  return (
    <form
      action={formAction}
      className="mt-4"
    >

      {/* Error */}

      {state?.error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Remarks */}

      <div>
        <label
          htmlFor="remarks"
          className="block text-sm font-medium text-gray-700"
        >
          Remarks
          <span className="font-normal text-gray-500">
            {" "}
            (Optional)
          </span>
        </label>

        <textarea
          id="remarks"
          name="remarks"
          rows={3}
          placeholder="Add remarks for this stage transition..."
          className="text-gray-600 mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Button */}

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending
          ? "Moving..."
          : `Move to ${nextStageName}`}
      </button>

    </form>
  );
}