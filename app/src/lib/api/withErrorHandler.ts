import { NextRequest, NextResponse } from "next/server"

type ErrorResponse = {
  error: string
  status: number
}

type ApiHandler = (request: NextRequest, body: string) => Promise<NextResponse>

type ErrorHandler = (
  error: unknown,
  request: NextRequest,
  body?: string,
) => ErrorResponse

const defaultErrorHandler: ErrorHandler = (error, request, body) => {
  console.error("Error processing request:", error)
  if (body !== undefined) {
    console.error("Request body:", body)
  }
  return {
    error: "Internal server error",
    status: 500,
  }
}

const createErrorResponse = (error: ErrorResponse): NextResponse =>
  NextResponse.json({ error: error.error }, { status: error.status })

export const withErrorHandler = (
  handler: ApiHandler,
  customErrorHandler?: ErrorHandler,
) => {
  return async (request: NextRequest) => {
    let body: string | undefined
    try {
      body = await request.text()

      if (!body) {
        throw new ValidationError("Missing request body")
      }

      return await handler(request, body)
    } catch (error) {
      const errorHandler = customErrorHandler || defaultErrorHandler
      const errorResponse = errorHandler(error, request, body)
      return createErrorResponse(errorResponse)
    }
  }
}

// Common error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

// Common error handler
export const createCommonErrorHandler = (
  logBody: boolean = true,
): ErrorHandler => {
  return (error: unknown, request: NextRequest, body?: string) => {
    if (error instanceof ValidationError) {
      console.error("Validation error:", error.message)
      return {
        error: error.message,
        status: 400,
      }
    }

    if (error instanceof AuthenticationError) {
      console.error("Authentication error:", error.message)
      return {
        error: error.message,
        status: 401,
      }
    }

    if (error instanceof NotFoundError) {
      console.error("Not found error:", error.message)
      return {
        error: error.message,
        status: 404,
      }
    }

    if (logBody) {
      console.error("Error processing request:", error)
      if (body !== undefined) {
        console.error("Request body:", body)
      }
    }

    return {
      error: "Internal server error",
      status: 500,
    }
  }
}
