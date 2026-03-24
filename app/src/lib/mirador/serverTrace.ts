import "server-only"

import type {
  Trace as MiradorServerTrace,
  Web3Methods,
} from "@miradorlabs/nodejs-sdk"

type MiradorServerTraceWithWeb3 = MiradorServerTrace & Web3Methods

import { normalizeMiradorAttributePayload } from "./attributeNormalization"
import { getMiradorServerClient } from "./serverClient"
import {
  MiradorAttributeMap,
  MiradorChainName,
  MiradorFlow,
  MiradorTraceContext,
  MiradorTraceSource,
} from "./types"

type MiradorTxHashHint = {
  txHash: string
  chain: MiradorChainName
  details?: string
}

type MiradorSafeMessageHint = {
  safeMessageHash: string
  chain: MiradorChainName
  details?: string
}

type MiradorSafeTxHint = {
  safeTxHash: string
  chain: MiradorChainName
  details?: string
}

type StartServerTraceOptions = {
  name: string
  flow: MiradorFlow
  context?: MiradorTraceContext
  tags?: string[]
  attributes?: MiradorAttributeMap
  captureStackTrace?: boolean
  autoKeepAlive?: boolean
}

type AppendServerTraceEventArgs = {
  trace?: MiradorServerTrace | null
  traceContext?: MiradorTraceContext | null
  eventName: string
  details?: Record<string, unknown> | string
  attributes?: MiradorAttributeMap
  tags?: string[]
  txHashHints?: MiradorTxHashHint[]
  safeMessageHints?: MiradorSafeMessageHint[]
  safeTxHints?: MiradorSafeTxHint[]
  txInputData?: string | string[]
}

const MIRADOR_SERVER_DEFAULT_TRACE_NAME = "AgoraServerTrace"
let hasWarnedMissingTraceId = false

type EventSeverity = "info" | "warn" | "error"

function inferEventSeverity(eventName: string): EventSeverity {
  if (eventName.endsWith("_failed") || eventName.endsWith("_error")) {
    return "error"
  }
  if (
    eventName.endsWith("_skipped") ||
    eventName.includes("_mismatch") ||
    eventName.endsWith("_replaced")
  ) {
    return "warn"
  }
  return "info"
}

function buildContextAttributes(
  traceContext?: MiradorTraceContext | null,
): MiradorAttributeMap {
  if (!traceContext) {
    return {}
  }

  return {
    "trace.flow": traceContext.flow,
    "trace.step": traceContext.step,
    "trace.source": traceContext.source,
    "user.id": traceContext.userId,
    "user.farcasterId": traceContext.farcasterId,
    "wallet.address": traceContext.walletAddress,
    "wallet.chainId": traceContext.chainId,
    "project.id": traceContext.projectId,
    "proposal.id": traceContext.proposalId,
    "session.id": traceContext.sessionId,
  }
}

function toEventDetails(
  details?: Record<string, unknown> | string,
): string | undefined {
  if (details === undefined) {
    return undefined
  }

  if (typeof details === "string") {
    return details
  }

  try {
    return JSON.stringify(details)
  } catch {
    return String(details)
  }
}

function normalizeTxInputData(txInputData?: string | string[]): string[] {
  if (!txInputData) {
    return []
  }

  const values = Array.isArray(txInputData) ? txInputData : [txInputData]
  return values.filter(
    (value) => typeof value === "string" && value.length > 0 && value !== "0x",
  )
}

function normalizeTxHashHints(
  txHashHints?: MiradorTxHashHint[],
): MiradorTxHashHint[] {
  if (!txHashHints) {
    return []
  }

  return txHashHints.filter((hint) => Boolean(hint?.txHash && hint?.chain))
}

function normalizeSafeMessageHints(
  safeMessageHints?: MiradorSafeMessageHint[],
): MiradorSafeMessageHint[] {
  if (!safeMessageHints) {
    return []
  }

  return safeMessageHints.filter((hint) =>
    Boolean(hint?.safeMessageHash && hint?.chain),
  )
}

function normalizeSafeTxHints(
  safeTxHints?: MiradorSafeTxHint[],
): MiradorSafeTxHint[] {
  if (!safeTxHints) {
    return []
  }

  return safeTxHints.filter((hint) => Boolean(hint?.safeTxHash && hint?.chain))
}

function applyTracePayload(
  trace: MiradorServerTrace,
  traceContext: MiradorTraceContext | null | undefined,
  attributes?: MiradorAttributeMap,
  tags?: string[],
) {
  const attributePayload = normalizeMiradorAttributePayload({
    ...buildContextAttributes(traceContext),
    ...attributes,
  })

  if (Object.keys(attributePayload).length > 0) {
    trace.addAttributes(attributePayload)
  }

  if (tags && tags.length > 0) {
    trace.addTags(tags)
  }
}

export function startMiradorServerTrace({
  name,
  flow,
  context,
  tags,
  attributes,
  captureStackTrace = false,
  autoKeepAlive = true,
}: StartServerTraceOptions): MiradorServerTrace | null {
  const client = getMiradorServerClient()
  if (!client) {
    return null
  }

  try {
    const trace = client.trace({
      name,
      captureStackTrace,
      autoKeepAlive,
    })

    applyTracePayload(
      trace,
      {
        ...context,
        flow,
        source: context?.source ?? "backend",
      },
      attributes,
      tags,
    )

    return trace
  } catch (error) {
    console.error("Failed to start Mirador server trace", {
      name,
      flow,
      error,
    })
    return null
  }
}

export async function appendServerTraceEvent({
  trace,
  traceContext,
  eventName,
  details,
  attributes,
  tags,
  txHashHints,
  safeMessageHints,
  safeTxHints,
  txInputData,
}: AppendServerTraceEventArgs): Promise<void> {
  const client = getMiradorServerClient()
  if (!client) {
    return
  }

  let targetTrace = trace

  if (!targetTrace) {
    const traceId = traceContext?.traceId
    if (!traceId) {
      if (process.env.NODE_ENV !== "production" && !hasWarnedMissingTraceId) {
        hasWarnedMissingTraceId = true
        console.warn(
          "Mirador server trace event skipped because traceId is missing.",
          {
            eventName,
            flow: traceContext?.flow,
            step: traceContext?.step,
          },
        )
      }
      return
    }

    try {
      targetTrace = client.trace({
        name: traceContext?.flow ?? MIRADOR_SERVER_DEFAULT_TRACE_NAME,
        traceId,
        captureStackTrace: false,
        autoKeepAlive: false,
      })
    } catch (error) {
      console.error("Failed to append Mirador server trace event", {
        traceId,
        eventName,
        error,
      })
      return
    }
  }

  try {
    applyTracePayload(targetTrace, traceContext, attributes, tags)

    const severity = inferEventSeverity(eventName)
    targetTrace[severity](eventName, toEventDetails(details))

    const web3Trace = targetTrace as MiradorServerTraceWithWeb3

    for (const inputData of normalizeTxInputData(txInputData)) {
      web3Trace.web3.evm.addInputData(inputData)
    }

    for (const hint of normalizeTxHashHints(txHashHints)) {
      web3Trace.web3.evm.addTxHint(hint.txHash, hint.chain, hint.details)
    }

    for (const hint of normalizeSafeMessageHints(safeMessageHints)) {
      web3Trace.web3.safe.addMsgHint(
        hint.safeMessageHash,
        hint.chain,
        hint.details ?? undefined,
      )
    }

    for (const hint of normalizeSafeTxHints(safeTxHints)) {
      web3Trace.web3.safe.addTxHint(hint.safeTxHash, hint.chain, hint.details)
    }

    // Flush immediately so the request-scoped append is enqueued in this turn.
    targetTrace.flush()
  } catch (error) {
    console.error("Failed to append Mirador server trace event", {
      traceId: traceContext?.traceId ?? targetTrace.getTraceId(),
      eventName,
      error,
    })
  }
}

export async function closeMiradorServerTrace(
  trace: MiradorServerTrace | null | undefined,
  reason?: string,
) {
  if (!trace) {
    return
  }

  const traceId = trace.getTraceId()

  try {
    await trace.close(reason)
  } catch (error) {
    console.error("Failed to close Mirador server trace", {
      traceId,
      reason,
      error,
    })
  }
}

export function withMiradorTraceStep(
  traceContext: MiradorTraceContext | null | undefined,
  step: string,
  source: MiradorTraceSource = "backend",
): MiradorTraceContext | undefined {
  if (!traceContext) {
    return undefined
  }

  return {
    ...traceContext,
    step,
    source,
  }
}
