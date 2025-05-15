import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { hasGmailConnection } from "@/lib/auth/gmail-auth";

/**
 * API endpoint to check if the current user has connected their Gmail account
 */
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if the user has connected Gmail
    const isConnected = await hasGmailConnection();

    return NextResponse.json({
      success: true,
      data: {
        isConnected,
      },
    });
  } catch (error: any) {
    console.error("Gmail status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check Gmail connection status",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
