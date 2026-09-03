"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createUser, type CreateUserState } from "./actions";

type Role = {
  id: number;
  name: string;
};

type Props = {
  roles: Role[];
};

const initialState: CreateUserState = {};

export default function CreateUserForm({ roles }: Props) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState,
  );

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

        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Minimum 8 characters"
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-500">
          Give this temporary password to the user securely.
        </p>
      </div>

      {/* Office */}
      <div>
        <label
          htmlFor="office"
          className="block text-sm font-medium text-gray-700"
        >
          Office
        </label>

        <select
          id="office"
          name="office"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="" disabled>
            Select office
          </option>

          <option value="PBAC">PBAC</option>

          <option value="TWG">TWG</option>
        </select>
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role_id"
          className="block text-sm font-medium text-gray-700"
        >
          Role
        </label>

        <select
          id="role_id"
          name="role_id"
          required
          defaultValue=""
          className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="" disabled>
            Select role
          </option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

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
