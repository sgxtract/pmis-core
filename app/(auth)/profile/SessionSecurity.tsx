"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export default function SessionSecurity() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signOutOtherSessions() {
    setPending(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();

    const { error: signOutError } = await supabase.auth.signOut({
      scope: "others",
    });

    setPending(false);
    setIsConfirmOpen(false);

    if (signOutError) {
      console.error("SIGN OUT OTHER SESSIONS ERROR:", signOutError);

      setError("Unable to sign out other sessions. Please try again.");

      return;
    }

    setMessage("All other active sessions have been signed out.");
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Other Sessions
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Sign out of PMIS sessions on other devices and browsers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setMessage(null);
              setError(null);
              setIsConfirmOpen(true);
            }}
            className="shrink-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900"
          >
            Sign Out Other Sessions
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm font-medium text-green-800">✓ {message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}
      </div>

      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="px-6 py-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Sign Out Other Sessions?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                This will sign you out of PMIS on all other devices and
                browsers. Your current session will remain active.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  disabled={pending}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={signOutOtherSessions}
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Signing Out..." : "Sign Out Other Sessions"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
