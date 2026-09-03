import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {/* Error Code */}
        <p className="text-7xl font-extrabold tracking-tight text-blue-800">
          404
        </p>

        {/* Title */}
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm leading-6 text-gray-600">
          The page or procurement request you are looking for does not exist or
          may have been moved.
        </p>

        {/* Back Button */}
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
