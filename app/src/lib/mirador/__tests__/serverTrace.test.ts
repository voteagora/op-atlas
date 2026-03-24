jest.mock("server-only", () => ({}))

jest.mock("@/lib/mirador/serverClient", () => ({
  getMiradorServerClient: jest.fn(),
}))

import { getMiradorServerClient } from "@/lib/mirador/serverClient"

import { appendServerTraceEvent } from "../serverTrace"

describe("serverTrace", () => {
  const getMiradorServerClientMock =
    getMiradorServerClient as jest.MockedFunction<typeof getMiradorServerClient>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("forwards tx, safe message, and safe tx hints when appending events", async () => {
    const trace = {
      addAttributes: jest.fn(),
      addTags: jest.fn(),
      addEvent: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      web3: {
        evm: {
          addInputData: jest.fn(),
          addTxHint: jest.fn(),
          addTx: jest.fn(),
        },
        safe: {
          addMsgHint: jest.fn(),
          addTxHint: jest.fn(),
        },
      },
      flush: jest.fn(),
    }
    const client = {
      trace: jest.fn(() => trace),
    }

    getMiradorServerClientMock.mockReturnValue(client as any)

    await appendServerTraceEvent({
      traceContext: {
        traceId: "trace-id",
        flow: "governance_vote",
      },
      eventName: "vote_server_attestation_succeeded",
      tags: ["governance", "vote", "server"],
      txHashHints: [
        {
          txHash: "0xtx",
          chain: "optimism",
          details: "Delegated vote attestation",
        },
      ],
      safeMessageHints: [
        {
          safeMessageHash: "0xsafe-message",
          chain: "optimism",
          details: "Safe SIWE message",
        },
      ],
      safeTxHints: [
        {
          safeTxHash: "0xsafe-tx",
          chain: "optimism",
          details: "Safe multisig proposal",
        },
      ],
      txInputData: ["0xa9059cbb", "0x"],
    })

    expect(client.trace).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: "trace-id",
        name: "governance_vote",
        captureStackTrace: false,
        autoKeepAlive: false,
      }),
    )
    expect(trace.web3.evm.addTxHint).toHaveBeenCalledWith(
      "0xtx",
      "optimism",
      "Delegated vote attestation",
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
    expect(trace.web3.evm.addInputData).toHaveBeenCalledTimes(1)
    expect(trace.web3.evm.addInputData).toHaveBeenCalledWith("0xa9059cbb")
    expect(trace.flush).toHaveBeenCalled()
  })

  it("uses info severity for success events", async () => {
    const trace = {
      addAttributes: jest.fn(),
      addTags: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      web3: { evm: {}, safe: {} },
      flush: jest.fn(),
    }
    const client = { trace: jest.fn(() => trace) }
    getMiradorServerClientMock.mockReturnValue(client as any)

    await appendServerTraceEvent({
      traceContext: { traceId: "trace-id", flow: "governance_vote" },
      eventName: "vote_server_attestation_succeeded",
    })

    expect(trace.info).toHaveBeenCalledWith(
      "vote_server_attestation_succeeded",
      undefined,
    )
    expect(trace.warn).not.toHaveBeenCalled()
    expect(trace.error).not.toHaveBeenCalled()
  })

  it("uses error severity for failed events", async () => {
    const trace = {
      addAttributes: jest.fn(),
      addTags: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      web3: { evm: {}, safe: {} },
      flush: jest.fn(),
    }
    const client = { trace: jest.fn(() => trace) }
    getMiradorServerClientMock.mockReturnValue(client as any)

    await appendServerTraceEvent({
      traceContext: { traceId: "trace-id", flow: "governance_vote" },
      eventName: "vote_attestation_failed",
      details: { reason: "timeout" },
    })

    expect(trace.error).toHaveBeenCalledWith(
      "vote_attestation_failed",
      '{"reason":"timeout"}',
    )
    expect(trace.info).not.toHaveBeenCalled()
  })
})
