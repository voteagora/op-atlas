"use client"

import { MiradorFlow, MiradorTraceContext } from "./types"
import { flushAndWaitForMiradorTraceId } from "./webTrace"

type TraceLike = Parameters<typeof flushAndWaitForMiradorTraceId>[0]

type BuildFrontendTraceContextOptions = Omit<
  MiradorTraceContext,
  "traceId" | "source"
> & {
  flow: MiradorFlow
  step: string
  source?: "frontend"
}

export async function buildFrontendTraceContext(
  trace: TraceLike,
  context: BuildFrontendTraceContextOptions,
): Promise<MiradorTraceContext | undefined> {
  if (!trace) {
    return undefined
  }

  const traceId =
    trace.getTraceId() ?? (await flushAndWaitForMiradorTraceId(trace))
  if (!traceId) {
    return undefined
  }

  return {
    traceId,
    source: context.source ?? "frontend",
    ...context,
  }
}
