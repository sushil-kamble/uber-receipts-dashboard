export interface EmailAuthConfig {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface EmailSearchParams {
  startDate: Date;
  endDate: Date;
  query?: string;
  maxResults?: number;
}

export interface RawEmailData {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  to?: string;
  date?: string;
  body?: {
    text?: string;
    html?: string;
  };
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data?: string;
    attachmentId?: string;
  }>;
}

export interface EmailSearchResult {
  emails: RawEmailData[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface EmailClientInterface {
  search(params: EmailSearchParams): Promise<EmailSearchResult>;
  getEmail(id: string): Promise<RawEmailData>;
}
