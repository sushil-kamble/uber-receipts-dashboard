import { RawEmailData } from "../email-client/types";
import { UberHtmlParser } from "./html-parser";
import { UberPdfParser } from "./pdf-parser";
import {
  ParsedReceipt,
  ReceiptParserInterface,
  ReceiptParsingResult,
} from "./types";

/**
 * Main parser for Uber receipt emails
 * Handles both HTML content and PDF attachments
 */
export class UberReceiptParser implements ReceiptParserInterface {
  private htmlParser: UberHtmlParser;
  private pdfParser: UberPdfParser;

  constructor() {
    this.htmlParser = new UberHtmlParser();
    this.pdfParser = new UberPdfParser();
  }

  /**
   * Parse an email to extract receipt data
   * @param email Raw email data
   * @returns Parsed receipt data
   */
  async parseReceipt(email: RawEmailData): Promise<ParsedReceipt> {
    try {
      // Initial receipt data with default values
      const receipt: ParsedReceipt = {
        id: email.id,
        emailId: email.id,
        date: this.extractDateFromEmail(email),
        amount: 0,
        location: "Unknown",
        service: "Uber",
        type: "Uber Receipt",
        status: "Processed",
      };

      // Parse data from HTML body if available
      if (email.body?.html) {
        const htmlData = await this.htmlParser.parse(email.body.html);
        Object.assign(receipt, htmlData);
      }

      // Look for PDF attachments
      const pdfAttachment = email.attachments?.find((attachment) =>
        attachment.mimeType.includes("pdf")
      );

      if (pdfAttachment && pdfAttachment.data) {
        // Parse PDF data and merge with existing receipt data
        // PDF data will override HTML data if there are conflicts
        const pdfData = await this.pdfParser.parse(pdfAttachment.data);
        Object.assign(receipt, pdfData);
      }

      // If subject contains a date, use it as a fallback if we don't have a date yet
      if (!receipt.date && email.subject) {
        const dateMatch = email.subject.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
        if (dateMatch) {
          receipt.date = new Date(dateMatch[0]).toISOString().split("T")[0];
        }
      }

      // Extract trip status if not already set
      if (!receipt.status) {
        receipt.status = this.determineTripStatus(email);
      }

      return receipt;
    } catch (error) {
      console.error("Error parsing receipt:", error);

      // Return minimal receipt data in case of error
      return {
        id: email.id,
        emailId: email.id,
        date: this.extractDateFromEmail(email),
        amount: 0,
        location: "Unknown",
        service: "Uber",
        type: "Uber Receipt",
        status: "Error",
      };
    }
  }

  /**
   * Parse multiple emails to extract receipt data
   * @param emails Array of raw email data
   * @returns Array of parsing results
   */
  async parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]> {
    const results: ReceiptParsingResult[] = [];

    for (const email of emails) {
      try {
        const receipt = await this.parseReceipt(email);
        results.push({
          receipt,
          success: true,
        });
      } catch (error) {
        console.error(`Error parsing receipt for email ${email.id}:`, error);
        results.push({
          receipt: {
            id: email.id,
            emailId: email.id,
            date: this.extractDateFromEmail(email),
            amount: 0,
            location: "Unknown",
            service: "Uber",
            type: "Uber Receipt",
            status: "Error",
          },
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Extract date from email metadata
   */
  private extractDateFromEmail(email: RawEmailData): string {
    // Try to get date from email metadata
    if (email.date) {
      try {
        return new Date(email.date).toISOString().split("T")[0];
      } catch (e) {
        console.error("Error parsing email date:", e);
      }
    }

    // Fallback to current date if email date is not valid
    return new Date().toISOString().split("T")[0];
  }

  /**
   * Determine trip status from email content
   */
  private determineTripStatus(email: RawEmailData): string {
    // Default status
    let status = "Completed";

    // Check for cancelled trip indicators
    const cancelledIndicators = ["cancelled", "canceled", "refund", "refunded"];

    // Check subject, snippet, and body for cancelled trip indicators
    const emailText = [
      email.subject || "",
      email.snippet || "",
      email.body?.text || "",
      email.body?.html || "",
    ]
      .join(" ")
      .toLowerCase();

    for (const indicator of cancelledIndicators) {
      if (emailText.includes(indicator)) {
        status = "Cancelled";
        break;
      }
    }

    return status;
  }
}
