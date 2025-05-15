import { RawEmailData } from "../email-client/types";
import { Receipt } from "@/app/types";

/**
 * Interface for the receipt parser
 */
export interface ReceiptParserInterface {
  parseReceipt(email: RawEmailData): Promise<ParsedReceipt>;
}

/**
 * Extended receipt data parsed from an email
 */
export interface ParsedReceipt extends Receipt {
  // Basic receipt fields are inherited from Receipt type

  // Additional parsed details
  tripId?: string;
  driverName?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupTime?: string;
  dropoffTime?: string;
  duration?: string;
  distance?: string;
  paymentMethod?: string;
  currency?: string;
  type?: string;
  status?: string;
  // Track the raw email ID for reference
  emailId: string;

  // Original content for future re-parsing if needed
  rawHtml?: string;
  hasPdf?: boolean;
}

/**
 * Interface for HTML receipt parser
 */
export interface HtmlParserInterface {
  parse(html: string): Promise<Partial<ParsedReceipt>>;
}

/**
 * Interface for PDF receipt parser
 */
export interface PdfParserInterface {
  parse(pdfData: string): Promise<Partial<ParsedReceipt>>;
}

/**
 * Result of the receipt parsing process
 */
export interface ReceiptParsingResult {
  receipt: ParsedReceipt;
  success: boolean;
  error?: string;
}
