import { NextRequest, NextResponse } from "next/server";
import { GmailClient } from "@/lib/email-client/gmail-client";
import { getValidAccessToken } from "@/lib/auth/gmail-auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    const attachmentId = searchParams.get("attachmentId");
    const filename = searchParams.get("filename") || "attachment.pdf";

    if (!messageId || !attachmentId) {
      return NextResponse.json(
        { error: "Missing messageId or attachmentId" },
        { status: 400 }
      );
    }

    // Get valid access token
    const accessToken = await getValidAccessToken();

    // Configure email auth
    const emailAuth = {
      userId: "me",
      accessToken: accessToken,
    };

    // Initialize Gmail client
    const gmailClient = new GmailClient(emailAuth);

    // Get attachment data
    const attachmentData = await gmailClient.getAttachment(
      messageId,
      attachmentId
    );

    if (!attachmentData.data) {
      return NextResponse.json(
        { error: "No attachment data found" },
        { status: 404 }
      );
    }

    // Decode base64url data
    const buffer = Buffer.from(attachmentData.data, "base64url");

    // Return the file with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error downloading attachment:", error);
    return NextResponse.json(
      { error: "Failed to download attachment" },
      { status: 500 }
    );
  }
}
