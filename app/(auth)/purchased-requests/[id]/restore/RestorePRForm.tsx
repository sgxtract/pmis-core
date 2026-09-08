"use client";

import { useActionState } from "react";
import { restoreProcurementRequest } from "./actions";

type RestorePRFormProps = {
  requestId: number;
};

const initialState = {
  error: "",
  success: false,
};

export default function RestorePRForm({
  requestId,
}: RestorePRFormProps) {
  const [state, formAction, isPending] = useActionState(
    restoreProcurementRequest.bind(null, String(requestId)),
    initialState,
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      "Are you sure you want to restore this cancelled procurement request?\n\nThe status will be changed back to Active.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Restoring..." : "Restore PR"}
      </button>

      {state?.error && (
        <p className="text-sm font-medium text-red-600">
          {state.error}
        </p>
      )}
    </form>
  );
}