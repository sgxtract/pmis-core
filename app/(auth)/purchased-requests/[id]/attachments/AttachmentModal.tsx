"use client";

import { useEffect, useState } from "react";

import AttachmentList from "./AttachmentList";
import AttachmentUploadForm from "./AttachmentUploadForm";

type Attachment = {
  id: number;
  file_name: string;
  content_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by_name: string | null;
};

type Props = {
  requestId: number;
  attachments: Attachment[];
};

export default function AttachmentModal({ requestId, attachments }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Open Modal Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
      >
        <span className="text-xs">Attachments</span>

        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
          {attachments.length}
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="attachments-modal-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2
                  id="attachments-modal-title"
                  className="font-heading text-base font-semibold tracking-tight text-gray-900"
                >
                  Attachments
                </h2>

                <p className="mt-0.5 text-sm text-gray-500">
                  Documents associated with this procurement request.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close attachments"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xl leading-none text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 overflow-y-auto px-5 py-4">
              {/* Upload */}
              <div>
                <p className="mb-2 text-sm font-semibold text-gray-900">
                  Add Attachment
                </p>

                <AttachmentUploadForm requestId={requestId} />
              </div>

              {/* Existing Attachments */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">
                    Existing Attachments
                  </p>

                  <span className="text-xs text-gray-500">
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "file" : "files"}
                  </span>
                </div>

                <AttachmentList attachments={attachments} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
