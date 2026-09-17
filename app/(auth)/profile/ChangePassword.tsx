"use client";

import { startTransition, useState } from "react";
import { useActionState } from "react";

import {
  changeOwnPassword,
  type EditUserState,
} from "../administration/users/[id]/actions";

const initialState: EditUserState = {};

export default function ChangePassword() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const [state, formAction, pending] = useActionState(
    async (previousState: EditUserState, formData: FormData) => {
      const result = await changeOwnPassword(previousState, formData);

      if (result.success) {
        setIsModalOpen(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }

      return result;
    },
    initialState,
  );

  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
    matching:
      newPassword.length > 0 &&
      confirmPassword.length > 0 &&
      newPassword === confirmPassword,
  };

  const passwordIsValid =
    passwordRequirements.minLength &&
    passwordRequirements.lowercase &&
    passwordRequirements.uppercase &&
    passwordRequirements.number &&
    passwordRequirements.special &&
    passwordRequirements.matching;

  function generateStrongPassword() {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);

    const characters =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";

    let generated = "";

    for (const byte of randomBytes) {
      generated += characters[byte % characters.length];
    }

    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordIsValid) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <>
      <div className="rounded-lg border border-gray-200 px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Change Password
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Update your password to keep your account secure.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Change Password
          </button>
        </div>
      </div>

      {state.success && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-800">{state.success}</p>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create a strong password for your PMIS account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
              <div>
                <label
                  htmlFor="profile-current-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>

                <input
                  id="profile-current-password"
                  name="current_password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  disabled={pending}
                  autoComplete="current-password"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-new-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>

                <div className="relative mt-1">
                  <input
                    id="profile-new-password"
                    name="password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={pending}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-20 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-confirm-password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>

                <div className="relative mt-1">
                  <input
                    id="profile-confirm-password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={pending}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-20 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={generateStrongPassword}
                disabled={pending}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate Strong Password
              </button>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-medium text-gray-700">
                  Password requirements
                </p>

                <ul className="mt-2 space-y-1 text-xs">
                  <Requirement
                    met={passwordRequirements.minLength}
                    text="At least 8 characters"
                  />
                  <Requirement
                    met={passwordRequirements.lowercase}
                    text="At least one lowercase letter"
                  />
                  <Requirement
                    met={passwordRequirements.uppercase}
                    text="At least one uppercase letter"
                  />
                  <Requirement
                    met={passwordRequirements.number}
                    text="At least one number"
                  />
                  <Requirement
                    met={passwordRequirements.special}
                    text="At least one special character"
                  />
                  <Requirement
                    met={passwordRequirements.matching}
                    text="Passwords match"
                  />
                </ul>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setShowNewPassword(false);
                    setShowConfirmPassword(false);
                  }}
                  disabled={pending}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!passwordIsValid || pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className={met ? "text-green-700" : "text-gray-500"}>
      <span className="mr-2">{met ? "✓" : "○"}</span>
      {text}
    </li>
  );
}
