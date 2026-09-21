type StageHistoryItem = {
  id: number;
  stage_id: number;
  stage_name: string;
  sequence_number: number;
  started_at: string;
  completed_at: string | null;
  remarks: string | null;

  started_by_name: string | null;
  completed_by_name: string | null;
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-5 py-3">
          <h2 className="font-heading text-base font-semibold tracking-tight text-gray-900">
            Stage History
          </h2>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-gray-500">
            No stage history is available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      {/* Header */}

      <div className="border-b border-gray-200 px-5 py-3">
        <h2 className="font-heading text-base font-semibold tracking-tight text-gray-900">
          Stage History
        </h2>

        <p className="mt-0.5 text-sm text-gray-500">
          Record of procurement stage movements.
        </p>
      </div>

      {/* Timeline */}

      <div className="px-5 py-4">
        <div className="space-y-0">
          {history.map((item, index) => {
            const isCurrent = item.stage_id === currentStageId;
            const isCompleted = item.completed_at !== null;
            const isLast = index === history.length - 1;

            return (
              <div key={item.id} className="relative flex gap-3">
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
                    isCompleted
                      ? "bg-green-600 text-white"
                      : isCurrent
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isCompleted ? "✓" : isCurrent ? "●" : "•"}
                </div>

                {/* Content */}

                <div className="min-w-0 flex-1 pb-5">
                  {/* Stage Header */}

                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3
                      className={`min-w-0 wrap-break-word text-sm font-semibold ${
                        isCompleted
                          ? "text-gray-900"
                          : isCurrent
                            ? "text-blue-600"
                            : "text-gray-400"
                      }`}
                    >
                      {item.stage_name}
                    </h3>

                    {isCompleted && (
                      <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Completed
                      </span>
                    )}

                    {isCurrent && !isCompleted && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        Current Stage
                      </span>
                    )}
                  </div>

                  {/* Timeline Details */}

                  <div className="mt-1 space-y-0.5">
                    <p className="text-xs leading-5 text-gray-500">
                      Started: {formatDateTime(item.started_at)}
                    </p>

                    {item.completed_at ? (
                      <p className="text-xs leading-5 text-gray-500">
                        Completed: {formatDateTime(item.completed_at)}
                      </p>
                    ) : isCurrent ? (
                      <p className="text-xs font-medium leading-5 text-blue-600">
                        In progress
                      </p>
                    ) : null}
                  </div>

                  {/* Accountability */}

                  {item.started_by_name && (
                    <p className="mt-2 text-xs leading-5 text-gray-600">
                      Processed by{" "}
                      <span className="font-medium text-gray-800">
                        {item.started_by_name}
                      </span>
                    </p>
                  )}

                  {item.completed_by_name && (
                    <p className="text-xs leading-5 text-gray-600">
                      Moved by{" "}
                      <span className="font-medium text-gray-800">
                        {item.completed_by_name}
                      </span>
                    </p>
                  )}

                  {/* Remarks */}

                  {item.remarks && (
                    <div className="mt-2 max-w-3xl wrap-break-word rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">
                          Remarks:
                        </span>{" "}
                        {item.remarks}
                      </p>
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
