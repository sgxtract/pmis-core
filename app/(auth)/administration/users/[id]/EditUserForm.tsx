"use client";

import { useActionState } from "react";
import Link from "next/link";

import { updateUser } from "./actions";

type User = {
  id: string;
  full_name: string;
  office: string;
  role_id: number;
  is_active: boolean;
};

type Role = {
  id: number;
  name: string;
};

type Props = {
  user: User;
  roles: Role[];
};

type State = {
  error?: string;
  success?: string;
};

const initialState: State = {};

export default function EditUserForm({ user, roles }: Props) {
  const [state, formAction, pending] = useActionState(updateUser, initialState);

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="id" value={user.id} />

      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {state.success}
        </div>
      )}

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
          className="text-gray-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label
          htmlFor="office"
          className="block text-sm font-medium text-gray-800"
        >
          Office
        </label>

        <select
          id="office"
          name="office"
          defaultValue={user.office}
          required
          className="bg-white text-gray-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="PBAC">PBAC</option>
          <option value="TWG">TWG</option>
        </select>
      </div>

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
          defaultValue={user.role_id}
          required
          className="text-gray-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="is_active"
          className="block text-sm font-medium text-gray-800"
        >
          Account Status
        </label>

        <select
          id="is_active"
          name="is_active"
          defaultValue={user.is_active ? "true" : "false"}
          required
          className="text-gray-500 mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </div>

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
