import { NextRequest, NextResponse } from "next/server";
import { createUserContext } from "../../_middleware/AuthMiddleware";
import { z } from "zod";
import { Receipt } from "@/app/types";
import { searchUberReceipts } from "@/lib/email-client";
import { parseReceipts } from "@/lib/receipt-parser";
import { getValidAccessToken } from "@/lib/auth/gmail-auth";

// Input validation schema
const searchParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maxResults: z
    .string()
    .optional()
    .transform((val) => parseInt(val || "50")),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await createUserContext();

    // Get query params
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const maxResultsParam = url.searchParams.get("maxResults") || "50";

    // Validate parameters
    const validationResult = searchParamsSchema.safeParse({
      startDate: startDateParam,
      endDate: endDateParam,
      maxResults: maxResultsParam,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { startDate, endDate, maxResults } = validationResult.data;

    // Convert string dates to Date objects
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    // Get a valid access token for Gmail API
    let accessToken: string;
    try {
      accessToken = await getValidAccessToken();
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: "Gmail account not connected",
          details: error.message,
        },
        { status: 403 }
      );
    }

    // Configure email auth with the valid token
    const emailAuth = {
      userId: userId,
      accessToken: accessToken,
    };

    let receipts: Receipt[] = [];

    // Search for Uber receipts in the user's email
    const searchResults = await searchUberReceipts(
      emailAuth,
      startDateTime,
      endDateTime,
      maxResults
    );

    // Parse emails to extract receipt data
    if (searchResults.emails.length > 0) {
      const parsingResults = await parseReceipts(searchResults.emails);

      // Transform the parsed receipts to match the Receipt interface
      receipts = parsingResults
        .filter((result) => result.success)
        .map((result) => {
          // Extract relevant fields from ParsedReceipt to match Receipt interface
          const {
            id,
            date,
            amount,
            location,
            pickupLocation,
            dropoffLocation,
            pickupTime,
            dropoffTime,
            pdfUrl,
          } = result.receipt;
          return {
            id,
            date,
            amount,
            location,
            pickupLocation,
            dropoffLocation,
            pickupTime,
            dropoffTime,
            pdfUrl,
          };
        });
    }

    return NextResponse.json({
      success: true,
      message: `Found ${receipts.length} Uber receipts`,
      data: receipts,
    });
  } catch (error: any) {
    console.error("Error in receipts search API:", error);

    if (error.name === "AuthenticationError") {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to search receipts",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
