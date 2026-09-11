import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PublicProcurement = {
  id: number;
  pr_number: string;
  pr_date: string;
  particulars: string | null;
  abc: number | string | null;
  mode_of_procurement: string | null;
  calendar_days: number | null;
  current_stage: string | null;
  status: string | null;
};

type PublicStage = {
  stage_id: number;
  stage_name: string;
  sequence_number: number;
  started_at: string | null;
  completed_at: string | null;
  stage_status: "Completed" | "Current" | "Upcoming";
};

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCurrency(value: number | string | null) {
  if (value === null) {
    return "—";
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return "—";
  }

  return `₱${numericValue.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getStatusClass(status: string | null) {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-blue-100 text-blue-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700";

    case "pending":
      return "bg-yellow-100 text-yellow-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default async function PublicProcurementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const requestId = Number(id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const [
    { data: procurementData, error: procurementError },
    { data: progressData, error: progressError },
  ] = await Promise.all([
    supabase.rpc("get_public_procurement", {
      p_request_id: requestId,
    }),

    supabase.rpc("get_public_procurement_progress", {
      p_request_id: requestId,
    }),
  ]);

  if (procurementError) {
    console.error("Public procurement detail error:", procurementError);
  }

  if (progressError) {
    console.error("Public procurement progress error:", progressError);
  }

  const procurement =
    (procurementData?.[0] as PublicProcurement | undefined) ?? null;

  if (!procurement) {
    notFound();
  }

  const progress = (progressData ?? []) as PublicStage[];

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <Image
            src="/sorsogon-logo.png"
            alt="Sorsogon Province Logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Sorsogon Province Public Procurement
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Public Procurement Information
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Back */}
        <div className="mb-6">
          <Link
            href="/procurements"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Public Procurements
          </Link>
        </div>

        {/* Procurement Information */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Procurement Request
                </p>

                <h2 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  {procurement.pr_number}
                </h2>
              </div>

              {procurement.status && (
                <span
                  className={`inline-flex w-fit items-center rounded-md px-3 py-1.5 text-sm font-semibold ${getStatusClass(
                    procurement.status,
                  )}`}
                >
                  {procurement.status}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-2">
            {/* PR Number */}
            <div>
              <p className="text-sm font-medium text-gray-500">PR Number</p>

              <p className="mt-1 text-base font-semibold text-gray-900">
                {procurement.pr_number}
              </p>
            </div>

            {/* PR Date */}
            <div>
              <p className="text-sm font-medium text-gray-500">PR Date</p>

              <p className="mt-1 text-base text-gray-900">
                {formatDate(procurement.pr_date)}
              </p>
            </div>

            {/* Particulars */}
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">
                Particulars / Project Name
              </p>

              <p className="mt-1 whitespace-pre-wrap text-base leading-7 text-gray-900">
                {procurement.particulars ?? "—"}
              </p>
            </div>

            {/* ABC */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Approved Budget for the Contract (ABC)
              </p>

              <p className="mt-1 text-base font-semibold text-gray-900">
                {formatCurrency(procurement.abc)}
              </p>
            </div>

            {/* Mode */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                Mode of Procurement
              </p>

              <p className="mt-1 text-base text-gray-900">
                {procurement.mode_of_procurement ?? "—"}
              </p>
            </div>

            {/* Calendar Days */}
            <div>
              <p className="text-sm font-medium text-gray-500">
                CD / Calendar Days
              </p>

              <p className="mt-1 text-base font-semibold text-gray-900">
                {procurement.calendar_days ?? "—"}
              </p>
            </div>

            {/* Current Stage */}
            {procurement.status?.toLowerCase() !== "completed" && (
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Current Stage
                </p>

                <p className="mt-1 text-base font-semibold text-blue-700">
                  {procurement.current_stage ?? "—"}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Procurement Progress */}
        <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Procurement Progress
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current progress of this procurement request.
            </p>
          </div>

          <div className="p-6">
            {progress.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Procurement progress is not yet available.
              </div>
            ) : (
              <div className="relative">
                {progress.map((stage, index) => {
                  const isLast = index === progress.length - 1;

                  const isOverallCompleted =
                    procurement.status?.toLowerCase() === "completed";

                  const displayStageStatus =
                    isOverallCompleted &&
                    stage.stage_name.toLowerCase() === "completed"
                      ? "Completed"
                      : stage.stage_status;

                  return (
                    <div key={stage.stage_id} className="relative flex gap-4">
                      {/* Connector */}
                      {!isLast && (
                        <div className="absolute left-3.75 top-8 h-[calc(100%-8px)] w-px bg-gray-200" />
                      )}

                      {/* Status Icon */}
                      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white">
                        {displayStageStatus === "Completed" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                            ✓
                          </div>
                        )}

                        {displayStageStatus === "Current" && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                            ●
                          </div>
                        )}

                        {displayStageStatus === "Upcoming" && (
                          <div className="h-3 w-3 rounded-full bg-gray-300" />
                        )}
                      </div>

                      {/* Stage Content */}
                      <div className="min-w-0 flex-1 pb-9">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3
                              className={`text-sm font-semibold ${
                                displayStageStatus === "Current"
                                  ? "text-blue-700"
                                  : displayStageStatus === "Completed"
                                    ? "text-gray-900"
                                    : "text-gray-500"
                              }`}
                            >
                              {stage.stage_name}
                            </h3>

                            {displayStageStatus === "Completed" &&
                              (stage.completed_at ||
                                (isOverallCompleted &&
                                  stage.stage_name.toLowerCase() ===
                                    "completed")) && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Completed{" "}
                                  {formatDateTime(
                                    stage.completed_at ??
                                      (isOverallCompleted &&
                                      stage.stage_name.toLowerCase() ===
                                        "completed"
                                        ? stage.started_at
                                        : null),
                                  )}
                                </p>
                              )}

                            {displayStageStatus === "Current" &&
                              stage.started_at && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Started {formatDateTime(stage.started_at)}
                                </p>
                              )}
                          </div>

                          {displayStageStatus === "Completed" && (
                            <span className="w-fit rounded-md bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                              Completed
                            </span>
                          )}

                          {displayStageStatus === "Current" && (
                            <span className="w-fit rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              Current
                            </span>
                          )}

                          {displayStageStatus === "Upcoming" && (
                            <span className="w-fit rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          Public procurement information provided by the Sorsogon Province
          Public Procurement.
        </div>
      </div>
    </main>
  );
}
