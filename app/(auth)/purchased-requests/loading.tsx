export default function Loading() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-gray-200 sm:h-9 sm:w-72" />

          <div className="h-4 w-72 animate-pulse rounded bg-gray-200 sm:w-96" />

          <div className="h-4 w-52 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-24" />
      </div>

      {/* Main Card */}
      <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm sm:mt-8">
        {/* Filters */}
        <div className="space-y-5 border-b p-4 sm:p-5">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 animate-pulse rounded-lg bg-gray-200" />
          </div>

          <div className="flex gap-2 border-t pt-4">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-10 w-20 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="hidden md:block">
          <div className="border-b bg-gray-50 px-6 py-4">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          </div>

          <div className="divide-y">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-7 gap-4 px-6 py-5">
                {Array.from({ length: 7 }).map((_, columnIndex) => (
                  <div
                    key={columnIndex}
                    className="h-4 animate-pulse rounded bg-gray-100"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="divide-y md:hidden">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-4 p-4">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
