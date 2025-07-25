# OpenTelemetry Integration

This document describes the OpenTelemetry (OTel) integration for the OP Atlas application.

## Overview

OpenTelemetry has been integrated to provide distributed tracing and metrics collection for the application. This helps with:

- **Observability**: Track request flows across services
- **Performance Monitoring**: Monitor API response times and database query performance
- **Error Tracking**: Capture and trace errors with full context
- **Business Metrics**: Track project creation, user authentication, and other key metrics

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# OpenTelemetry Configuration
OTEL_SDK_DISABLED=false                                    # Set to 'true' to disable OTel
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=http://localhost:4318/v1/metrics
OTEL_EXPORTER_OTLP_HEADERS=                               # Authorization headers if needed
```

### Supported Exporters

The application supports OTLP HTTP exporters. Common compatible backends include:

- **Jaeger** (with OTLP receiver)
- **Grafana Tempo**
- **Honeycomb**
- **New Relic**
- **Datadog**
- **Local OTEL Collector**

## What's Instrumented

### Automatic Instrumentation

The following are automatically instrumented via `@opentelemetry/auto-instrumentations-node`:

- HTTP requests and responses
- Database queries (via Prisma ORM)
- Redis operations
- File system operations (disabled to reduce noise)
- Network operations (disabled to reduce noise)

### Manual Instrumentation

Custom spans and metrics have been added for:

- API endpoints (example: `POST /api/v1/projects`)
- Database operations with custom attributes
- Business logic operations

### Available Utilities

#### Tracing Utilities (`/src/lib/tracing.ts`)

```typescript
import { traceApiOperation, traceDbOperation, addSpanAttributes } from '@/lib/tracing';

// Trace an API operation
const result = await traceApiOperation('user.create', async () => {
  return await createUser(userData);
});

// Trace a database operation
const projects = await traceDbOperation('projects.findMany', async () => {
  return await prisma.project.findMany();
});

// Add custom attributes to current span
addSpanAttributes({
  'user.id': userId,
  'project.type': 'web3'
});
```

#### Metrics Utilities (`/src/lib/metrics.ts`)

```typescript
import { recordApiRequest, recordProjectCreation } from '@/lib/metrics';

// Record API request metrics
recordApiRequest('POST', '/api/v1/projects', 201);

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
version: '3.8'
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC receiver
      - "4318:4318"   # OTLP HTTP receiver
      - "8889:8889"   # Prometheus metrics
    depends_on:
      - jaeger

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
      - "14250:14250"  # Accept jaeger.thrift over gRPC
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

## Production Deployment

### Environment-Specific Configuration

For production deployments, configure appropriate OTLP endpoints:

```bash
# For Honeycomb
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.honeycomb.io/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=YOUR_API_KEY

# For Datadog
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace.agent.datadoghq.com/v0.4/traces
OTEL_EXPORTER_OTLP_HEADERS=DD-API-KEY=YOUR_API_KEY

# For New Relic
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://otlp.nr-data.net:4318/v1/traces
OTEL_EXPORTER_OTLP_HEADERS=api-key=YOUR_LICENSE_KEY
```

### Performance Considerations

- **Sampling**: Adjust `tracesSampleRate` in `otel.ts` for production (e.g., 0.1 for 10% sampling)
- **Batch Processing**: The SDK uses batching by default to optimize performance
- **Resource Usage**: Monitor CPU and memory usage after enabling OTel

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