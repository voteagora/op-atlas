"use client"

import { Client as MiradorWebClient } from "@miradorlabs/web-sdk/dist/index.esm.js"

import { isMiradorEnabled } from "./enabled"

let miradorClient: MiradorWebClient | null = null
let configuredApiKey: string | null = null

type ConfigureMiradorWebClientOptions = {
  apiKey?: string | null
  enabled?: boolean
}

export function configureMiradorWebClient({
  apiKey,
  enabled = isMiradorEnabled(),
}: ConfigureMiradorWebClientOptions = {}) {
  if (!enabled || !apiKey) {
    miradorClient = null
    configuredApiKey = null
    return
  }

  if (miradorClient && configuredApiKey === apiKey) {
    return
  }

  try {
    miradorClient = new MiradorWebClient(apiKey)
    configuredApiKey = apiKey
  } catch (error) {
    console.error("Failed to initialize Mirador web client", error)
    miradorClient = null
    configuredApiKey = null
  }
}

export function getMiradorWebClient(): MiradorWebClient | null {
  if (!isMiradorEnabled()) {
    return null
  }

  return miradorClient
}

export function hasMiradorWebClient(): boolean {
  return miradorClient !== null
}
