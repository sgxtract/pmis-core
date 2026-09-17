"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import Link from "next/link";

import {
  changeUserEmail,
  changeUserPassword,
  updateUser,
  type EditUserState,
} from "./actions";

type User = {
  id: string;
  full_name: string;
  email: string;
  employee_id: string | null;
  role_id: number;
  user_type_id: number | null;
  is_active: boolean;
};

type Role = {
  id: number;
  name: string;
};

type UserType = {
  id: number;
  name: string;
};

type Props = {
  user: User;
  roles: Role[];
  userTypes: UserType[];
  currentUserRole: string;
};

type State = {
  error?: string;
  success?: string;
};

const initialState: State = {};

export default function EditUserForm({
  user,
  roles,
  userTypes,
  currentUserRole,
}: Props) {
  const router = useRouter();

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [state, formAction, pending] = useActionState(updateUser, initialState);

  const [emailState, emailFormAction, emailPending] = useActionState(
    async (previousState: EditUserState, formData: FormData) => {
      const result = await changeUserEmail(previousState, formData);

      if (result.success) {
        setIsEmailModalOpen(false);
        setNewEmail("");
        router.refresh();
      }

      return result;
    },
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  const [passwordState, passwordFormAction, passwordPending] = useActionState(
    async (previousState: EditUserState, formData: FormData) => {
      const result = await changeUserPassword(previousState, formData);

      if (result.success) {
        setIsPasswordModalOpen(false);
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

  const [selectedRoleId, setSelectedRoleId] = useState(String(user.role_id));
  const [selectedUserTypeId, setSelectedUserTypeId] = useState(
    user.user_type_id ? String(user.user_type_id) : "",
  );
  const isUserTypeSelected = (userTypeId: number) =>
    Number(selectedUserTypeId) === userTypeId;

  const userRole = roles.find((role) => role.name === "User");

  const isRegularUser = userRole && Number(selectedRoleId) === userRole.id;

  const visibleRoles = (
    currentUserRole === "Moderator"
      ? roles.filter((role) => role.name === "User")
      : roles
  ).sort((a, b) => {
    const order = {
      Admin: 1,
      Moderator: 2,
      User: 3,
    };

    return (
      order[a.name as keyof typeof order] - order[b.name as keyof typeof order]
    );
  });

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="user_id" value={user.id} />

      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {state.success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
        >
          {state.success}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-800"
        >
          Full Name
        </label>

        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={user.full_name}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Email Address */}
      <div>
        <p className="text-sm font-medium text-gray-800">Email Address</p>

        <p className="mt-1 text-sm text-gray-700">{user.email}</p>

        <p className="mt-1 text-xs text-gray-500">
          This email address is used to sign in to the PMIS.
        </p>

        {currentUserRole === "Admin" && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                setNewEmail(user.email);
                setIsEmailModalOpen(true);
              }}
              disabled={emailPending}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Change Email
            </button>
          </div>
        )}

        {emailState.error && (
          <div
            role="alert"
            className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {emailState.error}
          </div>
        )}

        {emailState.success && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {emailState.success}
          </div>
        )}
      </div>

      {/* Employee ID */}
      <div>
        <p className="text-sm font-medium text-gray-800">Employee ID</p>

        <p className="mt-1 text-sm text-gray-700">
          {user.employee_id ?? "Not assigned"}
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Employee ID cannot be changed after the user account is created.
        </p>
      </div>

      {/* Password */}
      <div>
        <p className="text-sm font-medium text-gray-800">Password</p>

        <p className="mt-1 text-sm text-gray-700">
          Change this user&apos;s PMIS sign-in password.
        </p>

        <p className="mt-1 text-xs text-gray-500">
          Password changes are managed separately from the user&apos;s profile
          information.
        </p>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              setNewPassword("");
              setConfirmPassword("");
              setShowNewPassword(false);
              setShowConfirmPassword(false);
              setIsPasswordModalOpen(true);
            }}
            disabled={passwordPending}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Change Password
          </button>
        </div>
        {passwordState.success && (
          <div
            role="status"
            className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {passwordState.success}
          </div>
        )}
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm font-medium text-gray-800">Role</label>

        <div className="mt-2 space-y-3">
          {visibleRoles.map((role) => {
            const isSelected = Number(selectedRoleId) === role.id;

            return (
              <label
                key={role.id}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role_id"
                  value={role.id}
                  checked={isSelected}
                  onChange={() => setSelectedRoleId(String(role.id))}
                  required
                  className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {role.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {role.name === "Admin" && "Full system administration"}

                    {role.name === "Moderator" &&
                      "Operational and user management"}

                    {role.name === "User" && "Operational access only"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* User Type */}
      {isRegularUser && (
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-800">
              User Type
            </legend>

            <div className="mt-2 space-y-3">
              {userTypes.map((userType) => {
                const selected = isUserTypeSelected(userType.id);

                return (
                  <label
                    key={userType.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="user_type_id"
                      value={userType.id}
                      checked={selected}
                      onChange={(event) =>
                        setSelectedUserTypeId(event.target.value)
                      }
                      required
                      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">
                        {userType.name}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}

      {/* Account Status */}
      <div>
        <label
          htmlFor="is_active"
          className="block text-sm font-medium text-gray-700"
        >
          Account Status
        </label>

        <select
          id="is_active"
          name="is_active"
          defaultValue={user.is_active ? "true" : "false"}
          className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5">
        <Link
          href="/administration/users"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-email-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div>
              <h2
                id="change-email-title"
                className="text-lg font-semibold text-gray-900"
              >
                Change Email Address
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update the email address used by this user to sign in to the
                PMIS.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {/* Current Email */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Current Email
                </p>

                <p className="mt-1 text-sm text-gray-800">{user.email}</p>
              </div>

              {/* New Email */}
              <div>
                <label
                  htmlFor="new_email"
                  className="block text-sm font-medium text-gray-800"
                >
                  New Email Address
                </label>

                <input
                  id="new_email"
                  type="email"
                  value={newEmail}
                  onChange={(event) => setNewEmail(event.target.value)}
                  autoFocus
                  disabled={emailPending}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                  placeholder="Enter new email address"
                />
              </div>

              {emailState.error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {emailState.error}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setNewEmail("");
                }}
                disabled={emailPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  emailPending ||
                  !newEmail.trim() ||
                  newEmail.trim().toLowerCase() === user.email.toLowerCase()
                }
                onClick={() => {
                  const formData = new FormData();
                  formData.set("user_id", user.id);
                  formData.set("email", newEmail.trim());

                  startTransition(() => {
                    emailFormAction(formData);
                  });
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {emailPending ? "Changing Email..." : "Change Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="change-password-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div>
              <h2
                id="change-password-title"
                className="text-lg font-semibold text-gray-900"
              >
                Change Password
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Set a new password for this user&apos;s PMIS account.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {/* New Password */}
              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-800"
                >
                  New Password
                </label>

                <div className="relative mt-1">
                  <input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoFocus
                    disabled={passwordPending}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    disabled={passwordPending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-800"
                >
                  Confirm New Password
                </label>

                <div className="relative mt-1">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={passwordPending}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-16 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                    placeholder="Re-enter new password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={passwordPending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Generate Password */}
              <button
                type="button"
                disabled={passwordPending}
                onClick={() => {
                  const lowercase = "abcdefghijklmnopqrstuvwxyz";
                  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  const numbers = "0123456789";
                  const special = "!@#$%^&*";
                  const all = lowercase + uppercase + numbers + special;

                  const randomChar = (characters: string) =>
                    characters[
                      crypto.getRandomValues(new Uint32Array(1))[0] %
                        characters.length
                    ];

                  const requiredCharacters = [
                    randomChar(lowercase),
                    randomChar(uppercase),
                    randomChar(numbers),
                    randomChar(special),
                  ];

                  const remainingCharacters = Array.from(
                    crypto.getRandomValues(new Uint32Array(8)),
                    (value) => all[value % all.length],
                  );

                  const password = [
                    ...requiredCharacters,
                    ...remainingCharacters,
                  ].join("");

                  setNewPassword(password);
                  setConfirmPassword(password);
                  setShowNewPassword(true);
                  setShowConfirmPassword(true);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate Strong Password
              </button>

              {/* Password Requirements */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-800">
                  Password requirements
                </p>

                <div className="mt-2 space-y-1.5 text-xs">
                  <p
                    className={
                      passwordRequirements.minLength
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.minLength ? "✓" : "○"} At least 8
                    characters
                  </p>

                  <p
                    className={
                      passwordRequirements.lowercase
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.lowercase ? "✓" : "○"} One lowercase
                    letter
                  </p>

                  <p
                    className={
                      passwordRequirements.uppercase
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.uppercase ? "✓" : "○"} One uppercase
                    letter
                  </p>

                  <p
                    className={
                      passwordRequirements.number
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.number ? "✓" : "○"} One number
                  </p>

                  <p
                    className={
                      passwordRequirements.special
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.special ? "✓" : "○"} One special
                    character
                  </p>

                  <p
                    className={
                      passwordRequirements.matching
                        ? "text-green-700"
                        : "text-gray-500"
                    }
                  >
                    {passwordRequirements.matching ? "✓" : "○"} Passwords match
                  </p>
                </div>
              </div>

              {passwordState.error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {passwordState.error}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                }}
                disabled={passwordPending}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!passwordIsValid || passwordPending}
                onClick={() => {
                  const formData = new FormData();

                  formData.set("user_id", user.id);
                  formData.set("password", newPassword);
                  formData.set("confirm_password", confirmPassword);

                  startTransition(() => {
                    passwordFormAction(formData);
                  });
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {passwordPending ? "Changing Password..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
