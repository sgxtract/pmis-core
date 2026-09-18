"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveUser } from "@/lib/auth/require-active-user";

import {
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_TYPES,
  MAX_ATTACHMENT_SIZE,
} from "./constants";

export type UploadAttachmentState = {
  error?: string;
  success?: string;
};

export async function uploadProcurementAttachment(
  requestId: string,
  _previousState: UploadAttachmentState,
  formData: FormData,
): Promise<UploadAttachmentState> {
  await requireActiveUser();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { error: "Please select a file to upload." };
  }

  if (file.size === 0) {
    return { error: "The selected file is empty." };
  }

  if (file.size > MAX_ATTACHMENT_SIZE) {
    return {
      error: "File is too large. The maximum file size is 2 MB.",
    };
  }

  if (
    !ALLOWED_ATTACHMENT_TYPES.includes(
      file.type as (typeof ALLOWED_ATTACHMENT_TYPES)[number],
    )
  ) {
    return {
      error:
        "This file type is not allowed. Please select a PDF, Word, Excel, PowerPoint, JPG, JPEG, or PNG file.",
    };
  }

  const fileName = file.name.trim();
  const lowerFileName = fileName.toLowerCase();

  const allowedExtension = ALLOWED_ATTACHMENT_EXTENSIONS.find((extension) =>
    lowerFileName.endsWith(extension),
  );

  if (!allowedExtension) {
    return {
      error:
        "This file extension is not allowed. Please select a supported procurement document.",
    };
  }

  const parsedRequestId = Number(requestId);

  if (!Number.isInteger(parsedRequestId) || parsedRequestId <= 0) {
    return {
      error: "Invalid procurement request.",
    };
  }

  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      error: "Your session has expired. Please log in again.",
    };
  }

  const userId = userData.user.id;

  const { data: request, error: requestError } = await supabase
    .from("procurement_requests")
    .select("id")
    .eq("id", parsedRequestId)
    .maybeSingle();

  if (requestError || !request) {
    return {
      error: "Procurement request not found.",
    };
  }

  const storagePath = `${request.id}/${crypto.randomUUID()}${allowedExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("procurement-attachments")
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("ATTACHMENT STORAGE UPLOAD ERROR:", uploadError);

    return {
      error: "Unable to upload the attachment. Please try again.",
    };
  }

  const { error: metadataError } = await supabase
    .from("procurement_attachments")
    .insert({
      request_id: request.id,
      file_name: fileName,
      storage_path: storagePath,
      content_type: file.type,
      file_size: file.size,
      uploaded_by: userId,
    });

  if (metadataError) {
    console.error("ATTACHMENT METADATA INSERT ERROR:", metadataError);

    const { error: rollbackError } = await supabase.storage
      .from("procurement-attachments")
      .remove([storagePath]);

    if (rollbackError) {
      console.error("ATTACHMENT STORAGE ROLLBACK ERROR:", rollbackError);
    }

    return {
      error: "The attachment could not be saved. Please try again.",
    };
  }

  console.log("ATTACHMENT UPLOAD SUCCESS:", {
    requestId: request.id,
    fileName,
    storagePath,
    contentType: file.type,
    fileSize: file.size,
    uploadedBy: userId,
  });

  return {
    success: "Attachment uploaded successfully.",
  };
}

export async function getAttachmentUrl(attachmentId: number): Promise<{
  url?: string;
  error?: string;
}> {
  await requireActiveUser();

  const supabase = await createClient();

  const { data: attachment, error: attachmentError } = await supabase
    .from("procurement_attachments")
    .select("storage_path")
    .eq("id", attachmentId)
    .maybeSingle();

  if (attachmentError || !attachment) {
    return {
      error: "Attachment not found.",
    };
  }

  const { data, error: signedUrlError } = await supabase.storage
    .from("procurement-attachments")
    .createSignedUrl(attachment.storage_path, 60);

  if (signedUrlError || !data?.signedUrl) {
    console.error("ATTACHMENT SIGNED URL ERROR:", signedUrlError);

    return {
      error: "Unable to open the attachment. Please try again.",
    };
  }

  return {
    url: data.signedUrl,
  };
}

export async function deleteProcurementAttachment(
  attachmentId: number,
): Promise<{
  success?: string;
  error?: string;
}> {
  await requireActiveUser();

  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      error: "Your session has expired. Please log in again.",
    };
  }

  const userId = userData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role_id")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    return {
      error: "Unable to verify your account permissions.",
    };
  }

  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("name")
    .eq("id", profile.role_id)
    .single();

  if (roleError || !role) {
    return {
      error: "Unable to verify your account role.",
    };
  }

  const { data: attachment, error: attachmentError } = await supabase
    .from("procurement_attachments")
    .select("id, storage_path, uploaded_by")
    .eq("id", attachmentId)
    .maybeSingle();

  if (attachmentError || !attachment) {
    return {
      error: "Attachment not found.",
    };
  }

  const isAdminOrModerator = role.name === "Admin" || role.name === "Moderator";

  const isUploader = attachment.uploaded_by === userId;

  if (!isAdminOrModerator && !isUploader) {
    return {
      error: "You are not authorized to delete this attachment.",
    };
  }

  const { error: storageError } = await supabase.storage
    .from("procurement-attachments")
    .remove([attachment.storage_path]);

  if (storageError) {
    console.error("ATTACHMENT STORAGE DELETE ERROR:", storageError);

    return {
      error: "Unable to delete the attachment. Please try again.",
    };
  }

  const { error: metadataError } = await supabase
    .from("procurement_attachments")
    .delete()
    .eq("id", attachment.id);

  if (metadataError) {
    console.error("ATTACHMENT METADATA DELETE ERROR:", metadataError);

    return {
      error:
        "The attachment file was removed, but its record could not be deleted. Please contact an administrator.",
    };
  }

  return {
    success: "Attachment deleted successfully.",
  };
}
