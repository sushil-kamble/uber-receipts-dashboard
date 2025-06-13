import { NextRequest, NextResponse } from "next/server";
import { createUserContext } from "../../_middleware/AuthMiddleware";
import { z } from "zod";
import { Receipt } from "@/app/types";
import { getValidAccessToken } from "@/lib/auth/gmail-auth";
import {
  ServiceRegistry,
  ServiceType,
  UberService,
  RapidoService,
} from "@/lib/services";

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

    // Initialize service registry
    const serviceRegistry = new ServiceRegistry();
    serviceRegistry.registerService(ServiceType.UBER, new UberService());
    serviceRegistry.registerService(ServiceType.RAPIDO, new RapidoService());

    const allReceipts: Receipt[] = [];

    // Search each service
    for (const service of serviceRegistry.getAllServices()) {
      try {
        const searchResults = await service.searchReceipts(
          emailAuth,
          startDateTime,
          endDateTime,
          maxResults
        );

        if (searchResults.emails.length > 0) {
          const parsingResults = await service.parseReceipts(
            searchResults.emails
          );

          const serviceReceipts = parsingResults
            .filter((result) => result.success)
            .map((result) => {
              // Transform to Receipt interface
              const {
                id,
                date,
                amount,
                currency,
                location,
                pickupLocation,
                dropoffLocation,
                pickupTime,
                dropoffTime,
                pdfUrl,
                service: serviceName,
                serviceId,
                driverName,
                vehicleInfo,
              } = result.receipt;

              return {
                id,
                date,
                amount,
                currency,
                location,
                pickupLocation,
                dropoffLocation,
                pickupTime,
                dropoffTime,
                pdfUrl,
                service: serviceName,
                serviceId,
                driverName,
                vehicleInfo,
              };
            });

          allReceipts.push(...serviceReceipts);
        }
      } catch (error) {
        console.warn(
          `Failed to search ${service.serviceName} receipts:`,
          error
        );
        // Continue with other services
      }
    }

    // Sort all receipts by date (newest first)
    allReceipts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({
      success: true,
      message: `Found ${
        allReceipts.length
      } receipts from ${serviceRegistry.getServiceCount()} services`,
      data: allReceipts,
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
