import { RawEmailData } from "../email-client/types";

/**
 * Generate a PDF download URL from email attachments
 * @param email Raw email data
 * @param defaultFilename Default filename if none is found
 * @returns PDF download URL or Gmail inbox URL as fallback
 */
export function generatePdfDownloadUrl(
  email: RawEmailData,
  defaultFilename: string = "receipt.pdf"
): string {
  // Default Gmail URL as fallback
  const defaultUrl = `https://mail.google.com/mail/u/0/#inbox/${email.id}`;

  // Check for PDF attachments
  if (!email.attachments || email.attachments.length === 0) {
    return defaultUrl;
  }

  const pdfAttachment = email.attachments.find(
    (attachment) =>
      attachment.mimeType === "application/pdf" && attachment.attachmentId
  );

  if (!pdfAttachment || !pdfAttachment.attachmentId) {
    return defaultUrl;
  }

  // Create download URL using our API endpoint
  const params = new URLSearchParams({
    messageId: email.id,
    attachmentId: pdfAttachment.attachmentId,
    filename: pdfAttachment.filename || defaultFilename,
  });

  return `/api/attachments/download?${params.toString()}`;
}

/**
 * Check if email has PDF attachments
 * @param email Raw email data
 * @returns boolean indicating if PDF attachments exist
 */
export function hasPdfAttachment(email: RawEmailData): boolean {
  if (!email.attachments || email.attachments.length === 0) {
    return false;
  }

  return email.attachments.some(
    (attachment) =>
      attachment.mimeType === "application/pdf" && attachment.attachmentId
  );
}
