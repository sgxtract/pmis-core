import Image from "next/image";

export default function Loading() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-gray-50 px-6"
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        {/* Sorsogon Province Official Seal */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
          <Image
            src="/sorsogon-logo.png"
            alt="Province of Sorsogon Official Seal"
            width={80}
            height={80}
            priority
            className="h-16 w-16 object-contain"
          />
        </div>

        <h1 className="mt-5 text-xl font-bold tracking-tight text-blue-950">
          Sorsogon Province Procurement
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Official Procurement Information Website
        </p>

        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-800"
            aria-hidden="true"
          />

          <span>Loading...</span>
        </div>
      </div>
    </main>
  );
}
