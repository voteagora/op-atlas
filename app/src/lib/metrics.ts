import { metrics } from "@opentelemetry/api"

const meter = metrics.getMeter("op-atlas", "0.1.0")

// Counter metrics
export const apiRequestCounter = meter.createCounter("api_requests_total", {
  description: "Total number of API requests",
})

export const projectCreationCounter = meter.createCounter(
  "projects_created_total",
  {
    description: "Total number of projects created",
  },
)

export const userAuthCounter = meter.createCounter("user_auth_attempts_total", {
  description: "Total number of user authentication attempts",
})

export const errorCounter = meter.createCounter("errors_total", {
  description: "Total number of errors",
})

// Histogram metrics
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

// Gauge metrics
export const activeUsersGauge = meter.createUpDownCounter("active_users", {
  description: "Number of active users",
})

// Utility functions to record metrics
export const recordApiRequest = (
  method: string,
  route: string,
  status: number,
) => {
  apiRequestCounter.add(1, {
    method,
    route,
    status: status.toString(),
  })
}

export const recordProjectCreation = (success: boolean) => {
  projectCreationCounter.add(1, {
    success: success.toString(),
  })
}

export const recordUserAuth = (success: boolean, method: string) => {
  userAuthCounter.add(1, {
    success: success.toString(),
    method,
  })
}

export const recordError = (errorType: string, component: string) => {
  errorCounter.add(1, {
    error_type: errorType,
    component,
  })
}

export const recordApiDuration = (
  duration: number,
  method: string,
  route: string,
) => {
  apiRequestDuration.record(duration, {
    method,
    route,
  })
}

export const recordDbQueryDuration = (duration: number, operation: string) => {
  dbQueryDuration.record(duration, {
    operation,
  })
}
