"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
} from "./constants";
import {
  uploadProcurementAttachment,
  type UploadAttachmentState,
} from "./actions";

type Props = {
  requestId: number;
};

const initialState: UploadAttachmentState = {};

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AttachmentUploadForm({ requestId }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const uploadAttachment = uploadProcurementAttachment.bind(
    null,
    String(requestId),
  );

  const [state, formAction, pending] = useActionState(
    uploadAttachment,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;

    setClientError(null);
    setFile(null);

    if (!selectedFile) {
      return;
    }

    if (selectedFile.size === 0) {
      setClientError("The selected file is empty.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_ATTACHMENT_SIZE) {
      setClientError("File is too large. The maximum file size is 5 MB.");
      event.target.value = "";
      return;
    }

    if (
      !ALLOWED_ATTACHMENT_TYPES.includes(
        selectedFile.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number],
      )
    ) {
      setClientError(
        "This file type is not allowed. Please select a PDF, Word, Excel, PowerPoint, JPG, JPEG, or PNG file.",
      );
      event.target.value = "";
      return;
    }

    const lowerFileName = selectedFile.name.toLowerCase();

    const hasAllowedExtension = ALLOWED_ATTACHMENT_EXTENSIONS.some(
      (extension) => lowerFileName.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      setClientError(
        "This file extension is not allowed. Please select a supported procurement document.",
      );
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  }

  const error = clientError ?? state.error;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm print:break-inside-avoid print:shadow-none">
      <form
        action={formAction}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">
            Procurement Attachments
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Upload supporting documents for this procurement request.
          </p>
        </div>

        <div className="p-6">
          <input type="hidden" name="requestId" value={requestId} />

          <label
            htmlFor="attachment"
            className="block text-sm font-medium text-gray-700"
          >
            Select File
          </label>

          <input
            id="attachment"
            name="file"
            type="file"
            onChange={handleFileChange}
            accept={ALLOWED_ATTACHMENT_EXTENSIONS.join(",")}
            disabled={pending}
            className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-xs leading-5 text-gray-500">
            PDF, Word, Excel, PowerPoint, JPG, JPEG, or PNG. Maximum file size:
            2 MB.
          </p>

          {file && !error && !state.success && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-800">{file.name}</p>

              <p className="mt-1 text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {state.success && (
            <div
              role="status"
              className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {state.success}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!file || pending}
              className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Validating..." : "Upload Attachment"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
