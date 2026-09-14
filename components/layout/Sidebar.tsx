"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

type SidebarProps = {
  isAdmin: boolean;
  canManageUsers: boolean;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

function DashboardIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function RequestsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h5" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V7" />
      <path d="M16 16v-3" />
    </svg>
  );
}

function AuditIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 4h16v16H4z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.7 1.7-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V20h-2.4v-.2a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.7-1.7.06-.06A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.56-1.03H6v-2.4h.84A1.7 1.7 0 0 0 8.4 10a1.7 1.7 0 0 0-.34-1.88L8 8.06l1.7-1.7.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12.67 5.2V5h2.4v.2A1.7 1.7 0 0 0 16.1 6.76a1.7 1.7 0 0 0 1.88-.34l.06-.06 1.7 1.7-.06.06A1.7 1.7 0 0 0 19.34 10a1.7 1.7 0 0 0 1.56 1.03h.1v2.4h-.1A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

const SIDEBAR_STORAGE_KEY = "pmis-sidebar-collapsed";

function subscribeToSidebarState(callback: () => void) {
  window.addEventListener("pmis-sidebar-state-change", callback);

  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("pmis-sidebar-state-change", callback);

    window.removeEventListener("storage", callback);
  };
}

function getSidebarState() {
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

function getServerSidebarState() {
  return false;
}

function UsersIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default function Sidebar({ isAdmin, canManageUsers }: SidebarProps) {
  const collapsed = useSyncExternalStore(
    subscribeToSidebarState,
    getSidebarState,
    getServerSidebarState,
  );

  function toggleSidebar() {
    const nextState = !collapsed;

    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextState));

    window.dispatchEvent(new Event("pmis-sidebar-state-change"));
  }

  const mainMenu: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <DashboardIcon />,
    },
    {
      label: "Purchased Requests",
      href: "/purchased-requests",
      icon: <RequestsIcon />,
    },
    {
      label: "Reports",
      href: "/reports",
      icon: <ReportsIcon />,
    },
  ];

  const administrationMenu: NavItem[] = [
    ...(canManageUsers
      ? [
          {
            label: "User Management",
            href: "/administration/users",
            icon: <UsersIcon />,
          },
        ]
      : []),
    ...(canManageUsers
      ? [
          {
            label: "Audit Logs",
            href: "/administration/audit-logs",
            icon: <AuditIcon />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: "Settings",
            href: "/administration",
            icon: <SettingsIcon />,
          },
        ]
      : []),
  ];

  function renderMenuItem(item: NavItem) {
    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`group flex items-center rounded-lg text-sm text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 ${
          collapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-2.5"
        }`}
      >
        {item.icon}

        <span
          className={`whitespace-nowrap transition-all duration-200 ${
            collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
          }`}
        >
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <aside
      className={`relative hidden min-h-full shrink-0 border-r bg-white md:flex md:flex-col ${
        collapsed ? "w-20" : "w-64"
      } transition-[width] duration-200`}
    >
      <button
        type="button"
        onClick={toggleSidebar}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-5 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </button>

      <div className="flex-1 overflow-hidden p-4">
        <p
          className={`mb-3 px-3 text-xs font-semibold tracking-wide text-gray-400 transition-opacity ${
            collapsed ? "opacity-0" : "opacity-100"
          }`}
        >
          MAIN MENU
        </p>

        <nav className="space-y-1">{mainMenu.map(renderMenuItem)}</nav>

        {canManageUsers && (
          <div className="mt-8">
            <p
              className={`mb-3 px-3 text-xs font-semibold tracking-wide text-gray-400 transition-opacity ${
                collapsed ? "opacity-0" : "opacity-100"
              }`}
            >
              ADMINISTRATION
            </p>

            <nav className="space-y-1">
              {administrationMenu.map(renderMenuItem)}
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
}
