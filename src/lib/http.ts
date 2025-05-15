import { NextResponse } from 'next/server';

// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Response Type
type ApiResponse<T> = {
  data?: T;
  error?: string;
  details?: unknown;
  message?: string;
};

// Response Helpers
export const ApiResponse = {
  // Success responses
  success<T>(data: T, status = HttpStatus.OK): NextResponse {
    return NextResponse.json({ data }, { status });
  },

  created<T>(data: T): NextResponse {
    return NextResponse.json({ data }, { status: HttpStatus.CREATED });
  },

  noContent(): NextResponse {
    return new NextResponse(null, { status: HttpStatus.NO_CONTENT });
  },

  // Error responses
  badRequest(message = 'Bad request', details?: unknown): NextResponse {
    return NextResponse.json(
      { error: message, details },
      { status: HttpStatus.BAD_REQUEST }
    );
  },

  unauthorized(message = 'Unauthorized'): NextResponse {
    return NextResponse.json(
      { error: message },
      { status: HttpStatus.UNAUTHORIZED }
    );
  },

  notFound(message = 'Resource not found'): NextResponse {
    return NextResponse.json(
      { error: message },
      { status: HttpStatus.NOT_FOUND }
    );
  },

  serverError(message = 'Internal server error'): NextResponse {
    return NextResponse.json(
      { error: message },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  },
};
