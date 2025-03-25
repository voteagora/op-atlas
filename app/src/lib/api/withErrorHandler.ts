import { NextRequest, NextResponse } from "next/server"

type ErrorResponse = {
  error: string
  status: number
}

type ApiHandler<TBody = unknown> = (
  request: NextRequest,
  body: TBody,
) => Promise<NextResponse>

type ErrorHandler<TBody = unknown> = (
  error: unknown,
  request: NextRequest,
  body?: TBody,
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

export const withErrorHandler = <TBody = unknown>(
  handler: ApiHandler<TBody>,
  customErrorHandler?: ErrorHandler<TBody>,
) => {
  return async (request: NextRequest) => {
    let body: TBody | undefined
    try {
      const body = (await request.json()) as TBody | undefined

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
export const createCommonErrorHandler = <TBody = unknown>(
  logBody: boolean = true,
): ErrorHandler<TBody> => {
  return (error: unknown, request: NextRequest, body?: TBody) => {
    if (error instanceof ValidationError) {
      return {
        error: error.message,
        status: 400,
      }
    }

    if (error instanceof AuthenticationError) {
      return {
        error: error.message,
        status: 401,
      }
    }

    if (error instanceof NotFoundError) {
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
