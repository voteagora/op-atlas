import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"

type CronHandler = (request: NextRequest) => Promise<Response>

interface CronOptions {
  monitorSlug: string
  requireAuth?: boolean
}

/**
 * Wrapper for CRON endpoints that handles observability and error tracking
 * @param handler The actual CRON handler function
 * @param options Configuration options for the CRON endpoint
 * @returns A wrapped handler function with observability
 */
export function withCronObservability(
  handler: CronHandler,
  options: CronOptions,
): CronHandler {
  return async function wrappedHandler(request: NextRequest) {
    // Check authentication if required
    if (options.requireAuth) {
      if (
        request.headers.get("Authorization") !==
        `Bearer ${process.env.CRON_SECRET}`
      ) {
        return new Response("Unauthorized", { status: 401 })
      }
    }

    const checkInId = Sentry.captureCheckIn({
      monitorSlug: options.monitorSlug,
      status: "in_progress",
    })

    try {
      const response = await handler(request)

      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: options.monitorSlug,
        status: "ok",
      })

      await Sentry.flush(2000)
      return response
    } catch (error) {
      Sentry.captureCheckIn({
        checkInId,
        monitorSlug: options.monitorSlug,
        status: "error",
      })
      Sentry.captureException(error)

      await Sentry.flush(2000)
      return Response.json(
        {
          error: "Internal server error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      )
    }
  }
}
