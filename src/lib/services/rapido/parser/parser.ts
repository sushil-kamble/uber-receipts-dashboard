import { RawEmailData } from "../../../email-client/types";
import { ReceiptParsingResult } from "../../../receipt-parser/types";
import { RapidoReceiptData } from "../types";
import { RapidoHtmlParser } from "./html-parser";
import { generatePdfDownloadUrl } from "../../../utils/pdf-download";

/**
 * Main Rapido receipt parser
 */
export class RapidoParser {
  private htmlParser: RapidoHtmlParser;

  constructor() {
    this.htmlParser = new RapidoHtmlParser();
  }

  /**
   * Parse a single Rapido receipt email
   */
  async parseReceipt(email: RawEmailData): Promise<ReceiptParsingResult> {
    try {
      // Check if email has HTML content
      if (!email.body?.html) {
        return {
          receipt: this.createEmptyReceipt(email.id),
          success: false,
          error: "No HTML content found in email",
        };
      }

      // Parse HTML content
      const parsedData = await this.htmlParser.parse(email.body.html, email.id);

      // Validate required fields
      if (!parsedData.amount) {
        return {
          receipt: this.createEmptyReceipt(email.id),
          success: false,
          error: "Missing required field: amount",
        };
      }

      // Generate PDF download URL
      const pdfUrl = generatePdfDownloadUrl(email, "rapido-receipt.pdf");

      // Create complete receipt
      const receipt: RapidoReceiptData = {
        id: parsedData.id || parsedData.rideId || email.id,
        date: parsedData.date || new Date().toISOString(),
        amount: parsedData.amount || 0,
        currency: parsedData.currency || "INR",
        location: parsedData.location || "Rapido Trip",
        pickupLocation: parsedData.pickupLocation,
        dropoffLocation: parsedData.dropoffLocation,
        pickupTime: parsedData.pickupTime,
        service: "Rapido",
        serviceId: parsedData.serviceId || parsedData.rideId,
        driverName: parsedData.driverName,
        vehicleInfo: parsedData.vehicleInfo,
        emailId: email.id,
        rawHtml: parsedData.rawHtml,
        rideId: parsedData.rideId || "",
        pdfUrl: pdfUrl,
        customerName: parsedData.customerName,
        vehicleNumber: parsedData.vehicleNumber,
        vehicleType: parsedData.vehicleType,
        timeOfRide: parsedData.timeOfRide,
      };

      return {
        receipt,
        success: true,
      };
    } catch (error) {
      console.error("Error parsing Rapido receipt:", error);
      return {
        receipt: this.createEmptyReceipt(email.id),
        success: false,
        error: error instanceof Error ? error.message : "Unknown parsing error",
      };
    }
  }

  /**
   * Parse multiple Rapido receipt emails
   */
  async parseReceipts(emails: RawEmailData[]): Promise<ReceiptParsingResult[]> {
    const results: ReceiptParsingResult[] = [];

    for (const email of emails) {
      try {
        const result = await this.parseReceipt(email);
        results.push(result);
      } catch (error) {
        console.error(`Failed to parse email ${email.id}:`, error);
        results.push({
          receipt: this.createEmptyReceipt(email.id),
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  }

  /**
   * Create an empty receipt for failed parsing
   */
  private createEmptyReceipt(emailId: string): RapidoReceiptData {
    return {
      id: emailId,
      date: new Date().toISOString(),
      amount: 0,
      currency: "INR",
      location: "Rapido Trip",
      service: "Rapido",
      emailId,
      rideId: "",
      pdfUrl: "https://mail.google.com/mail/u/0/#inbox/" + emailId,
    };
  }
}
