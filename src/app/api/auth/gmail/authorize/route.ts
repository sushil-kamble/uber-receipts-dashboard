import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateGmailAuthUrl } from "@/lib/auth/gmail-auth";

/**
 * API endpoint to initiate the Gmail OAuth flow
 * Generates the authorization URL and redirects the user to Google's consent screen
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

    // Generate a state parameter to prevent CSRF attacks
    // In a real app, you might want to store this in a session
    const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

    // Generate the authorization URL
    const authUrl = generateGmailAuthUrl(state);

    // Redirect to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("Gmail authorization error:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL", details: error.message },
      { status: 500 }
    );
  }
}
