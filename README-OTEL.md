# OpenTelemetry Integration

This document describes the OpenTelemetry (OTel) integration for the OP Atlas application.

## Overview

OpenTelemetry has been integrated specifically for Vercel deployment to provide distributed tracing and metrics collection. This helps with:

- **Observability**: Track request flows across Vercel Functions
- **Performance Monitoring**: Monitor API response times and database query performance in serverless environment
- **Error Tracking**: Capture and trace errors with full context across function executions
- **Business Metrics**: Track project creation, user authentication, and other key metrics

## Configuration

### Environment Variables

Configure these in your Vercel project settings:

```bash
# OpenTelemetry Configuration for Vercel with Datadog
OTEL_SDK_DISABLED=false                                           # Set to 'true' to disable OTel
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace-intake.datadoghq.com/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://api.datadoghq.com/api/v2/otlp/v1/metrics
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=YOUR_DATADOG_API_KEY
```

### Datadog Integration

The application is configured to work with Datadog through Vercel's built-in integration. Configure the Datadog integration through your Vercel dashboard for automatic endpoint and authentication setup.

## What's Instrumented

### Automatic Instrumentation

The following are automatically instrumented for Vercel Functions:

- HTTP requests and responses
- Database queries (via Prisma ORM)
- Express.js middleware (when applicable)
- File system operations (disabled for serverless optimization)
- Network operations (disabled for serverless optimization)
- DNS operations (disabled for serverless optimization)

### Manual Instrumentation

Custom spans and metrics have been added for:

- API endpoints (example: `POST /api/v1/projects`)
- Database operations with custom attributes
- Business logic operations

### Available Utilities

#### Tracing Utilities (`/src/lib/tracing.ts`)

```typescript
import {
  traceApiOperation,
  traceDbOperation,
  addSpanAttributes,
} from "@/lib/tracing";

// Trace an API operation
const result = await traceApiOperation("user.create", async () => {
  return await createUser(userData);
});

// Trace a database operation
const projects = await traceDbOperation("projects.findMany", async () => {
  return await prisma.project.findMany();
});

// Add custom attributes to current span
addSpanAttributes({
  "user.id": userId,
  "project.type": "web3",
});
```

#### Metrics Utilities (`/src/lib/metrics.ts`)

```typescript
import { recordApiRequest, recordProjectCreation } from "@/lib/metrics";

// Record API request metrics
recordApiRequest("POST", "/api/v1/projects", 201);

// Record business metrics
recordProjectCreation(true);
```

## Available Metrics

### API Metrics

- `api_requests_total`: Counter of total API requests
- `api_request_duration_seconds`: Histogram of API request durations

### Business Metrics

- `projects_created_total`: Counter of projects created
- `user_auth_attempts_total`: Counter of authentication attempts
- `errors_total`: Counter of errors by type and component

### Database Metrics

- `db_query_duration_seconds`: Histogram of database query durations

## Development Setup

### Using Docker with OTEL Collector

Create a `docker-compose.yml` for local development:

```yaml
version: "3.8"
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317" # OTLP gRPC receiver
      - "4318:4318" # OTLP HTTP receiver
      - "8889:8889" # Prometheus metrics
    depends_on:
      - jaeger

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686" # Jaeger UI
      - "14250:14250" # Accept jaeger.thrift over gRPC
    environment:
      - COLLECTOR_OTLP_ENABLED=true
```

### Sample OTEL Collector Config

Create `otel-collector-config.yaml`:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  prometheus:
    endpoint: "0.0.0.0:8889"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

### Start the Stack

```bash
# Start OTEL Collector and Jaeger
docker-compose up -d

# Start your application
pnpm dev
```

Access the Jaeger UI at `http://localhost:16686` to view traces.

## Vercel Deployment

This setup is optimized for Vercel's serverless environment with the following adaptations:

### Vercel-Specific Optimizations

- **Serverless Detection**: Automatically detects Vercel environment (`VERCEL=1`)
- **Resource Attributes**: Adds Vercel-specific metadata (cloud provider, platform, deployment URL)
- **Export Intervals**: Increased to 5 seconds for serverless to reduce cold start impact
- **Instrumentation**: Disabled DNS and file system instrumentations that don't work well in serverless

### Vercel Environment Variables

Vercel automatically provides these environment variables:

- `VERCEL=1`: Indicates running on Vercel
- `VERCEL_ENV`: `development`, `preview`, or `production`
- `VERCEL_URL`: Your deployment URL

### Setting Up in Vercel

1. **Add Environment Variables** in your Vercel project settings:

When using Vercel's Datadog integration (recommended), these environment variables are automatically configured. For manual setup:

```bash
OTEL_SDK_DISABLED=false
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace-intake.datadoghq.com/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://api.datadoghq.com/api/v2/otlp/v1/metrics
OTEL_EXPORTER_OTLP_HEADERS=dd-api-key=YOUR_DATADOG_API_KEY
```

### Vercel Serverless Considerations

- **Cold Starts**: First requests to new function instances may have higher latency
- **Memory Limits**: Monitor memory usage as OpenTelemetry adds overhead
- **Function Duration**: Long-running traces will be cut off when functions timeout
- **Concurrency**: Each function instance initializes its own OTel SDK

## Production Deployment

### Performance Considerations

- **Export Intervals**: Optimized for serverless (5s vs 1s for traditional deployments)
- **Batch Processing**: SDK uses batching to optimize network calls
- **Memory Usage**: Monitor memory consumption in Vercel function analytics
- **Network Impact**: OTLP exports use HTTPS for security but add network overhead

## Troubleshooting

### Common Issues

1. **No traces appearing**: Check that OTLP endpoints are reachable and credentials are correct
2. **High CPU usage**: Reduce sampling rate or disable verbose instrumentations
3. **Missing spans**: Ensure async context is properly propagated

### Debug Mode

Enable debug logging by setting `debug: true` in `otel.ts` (development only).

### Disabling OTel

Set `OTEL_SDK_DISABLED=true` to completely disable OpenTelemetry.

## Next Steps

To extend the OpenTelemetry integration:

1. Add custom metrics for specific business KPIs
2. Instrument client-side code with `@opentelemetry/instrumentation-document-load`
3. Add custom samplers for more sophisticated trace sampling
4. Integrate with alerting systems based on OTel metrics
5. Add distributed tracing across external service calls

## Files Added/Modified

- `app/otel.ts` - Main OpenTelemetry SDK configuration
- `app/src/lib/tracing.ts` - Custom tracing utilities
- `app/src/lib/metrics.ts` - Custom metrics utilities
- `app/src/instrumentation.ts` - Next.js instrumentation hook (modified)
- `app/src/app/api/v1/projects/route.ts` - Example API tracing (modified)
- `app/.env.example` - Environment variables (modified)
