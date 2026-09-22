import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdvanceStageForm from "./advance-stage/AdvanceStageForm";
import StageHistory from "./StageHistory";
import RestorePRForm from "./restore/RestorePRForm";
import CancelPRForm from "./cancel/CancelPRForm";
import AttachmentModal from "./attachments/AttachmentModal";

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
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-heading sm:text-2xl">
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

          <p className="mt-1 text-sm text-gray-500">Procurement Request</p>

          <p className="mt-1 text-base font-semibold tracking-tight font-heading text-gray-900">
            {procurementRequest.particulars ||
              "No project name or particulars provided."}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <AttachmentModal
            requestId={request.id}
            attachments={formattedAttachments}
          />

          <Link
            href={`/purchased-requests/${procurementRequest.id}/edit`}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Edit PR
          </Link>
        </div>
      </div>
      {/* Main PR Content */}
      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.9fr)]">
        {/* Left Column */}
        <div className="min-w-0 space-y-6">
          {/* PR Information */}
          <div className="rounded-xl border bg-white shadow-sm print:break-inside-avoid">
            <div className="border-b px-4 py-3 sm:px-5">
              <h2 className="text-base font-semibold upper tracking-tight font-heading text-gray-900">
                PR Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-3 px-4 py-3 sm:grid-cols-2 sm:px-5 lg:grid-cols-3">
              {/* PR Number */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  PR Number
                </p>

                <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">
                  {procurementRequest.pr_number}
                </p>
              </div>

              {/* Reference ID */}
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Reference ID
                </p>

                <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">
                  {referenceId ?? "—"}
                </p>
              </div>

              {/* PR Date */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  PR Date
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {new Intl.DateTimeFormat("en-PH", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  }).format(new Date(procurementRequest.pr_date))}
                </p>
              </div>

              {/* Particulars */}
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Particulars
                </p>

                <p className="mt-0.5 text-sm font-medium leading-5 text-gray-900">
                  {procurementRequest.particulars || "—"}
                </p>
              </div>

              {/* ABC */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  ABC
                </p>

                <p className="mt-0.5 text-sm font-semibold text-gray-900">
                  {formatCurrency(procurementRequest.abc)}
                </p>
              </div>

              {/* Type of PR */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Type of PR
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {procurementRequest.type_of_pr || "—"}
                </p>
              </div>

              {/* End User */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  End User
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {procurementRequest.end_user || "—"}
                </p>
              </div>

              {/* Procurement Mode */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Procurement Mode
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {procurementMode?.name || "—"}
                </p>
              </div>

              {/* Account Code */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  Account Code
                </p>

                <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">
                  {procurementRequest.account_code || "—"}
                </p>
              </div>

              {/* SOL No. */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  SOL No.
                </p>

                <p className="mt-0.5 font-mono text-sm font-medium text-gray-900">
                  {procurementRequest.sol_no || "—"}
                </p>
              </div>

              {/* CD / Calendar Days */}
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  CD / Calendar Days
                </p>

                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {procurementRequest.calendar_days || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Stage History */}
          <StageHistory
            history={formattedHistory}
            currentStageId={procurementRequest.current_stage_id}
          />
        </div>

        {/* Right Column */}
        <div className="min-w-0 space-y-6">
          {/* Procurement Workflow */}
          <div className="rounded-xl border bg-white shadow-sm print:hidden">
            <div className="px-4 py-3 sm:px-5">
              <h2 className="text-base font-semibold tracking-tight font-heading text-gray-900">
                Procurement Workflow
              </h2>
            </div>

            <div className="border-b border-slate-200"></div>

            {request.status === "Active" && nextStage && (
              <div className="pb-0 px-4 py-4 flex items-center gap-3 justify-center">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  {currentStage?.name ?? "Not Started"}
                </span>
                <span className="text-slate-400">→</span>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {nextStage.name}
                </span>
              </div>
            )}

            <div className="px-4 py-4 sm:px-5">
              {request.status === "Cancelled" ||
              request.status === "Canceled" ? (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-red-700">
                    Procurement Cancelled
                  </p>

                  <RestorePRForm requestId={request.id} />
                </div>
              ) : nextStage ? (
                request.status === "Active" ? (
                  <div>
                    <AdvanceStageForm
                      requestId={request.id}
                      currentStageName={currentStage?.name ?? "Not Started"}
                      nextStageName={nextStage.name}
                    />

                    <div className="border-b border-slate-200 my-3"></div>

                    <div className="mt-3 shrink-0">
                      <CancelPRForm requestId={request.id} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    This procurement request is currently{" "}
                    {request.status?.toLowerCase()}.
                  </p>
                )
              ) : (
                <p className="text-sm font-medium text-green-700">
                  Procurement Complete
                </p>
              )}
            </div>
          </div>

          {/* Procurement Progress */}
          {!isCompleted && !isCancelled && (
            <div className="rounded-xl border bg-white shadow-sm print:break-inside-avoid">
              <div className="border-b px-5 py-3">
                <h2 className="text-base font-semibold tracking-tight font-heading text-gray-900">
                  Procurement Progress
                </h2>
              </div>

              <div className="px-5 py-4">
                {stages?.map((stage, index) => {
                  const isCurrent =
                    stage.id === procurementRequest.current_stage_id;

                  const isFinalCompleted =
                    stage.name === "Completed" && isCurrent;

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
                          className={`text-sm font-semibold ${
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
        </div>
      </div>
    </div>
  );
}
