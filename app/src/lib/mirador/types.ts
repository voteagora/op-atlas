export type MiradorChainName =
  | "ethereum"
  | "polygon"
  | "arbitrum"
  | "base"
  | "optimism"
  | "bsc"

export type MiradorTraceSource = "frontend" | "backend" | "api"
export type MiradorFlow =
  typeof import("./constants").MIRADOR_FLOW[keyof typeof import("./constants").MIRADOR_FLOW]

export type MiradorTraceContext = {
  traceId?: string | null
  flow?: MiradorFlow
  step?: string
  source?: MiradorTraceSource
  userId?: string
  farcasterId?: string
  walletAddress?: string
  chainId?: number | string
  projectId?: string
  proposalId?: string
  sessionId?: string
}

export type MiradorAttributeValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>
  | unknown[]

export type MiradorAttributeMap = Record<string, MiradorAttributeValue>
