import { metrics } from "@opentelemetry/api"

const meter = metrics.getMeter("op-atlas", "0.1.0")

// Core metrics
export const apiRequestCounter = meter.createCounter("api_requests_total", {
  description: "Total number of API requests",
})

export const dbQueryCounter = meter.createCounter("db_queries_total", {
  description: "Total number of database queries",
})

export const externalApiCounter = meter.createCounter(
  "external_api_calls_total",
  {
    description: "Total number of external API calls",
  },
)

export const userOperationCounter = meter.createCounter(
  "user_operations_total",
  {
    description: "Total number of user operations",
  },
)

export const errorCounter = meter.createCounter("errors_total", {
  description: "Total number of errors",
})

// Duration metrics
export const apiRequestDuration = meter.createHistogram(
  "api_request_duration_seconds",
  {
    description: "Duration of API requests in seconds",
  },
)

export const dbQueryDuration = meter.createHistogram(
  "db_query_duration_seconds",
  {
    description: "Duration of database queries in seconds",
  },
)

export const externalApiDuration = meter.createHistogram(
  "external_api_duration_seconds",
  {
    description: "Duration of external API calls in seconds",
  },
)

export const userOperationDuration = meter.createHistogram(
  "user_operation_duration_seconds",
  {
    description: "Duration of user operations in seconds",
  },
)

// API request instrumentation
export const recordApiRequest = (
  method: string,
  route: string,
  status: number,
  duration?: number,
) => {
  apiRequestCounter.add(1, {
    method,
    route,
    status: status.toString(),
  })

  if (duration !== undefined) {
    apiRequestDuration.record(duration, {
      method,
      route,
    })
  }
}

// Database query instrumentation
export const recordDbQuery = (
  operation: string,
  table: string,
  success: boolean,
  duration?: number,
) => {
  dbQueryCounter.add(1, {
    operation,
    table,
    success: success.toString(),
  })

  if (duration !== undefined) {
    dbQueryDuration.record(duration, {
      operation,
      table,
    })
  }
}

// External API call instrumentation
export const recordExternalApiCall = (
  service: string,
  endpoint: string,
  method: string,
  status: number,
  duration?: number,
) => {
  externalApiCounter.add(1, {
    service,
    endpoint,
    method,
    status: status.toString(),
  })

  if (duration !== undefined) {
    externalApiDuration.record(duration, {
      service,
      endpoint,
      method,
    })
  }
}

// User operation instrumentation
export const recordUserOperation = (
  operation: string,
  userType: string,
  success: boolean,
  duration?: number,
) => {
  userOperationCounter.add(1, {
    operation,
    user_type: userType,
    success: success.toString(),
  })

  if (duration !== undefined) {
    userOperationDuration.record(duration, {
      operation,
      user_type: userType,
    })
  }
}

// Error instrumentation
export const recordError = (
  errorType: string,
  component: string,
  operation?: string,
) => {
  errorCounter.add(1, {
    error_type: errorType,
    component,
    ...(operation && { operation }),
  })
}
