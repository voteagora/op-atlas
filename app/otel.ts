import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_CLOUD_PLATFORM,
  SEMRESATTRS_CLOUD_PROVIDER,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
  SEMRESATTRS_FAAS_NAME,
} from "@opentelemetry/semantic-conventions"

// Configure resource attributes for Vercel deployment
const resourceAttributes = {
  [ATTR_SERVICE_NAME]: "op-atlas",
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "0.1.0",
  [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.VERCEL_ENV || "development",
  [SEMRESATTRS_CLOUD_PROVIDER]: "vercel",
  [SEMRESATTRS_CLOUD_PLATFORM]: "vercel_functions",
  [SEMRESATTRS_FAAS_NAME]: process.env.VERCEL_URL || "op-atlas.vercel.app",
}

// Parse OTLP headers
const parseOtlpHeaders = (headersString: string = "") => {
  const headers: Record<string, string> = {}
  if (headersString) {
    headersString.split(",").forEach((header) => {
      const [key, value] = header.split("=")
      if (key && value) {
        headers[key.trim()] = value.trim()
      }
    })
  }
  return headers
}

// Create OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resourceFromAttributes(resourceAttributes),
  traceExporter: new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      "https://trace-intake.datadoghq.com/v1/traces",
    headers: parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
        "https://api.datadoghq.com/api/v2/otlp/v1/metrics",
      headers: parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS),
    }),
    // Optimized export interval for Vercel Functions
    exportIntervalMillis: 5000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Disable instrumentations that don't work well in Vercel Functions
      "@opentelemetry/instrumentation-fs": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-net": {
        enabled: false,
      },
      "@opentelemetry/instrumentation-dns": {
        enabled: false,
      },
      // Enable key instrumentations for Vercel Functions
      "@opentelemetry/instrumentation-http": {
        enabled: true,
      },
      "@opentelemetry/instrumentation-express": {
        enabled: true,
      },
    }),
  ],
})

// Start the SDK only if OpenTelemetry is enabled
if (process.env.OTEL_SDK_DISABLED !== "true") {
  sdk.start()
  if (process.env.NODE_ENV === "development") {
    console.log("OpenTelemetry started for Vercel Functions")
  }
}

export default sdk
