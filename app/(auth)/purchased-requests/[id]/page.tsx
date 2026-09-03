import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import AdvanceStageForm from "./advance-stage/AdvanceStageForm";
import StageHistory from "./StageHistory";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProcurementRequestPage({ params }: PageProps) {
  const { id } = await params;

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
      type_of_pr,
      end_user,
      particulars,
      abc,
      mode_of_procurement_id,
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
  // 6. Get Stage History
  // --------------------------------------------------

  const { data: history } = await supabase
    .from("procurement_stage_history")
    .select(
      `
    id,
    stage_id,
    started_at,
    completed_at,
    remarks,
    changed_by,
    procurement_stages (
      name,
      sequence_number
    )
  `,
    )
    .eq("request_id", id)
    .order("started_at", {
      ascending: true,
    });

  const changedByIds = Array.from(
    new Set((history ?? []).map((item) => item.changed_by).filter(Boolean)),
  );

  const { data: profiles } =
    changedByIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", changedByIds)
      : { data: [] };

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
  );

  const formattedHistory = (history ?? []).map((item) => {
    const stage = Array.isArray(item.procurement_stages)
      ? item.procurement_stages[0]
      : item.procurement_stages;

    return {
      id: item.id,
      stage_id: item.stage_id,
      stage_name: stage?.name ?? "Unknown Stage",
      sequence_number: stage?.sequence_number ?? 0,
      started_at: item.started_at,
      completed_at: item.completed_at,
      remarks: item.remarks,
      changed_by_name: item.changed_by
        ? (profileMap.get(item.changed_by) ?? "Unknown User")
        : null,
    };
  });

  // --------------------------------------------------
  // 7. Determine which stages have been reached
  // --------------------------------------------------

  const completedStageIds = new Set(
    history?.map((item) => item.stage_id) ?? [],
  );

  // --------------------------------------------------
  // 8. Display the page
  // --------------------------------------------------

  return (
    <div>
      {/* Back button */}
      <Link
        href="/purchased-requests"
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        ← Back to Purchased Requests
      </Link>

      {/* Page heading */}
      <div className="mt-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {procurementRequest.pr_number}
          </h1>

          <p className="mt-2 text-gray-600">Procurement Request</p>
        </div>

        <Link
          href={`/purchased-requests/${procurementRequest.id}/edit`}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Edit PR
        </Link>
      </div>

      {/* PR Information */}
      <div className="mt-8 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">PR Information</h2>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* PR Number */}
          <div>
            <p className="text-sm text-gray-500">PR Number</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.pr_number}
            </p>
          </div>

          {/* PR Date */}
          <div>
            <p className="text-sm text-gray-500">PR Date</p>

            <p className="mt-1 font-medium text-gray-900">
              {new Intl.DateTimeFormat("en-PH", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }).format(new Date(procurementRequest.pr_date))}
            </p>
          </div>

          {/* Type of PR */}
          <div>
            <p className="text-sm text-gray-500">Type of PR</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.type_of_pr || "—"}
            </p>
          </div>

          {/* End User */}
          <div>
            <p className="text-sm text-gray-500">End User</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.end_user || "—"}
            </p>
          </div>

          {/* Particulars */}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Particulars</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.particulars || "—"}
            </p>
          </div>

          {/* ABC */}
          <div>
            <p className="text-sm text-gray-500">ABC</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementRequest.abc !== null
                ? new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(procurementRequest.abc)
                : "—"}
            </p>
          </div>

          {/* Mode */}
          <div>
            <p className="text-sm text-gray-500">Mode of Procurement</p>

            <p className="mt-1 font-medium text-gray-900">
              {procurementMode?.name || "—"}
            </p>
          </div>

          {/* Current Stage */}
          <div>
            <p className="text-sm text-gray-500">Current Stage</p>

            <p className="mt-1 font-medium text-gray-900">
              {currentStage?.name || "—"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-500">Status</p>

            <p className="mt-1">
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                {procurementRequest.status}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Procurement Workflow</h2>
        </div>

        <div className="p-6">
          <div>
            <p className="text-sm text-gray-500">Current Stage</p>

            <p className="mt-1 text-lg font-semibold text-gray-900">
              {currentStage?.name ?? "Unknown"}
            </p>
          </div>

          {nextStage ? (
            <div className="mt-6 border-t pt-6">
              <p className="text-sm text-gray-500">Next Stage</p>

              <p className="mt-1 text-lg font-semibold text-blue-600">
                {nextStage.name}
              </p>

              <AdvanceStageForm
                requestId={request.id}
                currentStageName={currentStage?.name ?? ""}
                nextStageName={nextStage.name}
              />
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              This procurement request has reached the final stage.
            </div>
          )}
        </div>
      </div>

      <div></div>

      {/* Procurement Progress */}
      <div className="mt-6 rounded-xl border bg-white shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="font-semibold text-gray-900">Procurement Progress</h2>
        </div>

        <div className="p-6">
          {stages?.map((stage, index) => {
            const isCompleted = completedStageIds.has(stage.id);

            const isCurrent = stage.id === procurementRequest.current_stage_id;

            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="flex">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      isCompleted
                        ? "bg-green-600 text-white"
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
                    className={`font-medium ${
                      isCurrent
                        ? "text-blue-600"
                        : isCompleted
                          ? "text-gray-900"
                          : "text-gray-400"
                    }`}
                  >
                    {stage.name}
                  </p>

                  {isCurrent && (
                    <p className="mt-1 text-xs text-blue-600">Current Stage</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage History */}
      <StageHistory
        history={formattedHistory}
        currentStageId={procurementRequest.current_stage_id}
      />
    </div>
  );
}
