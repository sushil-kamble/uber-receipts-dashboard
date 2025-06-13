import { RapidoReceiptData, RapidoParsingPatterns } from "../types";
import { ParsedReceipt } from "../../../receipt-parser/types";

/**
 * Rapido HTML parser for extracting receipt data
 */
export class RapidoHtmlParser {
  private patterns: RapidoParsingPatterns = {
    customerName: [
      /Customer Name[\s\S]*?<div[^>]*class="[^"]*ride-label[^"]*align-right[^"]*"[^>]*>\s*([^<\r\n]+)/i,
      /Customer Name[\s\S]*?align-right[^>]*>\s*([^<\r\n]+)/i,
    ],
    rideId: [
      /Ride ID[\s\S]*?<div[^>]*class="[^"]*ride-value[^"]*align-right[^"]*"[^>]*>\s*([A-Z0-9]+)/i,
      /Ride ID[\s\S]*?align-right[^>]*>\s*([A-Z0-9]+)/i,
    ],
    driverName: [
      /Driver name[\s\S]*?<div[^>]*class="[^"]*ride-value[^"]*align-right[^"]*"[^>]*>\s*([^<\r\n]+)/i,
      /Driver name[\s\S]*?align-right[^>]*>\s*([^<\r\n]+)/i,
    ],
    vehicleNumber: [
      /Vehicle Number[\s\S]*?<div[^>]*class="[^"]*ride-value[^"]*align-right[^"]*"[^>]*>\s*([A-Z0-9]+)/i,
      /Vehicle Number[\s\S]*?align-right[^>]*>\s*([A-Z0-9]+)/i,
    ],
    vehicleType: [
      /Mode of Vehicle[\s\S]*?<div[^>]*class="[^"]*ride-value[^"]*align-right[^"]*"[^>]*>\s*([^<\r\n]+)/i,
      /Mode of Vehicle[\s\S]*?align-right[^>]*>\s*([^<\r\n]+)/i,
    ],
    timeOfRide: [
      /Time of Ride[\s\S]*?<div[^>]*class="[^"]*ride-value[^"]*align-right[^"]*"[^>]*>\s*([^<\r\n]+)/i,
      /Time of Ride[\s\S]*?align-right[^>]*>\s*([^<\r\n]+)/i,
    ],
    amount: [
      /Selected Price[\s\S]*?₹\s*([0-9,]+)/i,
      /ride-cost[^>]*>[\s\S]*?₹\s*([0-9,]+)/i,
      /₹\s*([0-9,]+)/i,
    ],
    pickupLocation: [
      /pickup\.png[\s\S]*?<div[^>]*class="[^"]*content[^"]*location[^"]*"[^>]*>\s*([^<]+)/i,
      /pickup-point[\s\S]*?class="[^"]*content[^"]*location[^"]*"[^>]*>\s*([^<]+)/i,
    ],
    dropoffLocation: [
      /drop\.png[\s\S]*?<div[^>]*class="[^"]*content[^"]*location[^"]*"[^>]*>\s*([^<]+)/i,
      /drop-point[\s\S]*?class="[^"]*content[^"]*location[^"]*"[^>]*>\s*([^<]+)/i,
    ],
  };

  /**
   * Parse Rapido receipt HTML
   */
  async parse(
    html: string,
    emailId: string
  ): Promise<Partial<RapidoReceiptData>> {
    try {
      const receipt: Partial<RapidoReceiptData> = {
        emailId,
        rawHtml: html,
        service: "Rapido",
        currency: "INR", // Rapido operates in India
      };

      // Extract customer name
      receipt.customerName = this.extractField(
        html,
        this.patterns.customerName
      );

      // Extract ride ID (required field)
      const rideId = this.extractField(html, this.patterns.rideId);
      if (rideId) {
        receipt.rideId = rideId;
        receipt.id = rideId; // Use ride ID as the main ID
        receipt.serviceId = rideId;
      }

      // Extract driver name
      receipt.driverName = this.extractField(html, this.patterns.driverName);

      // Extract vehicle information
      const vehicleNumber = this.extractField(
        html,
        this.patterns.vehicleNumber
      );
      const vehicleType = this.extractField(html, this.patterns.vehicleType);

      if (vehicleNumber && vehicleType) {
        receipt.vehicleInfo = `${vehicleType} - ${vehicleNumber}`;
      } else if (vehicleNumber) {
        receipt.vehicleInfo = vehicleNumber;
      } else if (vehicleType) {
        receipt.vehicleInfo = vehicleType;
      }

      // Extract time of ride
      const timeOfRide = this.extractField(html, this.patterns.timeOfRide);
      if (timeOfRide) {
        receipt.timeOfRide = timeOfRide;
        receipt.date = this.parseRapidoDate(timeOfRide);
        receipt.pickupTime = this.extractPickupTime(timeOfRide);
      }

      // Extract amount
      const amountStr = this.extractField(html, this.patterns.amount);
      if (amountStr) {
        receipt.amount = this.parseAmount(amountStr);
      }

      // Extract locations
      const pickupLocation = this.extractField(
        html,
        this.patterns.pickupLocation
      );
      const dropoffLocation = this.extractField(
        html,
        this.patterns.dropoffLocation
      );

      if (pickupLocation) {
        receipt.pickupLocation = pickupLocation.trim();
      }

      if (dropoffLocation) {
        receipt.dropoffLocation = dropoffLocation.trim();
      }

      // Set main location (use pickup or a combination)
      if (pickupLocation && dropoffLocation) {
        receipt.location = `${this.shortenLocation(
          pickupLocation
        )} → ${this.shortenLocation(dropoffLocation)}`;
      } else if (pickupLocation) {
        receipt.location = this.shortenLocation(pickupLocation);
      } else if (dropoffLocation) {
        receipt.location = this.shortenLocation(dropoffLocation);
      } else {
        receipt.location = "Rapido Trip";
      }

      return receipt;
    } catch (error) {
      console.error("Error parsing Rapido HTML:", error);
      throw error;
    }
  }

  /**
   * Extract field using multiple regex patterns
   */
  private extractField(html: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        // Clean up the extracted text by removing extra whitespace, newlines, and carriage returns
        return match[1].replace(/[\s\r\n]+/g, " ").trim();
      }
    }
    return undefined;
  }

  /**
   * Parse Rapido date format (e.g., "Jun 14th 2025, 11:50 PM")
   */
  private parseRapidoDate(dateStr: string): string {
    try {
      // Parse the Rapido date format
      const cleanDateStr = dateStr.replace(/(\d+)(st|nd|rd|th)/, "$1");
      const date = new Date(cleanDateStr);

      if (isNaN(date.getTime())) {
        // Fallback to current date if parsing fails
        return new Date().toISOString();
      }

      return date.toISOString();
    } catch (error) {
      console.warn("Failed to parse Rapido date:", dateStr, error);
      return new Date().toISOString();
    }
  }

  /**
   * Parse amount from string (e.g., "427" from "₹ 427")
   */
  private parseAmount(amountStr: string): number {
    try {
      const cleanAmount = amountStr.replace(/[₹,\s]/g, "");
      return parseFloat(cleanAmount) || 0;
    } catch (error) {
      console.warn("Failed to parse amount:", amountStr, error);
      return 0;
    }
  }

  /**
   * Shorten location for display
   */
  private shortenLocation(location: string): string {
    // Take first part before comma for brevity
    const parts = location.split(",");
    return parts[0].trim();
  }

  /**
   * Extract pickup time from timeOfRide (e.g., "Jun 14th 2025, 11:50 PM" -> "11:50 PM")
   */
  private extractPickupTime(timeOfRide: string): string {
    try {
      // Extract time portion using regex - matches time format like "11:50 PM" or "11:50 AM"
      const timeMatch = timeOfRide.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/i);

      if (timeMatch && timeMatch[1]) {
        return timeMatch[1].trim();
      }

      // Fallback: try to extract time from the end of the string after comma
      const parts = timeOfRide.split(",");
      if (parts.length > 1) {
        const timePart = parts[parts.length - 1].trim();
        // Check if it looks like a time format
        if (/\d{1,2}:\d{2}\s*(?:AM|PM)/i.test(timePart)) {
          return timePart;
        }
      }

      return "Unknown";
    } catch (error) {
      console.warn("Failed to extract pickup time:", timeOfRide, error);
      return "Unknown";
    }
  }
}
