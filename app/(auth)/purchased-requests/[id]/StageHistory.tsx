type StageHistoryItem = {
  id: number;
  stage_id: number;
  stage_name: string;
  sequence_number: number;
  started_at: string;
  completed_at: string | null;
  remarks: string | null;
  changed_by_name: string | null;
};

type Props = {
  history: StageHistoryItem[];
  currentStageId: number | null;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function StageHistory({ history, currentStageId }: Props) {
  if (history.length === 0) {
    return (
      <div className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Stage History</h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-500">
            No stage history is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border bg-white shadow-sm">
      {/* Header */}

      <div className="border-b px-6 py-4">
        <h2 className="font-semibold text-gray-900">Stage History</h2>

        <p className="mt-1 text-sm text-gray-500">
          Record of procurement stage movements.
        </p>
      </div>

      {/* Timeline */}

      <div className="p-6">
        <div className="space-y-0">
          {history.map((item, index) => {
            const isCurrent = item.stage_id === currentStageId;

            const isCompleted = !isCurrent && item.completed_at !== null;

            const isLast = index === history.length - 1;

            return (
              <div key={item.id} className="relative flex gap-4">
                {/* Connector */}

                {!isLast && (
                  <div
                    className={`absolute left-4 top-8 h-[calc(100%-8px)] w-px ${
                      isCompleted ? "bg-green-200" : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Status Circle */}

                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCurrent ? "●" : isCompleted ? "✓" : "•"}
                </div>

                {/* Content */}

                <div className="min-w-0 flex-1 pb-8">
                  {/* Stage name */}

                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`font-semibold ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                            ? "text-gray-900"
                            : "text-gray-400"
                      }`}
                    >
                      {item.stage_name}
                    </h3>

                    {isCurrent && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                        Current Stage
                      </span>
                    )}
                  </div>

                  {/* Started */}

                  <p className="mt-1 text-sm text-gray-500">
                    Started: {formatDateTime(item.started_at)}
                  </p>

                  {/* Completed / In Progress */}

                  {item.completed_at ? (
                    <p className="text-sm text-gray-500">
                      Completed: {formatDateTime(item.completed_at)}
                    </p>
                  ) : isCurrent && item.stage_name === "Completed" ? (
                    <p className="text-sm font-medium text-green-600">
                      Completed
                    </p>
                  ) : isCurrent ? (
                    <p className="text-sm font-medium text-blue-600">
                      In progress
                    </p>
                  ) : null}

                  {/* Changed By */}

                  {item.changed_by_name && (
                    <p className="mt-2 text-sm text-gray-600">
                      Changed by:{" "}
                      <span className="font-medium text-gray-800">
                        {item.changed_by_name}
                      </span>
                    </p>
                  )}

                  {/* Remarks */}

                  {item.remarks && (
                    <div className="mt-3 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      <span className="font-medium text-gray-700">
                        Remarks:
                      </span>{" "}
                      {item.remarks}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
