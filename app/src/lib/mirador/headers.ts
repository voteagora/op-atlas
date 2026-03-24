import { MIRADOR_FLOW_HEADER, MIRADOR_TRACE_ID_HEADER } from "./constants"
import { MiradorFlow } from "./types"

export function withMiradorTraceHeaders(
  headers: HeadersInit | undefined,
  traceId?: string | null,
  flow?: MiradorFlow,
): Headers {
  const merged = new Headers(headers)

  if (traceId) {
    merged.set(MIRADOR_TRACE_ID_HEADER, traceId)
  }

  if (flow) {
    merged.set(MIRADOR_FLOW_HEADER, flow)
  }

  return merged
}
