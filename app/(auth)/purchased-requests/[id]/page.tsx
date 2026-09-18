import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdvanceStageForm from "./advance-stage/AdvanceStageForm";
import StageHistory from "./StageHistory";
import RestorePRForm from "./restore/RestorePRForm";
import CancelPRForm from "./cancel/CancelPRForm";
import AttachmentUploadForm from "./attachments/AttachmentUploadForm";
import AttachmentList from "./attachments/AttachmentList";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    updated?: string;
  }>;
};

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

function getStageClass(stage: string | null) {
  if (!stage) {
    return "bg-gray-100 text-gray-700";
  }

  return "bg-blue-100 text-blue-700";
}

function formatCurrency(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value);
}

export default async function ProcurementRequestPage({
  params,
  searchParams,
}: PageProps) {
  // throw new Error("TEST PROCUREMENT REQUEST ERROR");
  const { id } = await params;
  const { updated } = await searchParams;

  const showUpdatedMessage = updated === "1";

  const supabase = await createClient();

  // --------------------------------------------------
  // 1. Get the Procurement Request
  // --------------------------------------------------

  const { data: request, error: requestError } = await supabase
    .from("procurement_requests")
    .select(
      `
      id,
      pr_number,
      pr_date,
      reference_id_id,
      type_of_pr,
      end_user,
      particulars,
      abc,
      mode_of_procurement_id,
      account_code,
      calendar_days,
      sol_no,
      current_stage_id,
      status
    `,
    )
    .eq("id", id)
    .single();

  // --------------------------------------------------
  // 2. Make sure the PR exists
  // --------------------------------------------------

  if (requestError || !request) {
    notFound();
  }

  // At this point TypeScript knows that request exists.
  const procurementRequest = request;

  let referenceId: string | null = null;

  if (procurementRequest.reference_id_id) {
    const { data: reference } = await supabase
      .from("reference_ids")
      .select("reference_id")
      .eq("id", procurementRequest.reference_id_id)
      .maybeSingle();

    referenceId = reference?.reference_id ?? null;
  }

  const isCancelled =
    procurementRequest.status === "Cancelled" ||
    procurementRequest.status === "Canceled";

  const isCompleted = procurementRequest.status === "Completed";

  // --------------------------------------------------
  // 3. Get Mode of Procurement
  // --------------------------------------------------

  const { data: procurementMode } = await supabase
    .from("modes_of_procurement")
    .select("name")
    .eq("id", procurementRequest.mode_of_procurement_id)
    .single();

  // --------------------------------------------------
  // 4. Get Current Stage
  // --------------------------------------------------

  const { data: currentStage } = await supabase
    .from("procurement_stages")
    .select("id, name, sequence_number")
    .eq("id", procurementRequest.current_stage_id)
    .single();

  const { data: nextStage } = await supabase
    .from("procurement_stages")
    .select("id, name, sequence_number")
    .gt("sequence_number", currentStage?.sequence_number ?? 0)
    .order("sequence_number", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  // --------------------------------------------------
  // 5. Get All Procurement Stages
  // --------------------------------------------------

  const { data: stages } = await supabase
    .from("procurement_stages")
    .select("id, name, sequence_number")
    .order("sequence_number", {
      ascending: true,
    });

  // --------------------------------------------------
  // Stage History RPC Result Type
  // --------------------------------------------------

  type StageHistoryRow = {
    id: number;
    request_id: number;
    stage_id: number;
    stage_name: string | null;
    sequence_number: number | null;

    changed_by: string | null;
    changed_by_name: string | null;

    started_by: string | null;
    started_by_name: string | null;

    completed_by: string | null;
    completed_by_name: string | null;

    started_at: string;
    completed_at: string | null;
    remarks: string | null;
  };

  // --------------------------------------------------
  // 6. Get Stage History
  // --------------------------------------------------

  const { data: history, error: historyError } = await supabase.rpc(
    "get_procurement_stage_history",
    {
      p_request_id: Number(id),
    },
  );

  if (historyError) {
    console.error("Stage history error:", historyError);
  }

  const historyRows = (history ?? []) as StageHistoryRow[];

  const formattedHistory = historyRows.map((item) => ({
    id: item.id,
    stage_id: item.stage_id,
    stage_name: item.stage_name ?? "Unknown Stage",
    sequence_number: item.sequence_number ?? 0,
    started_at: item.started_at,
    completed_at: item.completed_at,
    remarks: item.remarks,
    started_by_name: item.started_by_name ?? null,
    completed_by_name: item.completed_by_name ?? null,
  }));

  // --------------------------------------------------
  // 7. Get Procurement Attachments
  // --------------------------------------------------

  const { data: attachments, error: attachmentsError } = await supabase
    .from("procurement_attachments")
    .select("id, file_name, content_type, file_size, uploaded_at, uploaded_by")
    .eq("request_id", procurementRequest.id)
    .order("uploaded_at", { ascending: false });

  if (attachmentsError) {
    throw new Error("Unable to load procurement attachments.");
  }

  const uploadedByIds = [
    ...new Set(
      (attachments ?? [])
        .map((attachment) => attachment.uploaded_by)
        .filter(Boolean),
    ),
  ];

  const { data: attachmentProfiles, error: attachmentProfilesError } =
    uploadedByIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", uploadedByIds)
      : { data: [], error: null };

  if (attachmentProfilesError) {
    throw new Error("Unable to load attachment uploader information.");
  }

  const attachmentProfileMap = new Map(
    (attachmentProfiles ?? []).map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );

  const formattedAttachments = (attachments ?? []).map((attachment) => ({
    id: attachment.id,
    file_name: attachment.file_name,
    content_type: attachment.content_type,
    file_size: attachment.file_size,
    uploaded_at: attachment.uploaded_at,
    uploaded_by_name: attachmentProfileMap.get(attachment.uploaded_by) ?? null,
  }));

  // --------------------------------------------------
  // 7B. Determine which stages have been reached
  // --------------------------------------------------

  const completedStageIds = new Set(historyRows.map((item) => item.stage_id));

  // --------------------------------------------------
  // 8. Display the page
  // --------------------------------------------------

  return (
    <div>
      {/* Back button */}
      <Link
        href="/purchased-requests"
        className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        ← Back to Purchased Requests
      </Link>

      {/* Success Message */}
      {showUpdatedMessage && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">✓</span>
            <span>Procurement request updated successfully.</span>
          </div>
        </div>
      )}

      {/* Page heading */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {procurementRequest.pr_number}
            </h1>

            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                procurementRequest.status,
              )}`}
            >
              {procurementRequest.status || "Unknown"}
            </span>

            {!isCompleted && (
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${getStageClass(
                  currentStage?.name,
                )}`}
              >
                {currentStage?.name || "Unknown Stage"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm font-medium text-gray-500">
            Procurement Request
          </p>

          <p className="mt-3 max-w-4xl text-base font-semibold leading-6 text-gray-900 sm:text-lg">
            {procurementRequest.particulars ||
              "No project name or particulars provided."}
          </p>
        </div>

        <Link
          href={`/purchased-requests/${procurementRequest.id}/edit`}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
        >
          Edit PR
        </Link>
      </div>

      {/* PR Information */}
      <div className="mt-8 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            PR Information
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3 px-6 py-6">
          {/* PR Number */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              PR Number
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.pr_number}
            </p>
          </div>

          {/* Reference ID */}
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Reference ID
            </p>

            <p className="mt-1 wrap-break-word text-base font-semibold text-gray-900">
              {referenceId ?? "—"}
            </p>
          </div>

          {/* PR Date */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              PR Date
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {new Intl.DateTimeFormat("en-PH", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }).format(new Date(procurementRequest.pr_date))}
            </p>
          </div>

          {/* Particulars */}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs leading-6 font-medium uppercase tracking-wide text-gray-500">
              Particulars
            </p>

            <p className="mt-1 text-base font-semibold leading-6 text-gray-900">
              {procurementRequest.particulars || "—"}
            </p>
          </div>

          {/* ABC */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              ABC
            </p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatCurrency(procurementRequest.abc)}
            </p>
          </div>

          {/* Type of PR */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Type of PR
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.type_of_pr || "—"}
            </p>
          </div>

          {/* End User */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              End User
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.end_user || "—"}
            </p>
          </div>

          {/* Mode */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Procurement Mode
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementMode?.name || "—"}
            </p>
          </div>

          {/* Account Code */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Account Code
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.account_code || "—"}
            </p>
          </div>

          {/* SOL No. */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Sol No.
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.sol_no || "—"}
            </p>
          </div>

          {/* CD / Calendar Days */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              CD / Calendar Days
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.calendar_days || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Procurement Workflow */}
      <div className="mt-8 rounded-xl border bg-white shadow-sm print:hidden">
        <div className="border-b px-4 py-4 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Procurement Workflow
          </h2>
        </div>

        <div className="p-4 sm:p-6">
          {/* Current and Next Stage */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Current Stage
              </p>

              <div className="mt-2">
                <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1.5 text-base font-semibold text-blue-800">
                  {currentStage?.name ?? "Not Started"}
                </span>
              </div>
            </div>

            {nextStage && request.status === "Active" && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Next Stage
                </p>

                <p className="mt-2 text-base font-semibold text-gray-900">
                  {nextStage.name}
                </p>
              </div>
            )}
          </div>

          {request.status === "Cancelled" || request.status === "Canceled" ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                Procurement Cancelled
              </p>

              <p className="mt-1 text-xl font-bold text-red-800">
                This procurement request is cancelled.
              </p>

              <p className="mt-2 text-sm leading-6 text-red-700">
                The request cannot be advanced while it is cancelled. You may
                restore it to continue processing.
              </p>

              <div className="mt-4">
                <RestorePRForm requestId={request.id} />
              </div>
            </div>
          ) : nextStage ? (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Advance Procurement
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                Advance to Next Stage
              </p>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                The request will advance from{" "}
                <span className="font-medium text-gray-800">
                  {currentStage?.name ?? "the current stage"}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-800">
                  {nextStage.name}
                </span>
                .
              </p>

              {request.status === "Active" ? (
                <>
                  <div className="mt-5">
                    <AdvanceStageForm
                      requestId={request.id}
                      currentStageName={currentStage?.name ?? "Unknown"}
                      nextStageName={nextStage.name}
                    />
                  </div>

                  <div className="mt-5 border-t border-gray-200 pt-6">
                    <p className="text-sm font-semibold text-gray-900">
                      Cancel Procurement Request
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Cancelling this request will prevent it from being
                      advanced until it is restored.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <CancelPRForm requestId={request.id} />
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm font-medium text-gray-600">
                  This procurement request is currently {request.status}.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-green-600">
                Procurement Complete
              </p>

              <p className="mt-1 text-xl font-bold text-green-800">
                Final Stage Reached
              </p>

              <p className="mt-2 text-sm leading-6 text-green-700">
                This procurement request has reached the final procurement
                stage.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Procurement Progress */}
      {!isCompleted && !isCancelled && (
        <div className="mt-6 rounded-xl border bg-white shadow-sm print:break-inside-avoid">
          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">
              Procurement Progress
            </h2>
          </div>

          <div className="p-6">
            {stages?.map((stage, index) => {
              const isCurrent =
                stage.id === procurementRequest.current_stage_id;

              const isFinalCompleted = stage.name === "Completed" && isCurrent;

              const isCompleted =
                isFinalCompleted ||
                (!isCurrent && completedStageIds.has(stage.id));

              const isLast = index === stages.length - 1;

              return (
                <div key={stage.id} className="flex">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : isCurrent
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? "✓" : stage.sequence_number}
                    </div>

                    {!isLast && (
                      <div
                        className={`h-12 w-0.5 ${
                          isCompleted ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>

                  {/* Stage information */}
                  <div className="ml-4 pb-8">
                    <p
                      className={`font-semibold ${
                        isCompleted
                          ? "text-green-600"
                          : isCurrent
                            ? "text-blue-600"
                            : "text-gray-400"
                      }`}
                    >
                      {stage.name}
                    </p>

                    {isCompleted ? (
                      <p className="mt-1 text-xs font-medium text-green-600">
                        Completed
                      </p>
                    ) : isCurrent ? (
                      <p className="mt-1 text-xs font-medium text-blue-600">
                        Current Stage
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage History */}
      <StageHistory
        history={formattedHistory}
        currentStageId={procurementRequest.current_stage_id}
      />

      {/* Attachments */}
      <div className="mt-8">
        <AttachmentUploadForm requestId={request.id} />

        <AttachmentList attachments={formattedAttachments} />
      </div>
    </div>
  );
}
