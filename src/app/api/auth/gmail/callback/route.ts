import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, storeGmailTokens } from "@/lib/auth/gmail-auth";

/**
 * API endpoint to handle OAuth callback from Google
 * Exchanges the authorization code for access and refresh tokens
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the authorization code from the query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle error from Google
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/receipts?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Check for required parameters
    if (!code) {
      console.error("Missing code parameter");
      return NextResponse.redirect(
        new URL("/receipts?error=Missing%20authorization%20code", request.url)
      );
    }

    // Validate state if needed
    // In a production environment, you should verify the state matches what you sent
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, "base64").toString());
        if (stateData.userId !== userId) {
          console.warn("State parameter does not match current user");
        }
      } catch (e) {
        console.warn("Error parsing state parameter:", e);
      }
    }

    // Exchange the code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Store the tokens in user metadata
    await storeGmailTokens(tokens);

    // Redirect back to the receipts page with a success message
    return NextResponse.redirect(
      new URL("/receipts?success=Gmail%20connected%20successfully", request.url)
    );
  } catch (error: any) {
    console.error("Gmail callback error:", error);
    // Redirect back to the receipts page with an error message
    return NextResponse.redirect(
      new URL(
        `/receipts?error=${encodeURIComponent(
          error.message || "Failed to connect Gmail"
        )}`,
        request.url
      )
    );
  }
}
