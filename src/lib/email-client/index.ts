import { GmailClient } from "./gmail-client";
import { buildUberReceiptQuery } from "./email-query-builder";
import {
  EmailAuthConfig,
  EmailSearchParams,
  EmailSearchResult,
  RawEmailData,
} from "./types";

/**
 * Search for Uber receipts in a user's email account
 * @deprecated Use UberService from @/lib/services instead
 */
export async function searchUberReceipts(
  auth: EmailAuthConfig,
  startDate: Date,
  endDate: Date,
  maxResults: number = 50
): Promise<EmailSearchResult> {
  try {
    const gmailClient = new GmailClient(auth);

    // Build Uber-specific query
    const query = buildUberReceiptQuery();

    // Execute search with date range
    return await gmailClient.search({
      startDate,
      endDate,
      query,
      maxResults,
    });
  } catch (error) {
    console.error("Failed to search Uber receipts:", error);
    throw error;
  }
}

/**
 * Get a specific email by ID
 */
export async function getEmailById(
  auth: EmailAuthConfig,
  emailId: string
): Promise<RawEmailData> {
  try {
    const gmailClient = new GmailClient(auth);
    return await gmailClient.getEmail(emailId);
  } catch (error) {
    console.error("Failed to get email by ID:", error);
    throw error;
  }
}

// Export types
export type {
  EmailAuthConfig,
  EmailSearchParams,
  EmailSearchResult,
  RawEmailData,
};
