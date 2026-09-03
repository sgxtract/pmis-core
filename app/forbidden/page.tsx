import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
        <div className="text-5xl font-bold text-red-600">403</div>

        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          You do not have permission to access this page.
        </p>

        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
