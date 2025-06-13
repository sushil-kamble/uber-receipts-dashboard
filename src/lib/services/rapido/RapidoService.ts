import { ReceiptService } from "../types";
import {
  EmailAuthConfig,
  EmailSearchResult,
  RawEmailData,
} from "../../email-client/types";
import { ReceiptParsingResult } from "../../receipt-parser/types";
import { GmailClient } from "../../email-client/gmail-client";
import { buildRapidoReceiptQuery } from "./email-query-builder";
import { RapidoParser } from "./parser";

/**
 * Rapido receipt service implementation
 */
export class RapidoService implements ReceiptService {
  serviceName = "Rapido";
  private parser: RapidoParser;

  constructor() {
    this.parser = new RapidoParser();
  }

  /**
   * Search for Rapido receipt emails
   */
  async searchReceipts(
    auth: EmailAuthConfig,
    startDate: Date,
    endDate: Date,
    maxResults: number
  ): Promise<EmailSearchResult> {
    try {
      const gmailClient = new GmailClient(auth);
      const query = buildRapidoReceiptQuery();

      return await gmailClient.search({
        startDate,
        endDate,
        query,
        maxResults,
      });
    } catch (error) {
      console.error("Failed to search Rapido receipts:", error);
      throw error;
    }
  }

  /**
   * Parse Rapido receipt emails
   */
  async parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]> {
    try {
      return await this.parser.parseReceipts(emails);
    } catch (error) {
      console.error("Failed to parse Rapido receipts:", error);
      throw error;
    }
  }
}
