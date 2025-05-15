import { HtmlParserInterface, ParsedReceipt } from "./types";

/**
 * Parser for extracting receipt data from Uber HTML emails
 */
export class UberHtmlParser implements HtmlParserInterface {
  /**
   * Parse HTML content from an Uber receipt email
   * @param html HTML content of the email
   * @returns Parsed receipt data
   */
  async parse(html: string): Promise<Partial<ParsedReceipt>> {
    try {
      // Store the original HTML for reference
      const result: Partial<ParsedReceipt> = {
        rawHtml: html,
      };

      // Extract PDF link if available
      result.pdfUrl = this.extractPdfLink(html);

      // Extract amount
      result.amount = this.extractAmount(html);

      // Extract location information
      const locations = this.extractLocations(html);
      result.location = locations.location;
      result.pickupLocation = locations.pickup;
      result.dropoffLocation = locations.dropoff;

      // Extract trip information
      result.tripId = this.extractTripId(html);
      result.type = this.extractTripType(html);

      // Extract time information
      const times = this.extractTimes(html);
      result.pickupTime = times.pickup;
      result.dropoffTime = times.dropoff;
      result.duration = times.duration;

      // Extract payment information
      const payment = this.extractPaymentInfo(html);
      result.paymentMethod = payment.method;
      result.currency = payment.currency;

      // Extract driver information
      result.driverName = this.extractDriverName(html);

      // Extract distance
      result.distance = this.extractDistance(html);

      return result;
    } catch (error) {
      console.error("Error parsing Uber receipt HTML:", error);
      return {
        // Return minimal information on parse error
        rawHtml: html,
      };
    }
  }

  /**
   * Extract the total amount from the receipt
   */
  private extractAmount(html: string): number {
    try {
      // Common patterns in Uber receipts for total amount
      const amountPatterns = [
        /Total\s*[:<].*?[$₹£€]([0-9.]+)/i,
        /Amount\s*charged\s*[:<].*?[$₹£€]([0-9.]+)/i,
        /<td[^>]*>.*?Total.*?<\/td>[^<]*<td[^>]*>.*?[$₹£€]([0-9.]+)/i,
        /[$₹£€]\s*([0-9.]+)\s*Total/i,
      ];

      for (const pattern of amountPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return parseFloat(match[1]);
        }
      }

      return 0; // Default if not found
    } catch (error) {
      console.error("Error extracting amount:", error);
      return 0;
    }
  }

  /**
   * Extract pickup and dropoff locations
   */
  private extractLocations(html: string): {
    location: string;
    pickup?: string;
    dropoff?: string;
  } {
    try {
      // Try to extract pickup location
      const pickupPatterns = [
        /Pickup\s*[:<].*?>(.*?)</i,
        /From\s*[:<].*?>(.*?)</i,
        />\s*Pickup\s*(?:location|point|address)?:\s*(.*?)(?:<|$)/i,
        // New patterns for Uber18 format
        /<tr><td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td><\/tr>/i,
        /<td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td>/i,
        /<td[^>]*class="[^"]*Uber18_text_p2[^"]*"[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td>/i,
      ];

      // Array to hold possible pickup locations
      let pickupCandidates: string[] = [];

      for (const pattern of pickupPatterns) {
        const matches = html.matchAll(new RegExp(pattern, "gi"));
        for (const match of matches) {
          if (match.length > 1) {
            // If the pattern captures time + location
            if (match.length > 2 && match[2] && match[2].trim().length > 0) {
              pickupCandidates.push(match[2].trim());
            }
            // If the pattern only captures location
            else if (
              match[1] &&
              match[1].trim().length > 0 &&
              !match[1].match(/\d{1,2}:\d{2}\s*[AP]M/i)
            ) {
              // Ensure it's not just a time
              pickupCandidates.push(match[1].trim());
            }
          }
        }
      }

      // Try to extract dropoff location
      const dropoffPatterns = [
        /Dropoff\s*[:<].*?>(.*?)</i,
        /To\s*[:<].*?>(.*?)</i,
        />\s*Dropoff\s*(?:location|point|address)?:\s*(.*?)(?:<|$)/i,
        // New pattern for Uber18 format - typically appears after pickup
        /<tr><td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td><\/tr>/i,
        /<td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td>/i,
        /<td[^>]*class="[^"]*Uber18_text_p2[^"]*"[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr><tr><td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>(.*?)<\/td>/i,
      ];

      // Array to hold possible dropoff locations
      let dropoffCandidates: string[] = [];

      for (const pattern of dropoffPatterns) {
        const matches = html.matchAll(new RegExp(pattern, "gi"));
        for (const match of matches) {
          if (match.length > 1) {
            // If the pattern captures time + location
            if (match.length > 2 && match[2] && match[2].trim().length > 0) {
              dropoffCandidates.push(match[2].trim());
            }
            // If the pattern only captures location
            else if (
              match[1] &&
              match[1].trim().length > 0 &&
              !match[1].match(/\d{1,2}:\d{2}\s*[AP]M/i)
            ) {
              // Ensure it's not just a time
              dropoffCandidates.push(match[1].trim());
            }
          }
        }
      }

      // Try a more direct approach for the Uber18 format
      // First attempt: look for addresses with landmark or common address indicators
      const directAddressPattern =
        /<td[^>]*class="[^"]*Uber18_text_p1[^"]*"[^>]*>([^<]*(?:Road|Street|Avenue|Lane|Boulevard|Blvd|St|Rd|Ave|Ln|Drive|Dr|Court|Ct|Plaza|Pl|Square|Sq|Highway|Hwy|Sector|Colony|Nagar|Wadi|Park|Village|Apartment|Flat)[^<]*)<\/td>/gi;

      const addressMatches = Array.from(html.matchAll(directAddressPattern));

      if (addressMatches.length >= 2) {
        // Assume first match is pickup, second is dropoff
        pickupCandidates.push(addressMatches[0][1].trim());
        dropoffCandidates.push(addressMatches[1][1].trim());
      } else if (addressMatches.length === 1) {
        pickupCandidates.push(addressMatches[0][1].trim());
      }

      // If specific format matches didn't work, try a broader approach for Uber18 style
      // Just look for any text in Uber18_text_p1 black class that looks like an address (contains commas)
      if (pickupCandidates.length === 0 || dropoffCandidates.length === 0) {
        const simpleAddressPattern =
          /<td[^>]*class="[^"]*Uber18_text_p1[^"]*black[^"]*"[^>]*>([^<]+(?:,)[^<]+)<\/td>/gi;
        const simpleAddressMatches = Array.from(
          html.matchAll(simpleAddressPattern)
        );

        if (simpleAddressMatches.length >= 2) {
          // If we don't have any pickup candidates yet, use the first match
          if (pickupCandidates.length === 0) {
            pickupCandidates.push(simpleAddressMatches[0][1].trim());
          }

          // If we don't have any dropoff candidates yet, use the second match
          if (dropoffCandidates.length === 0) {
            dropoffCandidates.push(simpleAddressMatches[1][1].trim());
          }
        } else if (
          simpleAddressMatches.length === 1 &&
          pickupCandidates.length === 0
        ) {
          pickupCandidates.push(simpleAddressMatches[0][1].trim());
        }
      }

      // Select the best candidate for pickup and dropoff
      let pickup =
        pickupCandidates.length > 0 ? pickupCandidates[0] : undefined;
      let dropoff =
        dropoffCandidates.length > 0
          ? // Avoid assigning the same location as pickup and dropoff
            dropoffCandidates[0] !== pickup
            ? dropoffCandidates[0]
            : dropoffCandidates.length > 1
            ? dropoffCandidates[1]
            : undefined
          : undefined;

      // Create a combined location string
      const location =
        pickup && dropoff
          ? `${pickup} to ${dropoff}`
          : pickup || dropoff || "Unknown location";

      return {
        location,
        pickup,
        dropoff,
      };
    } catch (error) {
      console.error("Error extracting locations:", error);
      return { location: "Unknown location" };
    }
  }

  /**
   * Extract the trip ID
   */
  private extractTripId(html: string): string | undefined {
    try {
      const tripIdPatterns = [
        /Trip\s*ID\s*[:<].*?([A-Za-z0-9-]+)/i,
        /Receipt\s*ID\s*[:<].*?([A-Za-z0-9-]+)/i,
        /Receipt\s*#\s*[:<].*?([A-Za-z0-9-]+)/i,
      ];

      for (const pattern of tripIdPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error extracting trip ID:", error);
      return undefined;
    }
  }

  /**
   * Extract the trip type (UberX, Uber Eats, etc.)
   */
  private extractTripType(html: string): string {
    try {
      const tripTypePatterns = [
        /Trip\s*type\s*[:<].*?>(.*?)</i,
        /<.*?>\s*(UberX|Uber Black|Uber Eats|Uber XL|UberPOOL)/i,
      ];

      for (const pattern of tripTypePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      // Check for Uber Eats specific content
      if (html.includes("Uber Eats") || html.includes("UberEats")) {
        return "Uber Eats";
      }

      return "Uber Receipt"; // Default
    } catch (error) {
      console.error("Error extracting trip type:", error);
      return "Uber Receipt";
    }
  }

  /**
   * Extract pickup and dropoff times and duration
   */
  private extractTimes(html: string): {
    pickup?: string;
    dropoff?: string;
    duration?: string;
  } {
    try {
      // Try to extract pickup time
      const pickupTimePatterns = [
        /Pickup\s*time\s*[:<].*?>(.*?)</i,
        />\s*(\d{1,2}:\d{2}\s*[AP]M).*?Pickup/i,
        // New patterns for Uber18 format
        /<td[^>]*class="[^"]*Uber18_text_p2[^"]*"[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td>/i,
        /<tr><td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr>/i,
      ];

      let pickup: string | undefined;
      for (const pattern of pickupTimePatterns) {
        const matches = html.matchAll(new RegExp(pattern, "gi"));
        const matchArray = Array.from(matches);
        if (matchArray.length > 0 && matchArray[0][1]) {
          pickup = matchArray[0][1].trim();
          break;
        }
      }

      // Try to extract dropoff time
      const dropoffTimePatterns = [
        /Dropoff\s*time\s*[:<].*?>(.*?)</i,
        />\s*(\d{1,2}:\d{2}\s*[AP]M).*?Dropoff/i,
        // New patterns for Uber18 format - typically the second time in the email
        /<td[^>]*class="[^"]*Uber18_text_p2[^"]*"[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td>/i,
        /<tr><td[^>]*>(\d{1,2}:\d{2}\s*[AP]M)<\/td><\/tr>/i,
      ];

      let dropoff: string | undefined;
      // For Uber18 format, if we already found a pickup time using the patterns above,
      // we need to find a different time for dropoff to avoid duplicates
      const alreadyFoundTimes = new Set<string>();
      if (pickup) {
        alreadyFoundTimes.add(pickup);
      }

      // Try standard patterns first
      for (const pattern of dropoffTimePatterns.slice(0, 2)) {
        const match = html.match(pattern);
        if (match && match[1] && !alreadyFoundTimes.has(match[1].trim())) {
          dropoff = match[1].trim();
          break;
        }
      }

      // If no dropoff time found, try Uber18 patterns
      if (!dropoff) {
        for (const pattern of dropoffTimePatterns.slice(2)) {
          const matches = html.matchAll(new RegExp(pattern, "gi"));
          const matchArray = Array.from(matches);

          // Look for a time that's different from pickup
          for (const matchItem of matchArray) {
            if (matchItem[1] && !alreadyFoundTimes.has(matchItem[1].trim())) {
              dropoff = matchItem[1].trim();
              break;
            }
          }

          if (dropoff) break;
        }
      }

      // Try to extract trip duration
      const durationPatterns = [
        /Duration\s*[:<].*?>(.*?)</i,
        /Trip\s*time\s*[:<].*?>(.*?)</i,
        />\s*(\d+)\s*min(?:utes?)?</i,
      ];

      let duration: string | undefined;
      for (const pattern of durationPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          // Check if it's just a number (minutes)
          const mins = parseInt(match[1].trim());
          duration = isNaN(mins) ? match[1].trim() : `${mins} min`;
          break;
        }
      }

      // If we have pickup and dropoff times, calculate approximate duration
      if (pickup && dropoff && !duration) {
        try {
          const pickupTime = this.parseTimeString(pickup);
          const dropoffTime = this.parseTimeString(dropoff);

          if (pickupTime && dropoffTime) {
            // Calculate minutes between times
            let diffMinutes =
              (dropoffTime.getTime() - pickupTime.getTime()) / (1000 * 60);

            // Handle crossing midnight (if dropoff is earlier than pickup)
            if (diffMinutes < 0) {
              diffMinutes += 24 * 60; // Add 24 hours in minutes
            }

            if (diffMinutes >= 0 && diffMinutes < 24 * 60) {
              // Reasonable trip duration (less than 24 hours)
              duration = `${Math.round(diffMinutes)} min`;
            }
          }
        } catch (e) {
          console.error("Error calculating duration:", e);
        }
      }

      return { pickup, dropoff, duration };
    } catch (error) {
      console.error("Error extracting times:", error);
      return {};
    }
  }

  /**
   * Extract payment information
   */
  private extractPaymentInfo(html: string): {
    method?: string;
    currency?: string;
  } {
    try {
      // Try to extract payment method
      const paymentMethodPatterns = [
        /Payment\s*method\s*[:<].*?>(.*?)</i,
        /Paid\s*with\s*[:<].*?>(.*?)</i,
        />\s*Visa\s*\*\d{4}</i,
        />\s*Mastercard\s*\*\d{4}</i,
        />\s*AMEX\s*\*\d{4}</i,
      ];

      let method: string | undefined;
      for (const pattern of paymentMethodPatterns) {
        const match = html.match(pattern);
        if (match) {
          if (match[1]) {
            method = match[1].trim();
          } else {
            // For card patterns without capture groups
            method = match[0].replace(/[<>]/g, "").trim();
          }
          break;
        }
      }

      // Try to determine currency
      let currency: string | undefined;
      const currencyPatterns = [/(USD|EUR|GBP|INR|JPY|CAD|AUD)/, /[$₹£€¥]/];

      for (const pattern of currencyPatterns) {
        const match = html.match(pattern);
        if (match && match[0]) {
          switch (match[0]) {
            case "$":
              currency = "USD";
              break;
            case "₹":
              currency = "INR";
              break;
            case "£":
              currency = "GBP";
              break;
            case "€":
              currency = "EUR";
              break;
            case "¥":
              currency = "JPY";
              break;
            default:
              currency = match[0];
          }
          break;
        }
      }

      return { method, currency };
    } catch (error) {
      console.error("Error extracting payment info:", error);
      return {};
    }
  }

  /**
   * Extract driver name
   */
  private extractDriverName(html: string): string | undefined {
    try {
      // This might be challenging depending on email format
      const driverPatterns = [
        /Driver\s*[:<].*?>(.*?)</i,
        /Driver\s*name\s*[:<].*?>(.*?)</i,
        /Your\s*driver\s*[:<].*?>(.*?)</i,
      ];

      for (const pattern of driverPatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error extracting driver name:", error);
      return undefined;
    }
  }

  /**
   * Extract trip distance
   */
  private extractDistance(html: string): string | undefined {
    try {
      const distancePatterns = [
        /Distance\s*[:<].*?>(.*?)</i,
        /Trip\s*distance\s*[:<].*?>(.*?)</i,
        />(\d+(?:\.\d+)?)\s*(?:miles|mi|km)<\/td>/i,
      ];

      for (const pattern of distancePatterns) {
        const match = html.match(pattern);
        if (match && match[1]) {
          const dist = match[1].trim();
          // Add unit if not present
          if (/^\d+(?:\.\d+)?$/.test(dist)) {
            // Determine unit based on locale or content
            const useKm = html.includes("km") || html.includes("kilometer");
            return `${dist} ${useKm ? "km" : "mi"}`;
          }
          return dist;
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error extracting distance:", error);
      return undefined;
    }
  }

  /**
   * Parse a time string into a Date object
   * @param timeString Time string (e.g., "11:37 PM")
   * @returns Date object representing the time (today's date with the specified time)
   */
  private parseTimeString(timeString: string): Date | null {
    try {
      // Basic validation
      if (!timeString || typeof timeString !== "string") {
        return null;
      }

      // Extract hours, minutes, and AM/PM
      const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!match) {
        return null;
      }

      // Get hours and minutes
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const isPM = match[3].toUpperCase() === "PM";

      // Adjust hours for PM
      if (isPM && hours < 12) {
        hours += 12;
      } else if (!isPM && hours === 12) {
        hours = 0; // 12 AM is 0 hours
      }

      // Create a new date object with today's date and the specified time
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date;
    } catch (error) {
      console.error("Error parsing time string:", error);
      return null;
    }
  }

  /**
   * Extract PDF download link from email
   * Gets the second href from all links in the HTML
   */
  private extractPdfLink(html: string): string | undefined {
    try {
      // Extract all href attributes from the HTML
      const hrefPattern = /href=["']([^"']*)["']/gi;

      let match;
      let links = [];

      // Find all href attributes in the HTML
      while ((match = hrefPattern.exec(html)) !== null) {
        if (match && match[1]) {
          links.push(match[1]);
        }
      }

      // Return the second link if available
      if (links.length >= 2) {
        try {
          return decodeURIComponent(links[1]); // Get the second link (index 1)
        } catch (e) {
          return links[1]; // Return as-is if decoding fails
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error extracting PDF link:", error);
      return undefined;
    }
  }
}
