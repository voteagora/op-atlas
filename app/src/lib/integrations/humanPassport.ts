import "server-only"

export type PassportScoreStatus = "ok" | "insufficient" | "blocked" | "error"

export interface PassportScoreResult {
  address: string
  score: number | null
  status: PassportScoreStatus
  fetchedAt: Date
  raw?: unknown
  error?: string
}

type FetchPassportScoreArgs = {
  address: string
  model?: string
  signal?: AbortSignal
}

const DEFAULT_MODEL = "aggregate"

const API_URL =
  process.env.HUMAN_PASSPORT_API_URL?.replace(/\/$/, "") ??
  "https://api.passport.xyz"
const API_KEY = process.env.HUMAN_PASSPORT_API_KEY

export async function fetchPassportScore({
  address,
  model = DEFAULT_MODEL,
  signal,
}: FetchPassportScoreArgs): Promise<PassportScoreResult> {
  const lowerAddress = address.toLowerCase()
  const timestamp = new Date()
  if (!API_KEY) {
    return {
      address: lowerAddress,
      score: null,
      status: "error",
      fetchedAt: timestamp,
      error: "Missing HUMAN_PASSPORT_API_KEY",
    }
  }

  const endpoint = `${API_URL}/v2/models/score/${lowerAddress}`

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
      },
      signal,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorBody = await safeJson(response)
      return {
        address: lowerAddress,
        score: null,
        status: "error",
        fetchedAt: timestamp,
        error: `Passport API responded with ${response.status}`,
        raw: errorBody,
      }
    }

    const data = await safeJson(response)
    const scoreValue = extractScore(data, model)

    if (typeof scoreValue !== "number") {
      return {
        address: lowerAddress,
        score: null,
        status: "error",
        fetchedAt: timestamp,
        error: "Unable to parse score from Passport response",
        raw: data,
      }
    }

    const status = deriveStatus(scoreValue)

    return {
      address: lowerAddress,
      score: status === "insufficient" ? null : scoreValue,
      status,
      fetchedAt: timestamp,
      raw: data,
    }
  } catch (error) {
    return {
      address: lowerAddress,
      score: null,
      status: "error",
      fetchedAt: timestamp,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

function deriveStatus(score: number): PassportScoreStatus {
  if (score < 0) {
    return "insufficient"
  }

  if (score === 0) {
    return "blocked"
  }

  return "ok"
}

async function safeJson(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function extractScore(payload: unknown, model: string): number | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  // Common response formats
  if ("score" in payload) {
    const directScore = getScoreValue(
      (payload as { score: unknown }).score,
    )
    if (directScore !== null) {
      return directScore
    }
  }

  const modelScore = extractModelScoreFromDetails(payload, model)
  if (modelScore !== null) {
    return modelScore
  }

  if (model !== DEFAULT_MODEL) {
    const defaultModelScore = extractModelScoreFromDetails(payload, DEFAULT_MODEL)
    if (defaultModelScore !== null) {
      return defaultModelScore
    }
  }

  if ("data" in payload) {
    const nested = (payload as { data: unknown }).data
    if (nested && typeof nested === "object" && "score" in nested) {
      return getScoreValue((nested as { score: unknown }).score)
    }
  }

  return null
}

function extractModelScoreFromDetails(payload: unknown, model: string): number | null {
  if (!payload || typeof payload !== "object") {
    return null
  }

  const details = (payload as { details?: unknown }).details
  if (!details || typeof details !== "object") {
    return null
  }

  const models = (details as { models?: unknown }).models
  if (!models || typeof models !== "object") {
    return null
  }

  const entry = (models as Record<string, unknown>)[model]
  if (!entry || typeof entry !== "object") {
    return null
  }

  return getScoreValue((entry as { score?: unknown }).score ?? null)
}

function getScoreValue(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    (value as { value: unknown }).value !== undefined
  ) {
    return getScoreValue((value as { value: unknown }).value)
  }

  return null
}
