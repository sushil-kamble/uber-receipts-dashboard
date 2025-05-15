import { google } from "googleapis";
import {
  EmailAuthConfig,
  EmailClientInterface,
  EmailSearchParams,
  EmailSearchResult,
  RawEmailData,
} from "./types";

// We're using any types for some Gmail API objects to simplify implementation
// In a production environment, we would use proper types
export class GmailClient implements EmailClientInterface {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private auth: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private gmail: any;

  constructor(config: EmailAuthConfig) {
    this.auth = new google.auth.OAuth2();
    this.auth.setCredentials({
      access_token: config.accessToken,
      refresh_token: config.refreshToken,
    });

    this.gmail = google.gmail({
      version: "v1",
      auth: this.auth,
    });
  }

  async search(params: EmailSearchParams): Promise<EmailSearchResult> {
    try {
      // Build search query
      const query = this.buildSearchQuery(params);

      // Execute search
      const response = await this.gmail.users.messages.list({
        userId: "me",
        q: query,
        maxResults: params.maxResults || 100,
      });

      // Process results
      const messages = response.data.messages || [];
      const emails: RawEmailData[] = [];

      // Get email details (could be optimized with batch requests)
      for (const message of messages) {
        try {
          const email = await this.getEmail(message.id);
          emails.push(email);
        } catch (error) {
          console.error(`Error fetching email ${message.id}:`, error);
        }
      }

      return {
        emails,
        nextPageToken: response.data.nextPageToken,
        resultSizeEstimate: response.data.resultSizeEstimate || 0,
      };
    } catch (error) {
      console.error("Gmail search error:", error);
      throw new Error("Failed to search emails");
    }
  }

  async getEmail(id: string): Promise<RawEmailData> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      const message = response.data;
      const headers = message.payload.headers;

      // Extract email details from headers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subject =
        headers.find((h: any) => h.name.toLowerCase() === "subject")?.value ||
        "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const from =
        headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const to =
        headers.find((h: any) => h.name.toLowerCase() === "to")?.value || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const date =
        headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";

      // Extract body
      const body = this.extractEmailBody(message.payload);

      // Extract attachments
      const attachments = this.extractAttachments(message.payload);

      return {
        id: message.id,
        threadId: message.threadId,
        snippet: message.snippet,
        subject,
        from,
        to,
        date,
        body,
        attachments,
      };
    } catch (error) {
      console.error("Error getting email:", error);
      throw new Error(`Failed to get email with ID: ${id}`);
    }
  }

  private buildSearchQuery(params: EmailSearchParams): string {
    let baseQuery = params.query || "";
    let dateQuery = "";

    // Build date filters
    if (params.startDate) {
      const startDateStr = params.startDate.toISOString().split("T")[0];
      dateQuery += `after:${startDateStr}`;
    }

    if (params.endDate) {
      const endDateStr = params.endDate.toISOString().split("T")[0];
      dateQuery += dateQuery ? ` before:${endDateStr}` : `before:${endDateStr}`;
    }

    // Combine base query and date query
    // If we have both, wrap the base query in parentheses and join with AND
    if (baseQuery && dateQuery) {
      return `(${baseQuery}) AND (${dateQuery})`;
    }

    // If we only have one component, just return it
    return (baseQuery || dateQuery).trim();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractEmailBody(payload: any): {
    text?: string;
    html?: string;
  } {
    const body = {
      text: undefined as string | undefined,
      html: undefined as string | undefined,
    };

    // Check if the payload has a body
    if (payload.body && payload.body.data) {
      const content = Buffer.from(payload.body.data, "base64").toString();
      if (payload.mimeType === "text/plain") {
        body.text = content;
      } else if (payload.mimeType === "text/html") {
        body.html = content;
      }
    }

    // Check parts
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          body.text = Buffer.from(part.body.data, "base64").toString();
        } else if (
          part.mimeType === "text/html" &&
          part.body &&
          part.body.data
        ) {
          body.html = Buffer.from(part.body.data, "base64").toString();
        }

        // Recursive check for multipart content
        if (part.parts) {
          const nestedBody = this.extractEmailBody(part);
          if (!body.text) body.text = nestedBody.text;
          if (!body.html) body.html = nestedBody.html;
        }
      }
    }

    return body;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractAttachments(
    payload: any
  ): Array<{ filename: string; mimeType: string; data?: string }> {
    const attachments: Array<{
      filename: string;
      mimeType: string;
      data?: string;
    }> = [];

    // Function to check if part is an attachment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkForAttachments = (part: any) => {
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          // For now, we're not including the actual data to avoid huge payloads
        });
      }

      // Check nested parts
      if (part.parts) {
        part.parts.forEach(checkForAttachments);
      }
    };

    // Start checking from the payload
    if (payload.parts) {
      payload.parts.forEach(checkForAttachments);
    }

    return attachments;
  }
}
