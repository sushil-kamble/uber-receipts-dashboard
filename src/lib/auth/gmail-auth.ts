import { auth, clerkClient } from "@clerk/nextjs/server";

const client = await clerkClient(); // Get actual ClerkClient

// Define scopes needed for Gmail API access
const GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

// Interface for auth tokens stored in Clerk metadata
export interface GmailAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Generate Google OAuth authorization URL
 */
export function generateGmailAuthUrl(state?: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error("Google OAuth credentials not configured");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent", // Force consent screen to ensure we get refresh token
  });

  if (state) {
    params.append("state", state);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<GmailAuthTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
      code,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Failed to exchange code for tokens: ${JSON.stringify(error)}`
    );
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Store Gmail auth tokens in Clerk user metadata
 * This needs to be called from an API route that can update user metadata
 */
export async function storeGmailTokens(tokens: GmailAuthTokens): Promise<void> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      gmailAuth: tokens,
    },
  });
}

/**
 * Get Gmail auth tokens from Clerk user metadata
 */
export async function getGmailTokens(): Promise<GmailAuthTokens | null> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await client.users.getUser(userId);
  const tokens = user.privateMetadata.gmailAuth as GmailAuthTokens | undefined;
  return tokens || null;
}

/**
 * Check if a user has connected their Gmail
 */
export async function hasGmailConnection(): Promise<boolean> {
  const tokens = await getGmailTokens();
  return !!tokens;
}

/**
 * Refresh access token if expired
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<GmailAuthTokens> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh token: ${JSON.stringify(error)}`);
  }

  const data = await response.json();

  const tokens = {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Use existing refresh token if new one not provided
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  // Store updated tokens
  await storeGmailTokens(tokens);

  return tokens;
}

/**
 * Get valid access token (refreshing if needed)
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = await getGmailTokens();

  if (!tokens) {
    throw new Error("No Gmail connection found");
  }

  // Check if token is expired (with 5-minute buffer)
  if (tokens.expiresAt < Date.now() + 5 * 60 * 1000) {
    // Token is expired or will expire soon, refresh it
    if (!tokens.refreshToken) {
      throw new Error("No refresh token available");
    }

    const newTokens = await refreshAccessToken(tokens.refreshToken);
    return newTokens.accessToken;
  }

  return tokens.accessToken;
}
