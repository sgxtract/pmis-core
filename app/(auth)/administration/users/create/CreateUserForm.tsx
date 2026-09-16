"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createUser, type CreateUserState } from "./actions";

type Role = {
  id: number;
  name: string;
};

type UserType = {
  id: number;
  name: string;
};

type Props = {
  roles: Role[];
  userTypes: UserType[];
};

const initialState: CreateUserState = {};

export default function CreateUserForm({ roles, userTypes }: Props) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState,
  );

  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");

  const userRole = roles.find((role) => role.name === "User");

  const isRegularUser = userRole && Number(selectedRoleId) === userRole.id;

  const isRoleSelected = (roleId: number) => Number(selectedRoleId) === roleId;
  const isUserTypeSelected = (userTypeId: number) =>
    Number(selectedUserTypeId) === userTypeId;

  function generateStrongPassword() {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{};':\"|<>?,./`~";

    const allCharacters = lowercase + uppercase + numbers + special;

    const getRandomCharacter = (characters: string) => {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return characters[array[0] % characters.length];
    };

    const requiredCharacters = [
      getRandomCharacter(lowercase),
      getRandomCharacter(uppercase),
      getRandomCharacter(numbers),
      getRandomCharacter(special),
    ];

    while (requiredCharacters.length < 12) {
      requiredCharacters.push(getRandomCharacter(allCharacters));
    }

    // Securely shuffle the generated characters.
    for (let i = requiredCharacters.length - 1; i > 0; i--) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);

      const j = array[0] % (i + 1);

      [requiredCharacters[i], requiredCharacters[j]] = [
        requiredCharacters[j],
        requiredCharacters[i],
      ];
    }

    return requiredCharacters.join("");
  }

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/administration/users");
        router.refresh();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Error */}
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      {/* Success */}
      {state.success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {state.success}
        </div>
      )}

      {/* Full Name */}
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>

        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          placeholder="Enter user's full name"
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Employee ID */}
      <div>
        <label
          htmlFor="employee_id"
          className="block text-sm font-medium text-gray-700"
        >
          Employee ID
        </label>

        <input
          id="employee_id"
          name="employee_id"
          type="text"
          placeholder="Enter employee ID"
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-500">Optional.</p>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email Address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Temporary Password
        </label>

        <div className="relative mt-2">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':&quot;|&lt;&gt;?,./`~]).{8,}"
            title="Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            placeholder="Enter a temporary password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-12 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={isPending}
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.58 10.58a2 2 0 102.83 2.83"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.88 4.24A9.77 9.77 0 0112 4c5 0 8.5 4 9.5 8a10.6 10.6 0 01-2.1 3.87"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.61 6.61C4.58 7.9 3.17 10.03 2.5 12c1 4 4.5 8 9.5 8 1.61 0 3.08-.4 4.39-1.11"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setPassword(generateStrongPassword());
              setShowPassword(true);
            }}
            disabled={isPending}
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generate Strong Password
          </button>

          {password && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(password);
                  setPasswordCopied(true);

                  setTimeout(() => {
                    setPasswordCopied(false);
                  }, 2000);
                } catch (error) {
                  console.error("COPY PASSWORD ERROR:", error);
                }
              }}
              disabled={isPending}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordCopied ? "✓ Copied" : "Copy Password"}
            </button>
          )}
        </div>

        <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium text-gray-700">
            Password requirements:
          </p>

          <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-gray-500">
            <li>At least 8 characters</li>
            <li>At least one uppercase letter</li>
            <li>At least one lowercase letter</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Give this temporary password to the user securely.
        </p>
      </div>

      {/* Role */}
      <div>
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700">
            Role
          </legend>

          <div className="mt-2 space-y-3">
            {[...roles]
              .sort((a, b) => {
                const order = {
                  Admin: 1,
                  Moderator: 2,
                  User: 3,
                };

                return (
                  order[a.name as keyof typeof order] -
                  order[b.name as keyof typeof order]
                );
              })
              .map((role) => {
                const selected = isRoleSelected(role.id);

                const description =
                  role.name === "Admin"
                    ? "Full system administration"
                    : role.name === "Moderator"
                      ? "Operational and user management"
                      : "Operational access only";

                return (
                  <label
                    key={role.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                        : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role_id"
                      value={role.id}
                      checked={selected}
                      onChange={(event) =>
                        setSelectedRoleId(event.target.value)
                      }
                      required
                      className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">
                        {role.name}
                      </span>

                      <span className="mt-1 block text-xs text-gray-500">
                        {description}
                      </span>
                    </span>
                  </label>
                );
              })}
          </div>
        </fieldset>
      </div>

      {/* User Type */}
      {isRegularUser && (
        <div>
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700">
              User Type
            </legend>

            <div className="mt-2 space-y-3">
              {userTypes.map((userType) => (
                <label
                  key={userType.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    isUserTypeSelected(userType.id)
                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                      : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="user_type_id"
                    value={userType.id}
                    checked={isUserTypeSelected(userType.id)}
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
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
        <button
          type="button"
          onClick={() => router.push("/administration/users")}
          disabled={isPending}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating User..." : "Create User"}
        </button>
      </div>
    </form>
  );
}
