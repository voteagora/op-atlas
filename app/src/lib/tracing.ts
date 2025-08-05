import { SpanStatusCode, trace } from "@opentelemetry/api"

const tracer = trace.getTracer("op-atlas", "0.1.0")

/**
 * Utility function to create and manage spans for database operations
 */
export function traceDbOperation<T>(
  operationName: string,
  operation: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracer.startActiveSpan(
    `db.${operationName}`,
    { attributes },
    async (span) => {
      try {
        const result = await operation()
        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        span.recordException(error as Error)
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        throw error
      } finally {
        span.end()
      }
    },
  )
}

/**
 * Utility function to create and manage spans for API operations
 */
export function traceApiOperation<T>(
  operationName: string,
  operation: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>,
): Promise<T> {
  return tracer.startActiveSpan(
    `api.${operationName}`,
    { attributes },
    async (span) => {
      try {
        const result = await operation()
        span.setStatus({ code: SpanStatusCode.OK })
        return result
      } catch (error) {
        span.recordException(error as Error)
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : "Unknown error",
        })
        throw error
      } finally {
        span.end()
      }
    },
  )
}

/**
 * Utility function to add custom attributes to the current span
 */
export function addSpanAttributes(
  attributes: Record<string, string | number | boolean>,
) {
  const span = trace.getActiveSpan()
  if (span) {
    Object.entries(attributes).forEach(([key, value]) => {
      span.setAttribute(key, value)
    })
  }
}

/**
 * Utility function to add events to the current span
 */
export function addSpanEvent(
  name: string,
  attributes?: Record<string, string | number | boolean>,
) {
  const span = trace.getActiveSpan()
  if (span) {
    span.addEvent(name, attributes)
  }
}
