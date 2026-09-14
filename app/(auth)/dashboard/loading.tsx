export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      {/* Page heading */}
      <div>
        <div className="h-9 w-40 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-2 h-5 w-80 max-w-full animate-pulse rounded bg-gray-200" />
      </div>

      {/* KPI cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl bg-white p-6 shadow-sm">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-9 w-16 animate-pulse rounded bg-gray-200" />
            <div className="mt-3 h-3 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Stage overview */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-56 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-7 w-20 animate-pulse rounded-full bg-gray-200" />
              </div>

              <div className="mt-3 h-2 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent requests */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-80 max-w-full animate-pulse rounded bg-gray-200" />
        </div>

        <div className="space-y-4 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-5 flex-1 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
