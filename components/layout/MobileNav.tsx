"use client";

import { useState } from "react";
import Link from "next/link";

type MobileNavProps = {
  isAdmin: boolean;
};

export default function MobileNav({ isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Mobile navigation overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Background overlay */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close navigation menu"
          />

          {/* Navigation panel */}
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            {/* Menu header */}
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div>
                <h2 className="font-bold text-gray-900">PMIS</h2>

                <p className="text-xs text-gray-500">
                  Procurement Management Information System
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close navigation menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <p className="px-3 pb-2 text-xs font-semibold uppercase text-gray-400">
                Main Menu
              </p>

              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                Dashboard
              </Link>

              <Link
                href="/purchased-requests"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                Purchased Requests
              </Link>

              <Link
                href="/reports"
                onClick={() => setIsOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
              >
                Reports
              </Link>

              {isAdmin && (
                <>
                  <Link
                    href="/audit-logs"
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Audit Logs
                  </Link>

                  <div className="pt-4">
                    <p className="px-3 pb-2 text-xs font-semibold uppercase text-gray-400">
                      Administration
                    </p>

                    <Link
                      href="/administration"
                      onClick={() => setIsOpen(false)}
                      className="block rounded-lg px-3 py-3 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
