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

const DEFAULT_MODEL = "aggregate-unique-humanity"

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

  const endpoint = `${API_URL}/models/${model}/score`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        address: lowerAddress,
      }),
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
    const scoreValue = extractScore(data)

    if (scoreValue === null) {
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

function extractScore(payload: unknown): number | null {
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

  if ("data" in payload) {
    const nested = (payload as { data: unknown }).data
    if (nested && typeof nested === "object" && "score" in nested) {
      return getScoreValue((nested as { score: unknown }).score)
    }
  }

  return null
}

function getScoreValue(value: unknown): number | null {
  if (typeof value === "number") {
    return value
  }

  if (
    value &&
    typeof value === "object" &&
    "value" in value &&
    typeof (value as { value: unknown }).value === "number"
  ) {
    return (value as { value: number }).value
  }

  return null
}
