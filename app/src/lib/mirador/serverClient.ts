import "server-only"

import * as Sentry from "@sentry/nextjs"
import {
  Client as MiradorServerClient,
  Web3Plugin,
} from "@miradorlabs/nodejs-sdk"

import { recordError } from "@/lib/metrics"

import { isMiradorEnabled } from "./enabled"

let miradorServerClient: MiradorServerClient | null = null
let hasWarnedMissingServerApiKey = false

export function getMiradorServerClient(): MiradorServerClient | null {
  if (!isMiradorEnabled()) {
    return null
  }

  const apiKey = process.env.MIRADOR_SERVER_API_KEY

  if (!apiKey) {
    if (!hasWarnedMissingServerApiKey) {
      hasWarnedMissingServerApiKey = true
      console.warn(
        "MIRADOR_SERVER_API_KEY is not configured; server-side Mirador events are disabled.",
      )
    }
    return null
  }

  if (!miradorServerClient) {
    try {
      miradorServerClient = new MiradorServerClient(apiKey, {
        plugins: [Web3Plugin()],
        callbacks: {
          onFlushError: (error) => {
            Sentry.captureException(error, {
              tags: { source: "mirador", side: "server" },
            })
          },
          onDropped: (count, reason) => {
            console.warn("[mirador] server trace dropped", { count, reason })
            recordError("mirador_trace_dropped", "mirador_server")
          },
        },
      })
    } catch (error) {
      console.error("Failed to initialize Mirador server client", error)
      miradorServerClient = null
    }
  }

  return miradorServerClient
}
