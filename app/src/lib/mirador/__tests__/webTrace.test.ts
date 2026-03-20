jest.mock("@/lib/mirador/webClient", () => ({
  getMiradorWebClient: jest.fn(() => null),
}))

import {
  addMiradorSafeMsgHint,
  addMiradorSafeTxHint,
  addMiradorTxInputData,
  closeMiradorTrace,
  flushAndWaitForMiradorTraceId,
} from "../webTrace"

describe("webTrace", () => {
  it("returns the trace id immediately without forcing a flush", async () => {
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
      flush: jest.fn(),
    }

    await expect(flushAndWaitForMiradorTraceId(trace as any)).resolves.toBe(
      "trace-id",
    )
    expect(trace.flush).not.toHaveBeenCalled()
  })

  it("delegates trace closing to the SDK public close API", async () => {
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
      flushQueue: Promise.resolve(),
      flush: jest.fn(),
      close: jest.fn().mockResolvedValue(undefined),
    }

    await closeMiradorTrace(trace as any, "done")

    expect(trace.flush).toHaveBeenCalled()
    expect(trace.close).toHaveBeenCalledWith("done")
  })

  it("waits for the SDK flush queue before closing", async () => {
    let resolveFlushQueue: (() => void) | undefined
    let flushQueue = Promise.resolve()
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
      stopKeepAlive: jest.fn(),
      flush: jest.fn(() => {
        flushQueue = new Promise<void>((resolve) => {
          resolveFlushQueue = resolve
        })
        trace.flushQueue = flushQueue
      }),
      flushQueue,
      close: jest.fn().mockResolvedValue(undefined),
    }

    const closePromise = closeMiradorTrace(trace as any, "done")

    await Promise.resolve()
    expect(trace.close).not.toHaveBeenCalled()

    resolveFlushQueue?.()
    await closePromise

    expect(trace.close).toHaveBeenCalledWith("done")
  })

  it("skips empty tx input data placeholders", () => {
    const trace = {
      addTxInputData: jest.fn(),
    }

    addMiradorTxInputData(trace as any, "0x")
    addMiradorTxInputData(trace as any, "0xa9059cbb")

    expect(trace.addTxInputData).toHaveBeenCalledTimes(1)
    expect(trace.addTxInputData).toHaveBeenCalledWith("0xa9059cbb")
  })

  it("forwards safe hints to the SDK trace instance", () => {
    const trace = {
      addSafeMsgHint: jest.fn(),
      addSafeTxHint: jest.fn(),
    }

    addMiradorSafeMsgHint(
      trace as any,
      "0xsafe-message",
      "optimism",
      "Safe SIWE message",
    )
    addMiradorSafeTxHint(
      trace as any,
      "0xsafe-tx",
      "optimism",
      "Safe multisig proposal",
    )

    expect(trace.addSafeMsgHint).toHaveBeenCalledWith(
      "0xsafe-message",
      "optimism",
      "Safe SIWE message",
    )
    expect(trace.addSafeTxHint).toHaveBeenCalledWith(
      "0xsafe-tx",
      "optimism",
      "Safe multisig proposal",
    )
  })
})
