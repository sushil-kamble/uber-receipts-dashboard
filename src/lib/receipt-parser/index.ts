import { UberReceiptParser } from "./parser";
import { UberHtmlParser } from "./html-parser";
import { UberPdfParser } from "./pdf-parser";
import { RawEmailData } from "../email-client/types";
import { ParsedReceipt, ReceiptParsingResult } from "./types";

/**
 * Parse a single email to extract receipt data
 * @param email Raw email data
 * @returns Parsed receipt data
 */
export async function parseReceipt(
  email: RawEmailData
): Promise<ParsedReceipt> {
  const parser = new UberReceiptParser();
  return await parser.parseReceipt(email);
}

/**
 * Parse multiple emails to extract receipt data
 * @param emails Array of raw email data
 * @returns Array of parsing results
 */
export async function parseReceipts(
  emails: RawEmailData[]
): Promise<ReceiptParsingResult[]> {
  const parser = new UberReceiptParser();
  return await parser.parseReceipts(emails);
}

// Export classes for direct use
export { UberReceiptParser, UberHtmlParser, UberPdfParser };

// Export types
export * from "./types";
