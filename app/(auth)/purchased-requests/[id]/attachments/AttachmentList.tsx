"use client";

import { useState } from "react";
import { deleteProcurementAttachment, getAttachmentUrl } from "./actions";

type Attachment = {
  id: number;
  file_name: string;
  content_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by_name: string | null;
};

type Props = {
  attachments: Attachment[];
};

function formatFileSize(bytes: number | null) {
  if (bytes === null) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatUploadedAt(value: string) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ViewAttachmentButton({ attachmentId }: { attachmentId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleView() {
    setPending(true);
    setError(null);

    const result = await getAttachmentUrl(attachmentId);

    setPending(false);

    if (result.error || !result.url) {
      setError(result.error ?? "Unable to open the attachment.");
      return;
    }

    window.open(result.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleView}
        disabled={pending}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Opening..." : "View"}
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function DeleteAttachmentButton({ attachmentId }: { attachmentId: number }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setPending(true);
    setError(null);

    const result = await deleteProcurementAttachment(attachmentId);

    setPending(false);

    if (result.error) {
      setError(result.error);
      setIsConfirmOpen(false);
      return;
    }

    setIsConfirmOpen(false);

    window.location.reload();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsConfirmOpen(true);
        }}
        disabled={pending}
        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Delete
      </button>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-attachment-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2
              id="delete-attachment-title"
              className="text-lg font-semibold text-gray-900"
            >
              Delete Attachment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              This attachment will be permanently removed from the procurement
              request. This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmOpen(false)}
                disabled={pending}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Deleting..." : "Delete Attachment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AttachmentList({ attachments }: Props) {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-gray-900">
        Uploaded Attachments
      </h3>

      {attachments.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            No attachments have been uploaded for this procurement request.
          </p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-4 px-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {attachment.file_name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Uploaded by{" "}
                  <span className="font-medium text-gray-700">
                    {attachment.uploaded_by_name ?? "Unknown user"}
                  </span>
                  {" · "}
                  {formatUploadedAt(attachment.uploaded_at)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="text-xs text-gray-500">
                  {formatFileSize(attachment.file_size)}
                </span>

                <ViewAttachmentButton attachmentId={attachment.id} />

                <DeleteAttachmentButton attachmentId={attachment.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
