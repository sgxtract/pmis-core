"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";

import { updateUser } from "./actions";

type User = {
  id: string;
  full_name: string;
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
};

type State = {
  error?: string;
  success?: string;
};

const initialState: State = {};

export default function EditUserForm({ user, roles, userTypes }: Props) {
  const [state, formAction, pending] = useActionState(updateUser, initialState);

  const [selectedRoleId, setSelectedRoleId] = useState(String(user.role_id));

  const userRole = roles.find((role) => role.name === "User");

  const isRegularUser = userRole && Number(selectedRoleId) === userRole.id;

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

      {/* Employee ID */}
      <div>
        <label
          htmlFor="employee_id"
          className="block text-sm font-medium text-gray-800"
        >
          Employee ID
        </label>

        <input
          id="employee_id"
          name="employee_id"
          type="text"
          defaultValue={user.employee_id ?? ""}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        <p className="mt-1 text-xs text-gray-500">Optional.</p>
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role_id"
          className="block text-sm font-medium text-gray-800"
        >
          Role
        </label>

        <select
          id="role_id"
          name="role_id"
          value={selectedRoleId}
          onChange={(event) => setSelectedRoleId(event.target.value)}
          required
          className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {/* User Type */}
      {isRegularUser && (
        <div>
          <label
            htmlFor="user_type_id"
            className="block text-sm font-medium text-gray-800"
          >
            User Type
          </label>

          <select
            id="user_type_id"
            name="user_type_id"
            defaultValue={user.user_type_id ?? ""}
            required
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Select User Type
            </option>

            {userTypes.map((userType) => (
              <option key={userType.id} value={userType.id}>
                {userType.name}
              </option>
            ))}
          </select>
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
    </form>
  );
}
