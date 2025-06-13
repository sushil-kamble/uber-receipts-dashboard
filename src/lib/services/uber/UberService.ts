import { ReceiptService } from "../types";
import {
  EmailAuthConfig,
  EmailSearchResult,
  RawEmailData,
} from "../../email-client/types";
import { ReceiptParsingResult } from "../../receipt-parser/types";
import { GmailClient } from "../../email-client/gmail-client";
import { buildUberReceiptQuery } from "../../email-client/email-query-builder";
import { parseReceipts } from "../../receipt-parser";

/**
 * Uber receipt service implementation
 */
export class UberService implements ReceiptService {
  serviceName = "Uber";

  /**
   * Search for Uber receipt emails
   */
  async searchReceipts(
    auth: EmailAuthConfig,
    startDate: Date,
    endDate: Date,
    maxResults: number
  ): Promise<EmailSearchResult> {
    try {
      const gmailClient = new GmailClient(auth);
      const query = buildUberReceiptQuery();
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
   * Parse Uber receipt emails
   */
  async parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]> {
    try {
      const results = await parseReceipts(emails);

      // Add service information to each parsed receipt
      return results.map((result) => ({
        ...result,
        receipt: {
          ...result.receipt,
          service: this.serviceName,
          serviceId: result.receipt.tripId, // Use tripId as serviceId for Uber
        },
      }));
    } catch (error) {
      console.error("Failed to parse Uber receipts:", error);
      throw error;
    }
  }
}
