"use client";

import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";

type UserMenuProps = {
  fullName?: string | null;
  email?: string | null;
};

export default function UserMenu({ fullName, email }: UserMenuProps) {
  const displayName = fullName || email || "User";

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
          {initial}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-45 truncate text-sm font-medium text-gray-800">
            {displayName}
          </p>

          {email && fullName && (
            <p className="max-w-45 truncate text-xs text-gray-500">{email}</p>
          )}
        </div>

        <svg
          className="hidden h-4 w-4 text-gray-500 sm:block"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>

      <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div className="border-b border-gray-200 px-4 py-4">
          <p className="text-sm font-semibold text-gray-900">{displayName}</p>

          {email && (
            <p className="mt-1 truncate text-xs text-gray-500">{email}</p>
          )}
        </div>

        <div className="p-2">
          <Link
            href="/profile"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Profile & Settings
          </Link>

          <div className="px-3 py-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </details>
  );
}
