"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";

import { updateOwnProfile, type EditProfileState } from "./actions";

type EditProfileProps = {
  currentFullName: string;
};

const initialState: EditProfileState = {};

export default function EditProfile({ currentFullName }: EditProfileProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState(currentFullName);

  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (previousState: EditProfileState, formData: FormData) => {
      const result = await updateOwnProfile(previousState, formData);

      if (result.success) {
        setIsModalOpen(false);
        router.refresh();
      }

      return result;
    },
    initialState,
  );

  function openModal() {
    setFullName(currentFullName);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (pending) {
      return;
    }

    setFullName(currentFullName);
    setIsModalOpen(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openModal}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-900"
        >
          Edit Full Name
        </button>

        {state.success && (
          <p className="text-xs font-medium text-green-700">
            ✓ {state.success}
          </p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Edit Full Name
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the name displayed on your PMIS account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="profile-full-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="profile-full-name"
                  name="full_name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={pending}
                  autoComplete="name"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {state.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-800">
                    {state.error}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={pending}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!fullName.trim() || pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
