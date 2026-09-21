import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth/getUser";

/**
 * H4/M8: Centralized error handler that distinguishes:
 *  - ZodError → 400 with field-level details (no raw internals)
 *  - AuthError → 401
 *  - Known errors → 400
 *  - Unknown → 500 with generic message
 */
export function handleApiError(error: unknown, context: string) {
  console.error(`${context}:`, error);

  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return NextResponse.json(
      { success: false, error: "Validation failed", details: fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  // Don't leak internal error messages to the client
  const message = error instanceof Error ? error.message : "Internal server error";
  const isClientError = error instanceof Error && error.message.includes("required");

  return NextResponse.json(
    { success: false, error: isClientError ? message : "Internal server error" },
    { status: isClientError ? 400 : 500 }
  );
}
