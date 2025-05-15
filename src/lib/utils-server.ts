import { createUserContext } from "@/app/api/_middleware/AuthMiddleware";
import { NextRequest } from "next/server";
import { ApiResponse } from "./http";
import { ZodSchema } from "zod";
import { init } from "@paralleldrive/cuid2";

export class ValidationError extends Error {
  constructor(message: string, public details: unknown) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validate<T>(
  schema: ZodSchema<T>,
  value: unknown,
  errorMessage = "Validation failed"
): T {
  const validation = schema.safeParse(value);

  if (!validation.success) {
    throw new ValidationError(errorMessage, validation.error.errors);
  }

  return validation.data;
}

export function handleError(error: unknown) {
  console.error("Error:", error);

  // Validation errors
  if (error instanceof ValidationError) {
    return ApiResponse.badRequest(error.message, error.details);
  }

  // Authentication errors
  if (error instanceof Error && error.message === "User not authenticated") {
    return ApiResponse.unauthorized();
  }

  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  return ApiResponse.serverError(message);
}

// Higher-order function to protect route handlers with authentication
export const requireAuth = <T>(
  handler: (req: NextRequest, userId: string) => Promise<T>
) => {
  return async (req: NextRequest) => {
    try {
      const { userId } = await createUserContext();
      return await handler(req, userId);
    } catch (error) {
      return handleError(error);
    }
  };
};

export const throwServerError = (
  error: unknown,
  defaultMessage = "Something went wrong."
): never => {
  console.error(error instanceof Error ? error.message : defaultMessage);
  throw new Error("Internal server error, please contact support");
};

// The init function returns a custom createId function with the specified
// configuration. All configuration properties are optional.
export const cuid = init({
  // You can use this to pass a cryptographically secure random function.
  random: Math.random,
  // the length of the id
  length: 32,
  // A custom fingerprint for the host environment. This is used to help
  // prevent collisions when generating ids in a distributed system.
  fingerprint: process.env.CUID_FINGERPRINT_SALT,
});
