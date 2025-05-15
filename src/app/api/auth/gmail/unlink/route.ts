import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * API endpoint to unlink Gmail from the current user's account
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Remove Gmail tokens from user metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        gmailAuth: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gmail account unlinked successfully",
    });
  } catch (error: any) {
    console.error("Failed to unlink Gmail account:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to unlink Gmail account",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
