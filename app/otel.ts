import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
import { resourceFromAttributes } from "@opentelemetry/resources"
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics"
import { NodeSDK } from "@opentelemetry/sdk-node"
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from "@opentelemetry/semantic-conventions"

// Create OpenTelemetry SDK
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "op-atlas",
    [ATTR_SERVICE_VERSION]: process.env.npm_package_version || "0.1.0",
    [SEMRESATTRS_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
  }),
  traceExporter: new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
      "http://localhost:4318/v1/traces",
    headers: {
      Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
    },
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url:
        process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ||
        "http://localhost:4318/v1/metrics",
      headers: {
        Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS || "",
      },
    }),
    exportIntervalMillis: 1000,
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      // Customize which instrumentations to enable/disable
      "@opentelemetry/instrumentation-fs": {
        enabled: false, // Disable file system instrumentation to reduce noise
      },
      "@opentelemetry/instrumentation-net": {
        enabled: false, // Disable net instrumentation to reduce noise
      },
    }),
  ],
})

// Start the SDK only if OpenTelemetry is enabled
if (process.env.OTEL_SDK_DISABLED !== "true") {
  sdk.start()
  console.log("OpenTelemetry started")
}

export default sdk
