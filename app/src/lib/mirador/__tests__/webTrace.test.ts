jest.mock("@/lib/mirador/webClient", () => ({
  getMiradorWebClient: jest.fn(() => null),
}))

import {
  addMiradorSafeMsgHint,
  addMiradorSafeTxHint,
  addMiradorTxInputData,
  closeMiradorTrace,
  getMiradorTraceId,
} from "../webTrace"

describe("webTrace", () => {
  it("returns the trace id synchronously from v2 SDK", () => {
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
    }

    expect(getMiradorTraceId(trace as any)).toBe("trace-id")
  })

  it("returns null when trace is null", () => {
    expect(getMiradorTraceId(null)).toBeNull()
    expect(getMiradorTraceId(undefined)).toBeNull()
  })

  it("delegates trace closing to the SDK close API", async () => {
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
      close: jest.fn().mockResolvedValue(undefined),
    }

    await closeMiradorTrace(trace as any, "done")

    expect(trace.close).toHaveBeenCalledWith("done")
  })

  it("handles close errors gracefully", async () => {
    const trace = {
      getTraceId: jest.fn(() => "trace-id"),
      close: jest.fn().mockRejectedValue(new Error("close failed")),
    }
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {})

    await closeMiradorTrace(trace as any, "done")

    expect(consoleSpy).toHaveBeenCalledWith(
      "[mirador-close] client close failed",
      expect.objectContaining({ traceId: "trace-id", reason: "done" }),
    )
    consoleSpy.mockRestore()
  })

  it("skips empty tx input data placeholders", () => {
    const trace = {
      web3: { evm: { addInputData: jest.fn() } },
    }

    addMiradorTxInputData(trace as any, "0x")
    addMiradorTxInputData(trace as any, "0xa9059cbb")

    expect(trace.web3.evm.addInputData).toHaveBeenCalledTimes(1)
    expect(trace.web3.evm.addInputData).toHaveBeenCalledWith("0xa9059cbb")
  })

  it("forwards safe hints to the SDK web3 plugin", () => {
    const trace = {
      web3: {
        evm: {},
        safe: {
          addMsgHint: jest.fn(),
          addTxHint: jest.fn(),
        },
      },
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

    expect(trace.web3.safe.addMsgHint).toHaveBeenCalledWith(
      "0xsafe-message",
      "optimism",
      "Safe SIWE message",
    )
    expect(trace.web3.safe.addTxHint).toHaveBeenCalledWith(
      "0xsafe-tx",
      "optimism",
      "Safe multisig proposal",
    )
  })
})
