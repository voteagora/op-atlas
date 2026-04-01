import { vote } from "../votes"
import { userOwnsAddress } from "../utils"
import { createDelegatedVoteAttestationWithTx } from "@/lib/eas/serverOnly"
import { appendServerTraceEvent } from "@/lib/mirador/serverTrace"

jest.mock("@/lib/eas/serverOnly", () => ({
  __esModule: true,
  createDelegatedVoteAttestationWithTx: jest.fn(),
}))

jest.mock("@/lib/eas/txContext", () => ({
  __esModule: true,
  extractFailedEasTxContext: jest.fn(() => ({})),
}))

jest.mock("@/lib/mirador/chains", () => ({
  __esModule: true,
  getMiradorChainNameFromChainId: jest.fn(() => "optimism"),
}))

jest.mock("@/lib/mirador/serverTrace", () => ({
  __esModule: true,
  appendServerTraceEvent: jest.fn(),
}))

const mockDb = {}
let mockSessionContext: {
  db: typeof mockDb
  impersonating: boolean
  session: null
  userId: string | null
} = {
  db: mockDb,
  impersonating: false,
  session: null,
  userId: "session-user",
}

jest.mock("@/lib/db/sessionContext", () => ({
  __esModule: true,
  withImpersonation: jest.fn(async (handler: any) => handler(mockSessionContext)),
}))

jest.mock("../utils", () => ({
  __esModule: true,
  userOwnsAddress: jest.fn(),
}))

const mockAppendServerTraceEvent =
  appendServerTraceEvent as jest.MockedFunction<typeof appendServerTraceEvent>
const mockCreateDelegatedVoteAttestationWithTx =
  createDelegatedVoteAttestationWithTx as jest.MockedFunction<
    typeof createDelegatedVoteAttestationWithTx
  >
const mockUserOwnsAddress =
  userOwnsAddress as jest.MockedFunction<typeof userOwnsAddress>

describe("vote action", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext.userId = "session-user"
    mockAppendServerTraceEvent.mockResolvedValue(undefined as never)
  })

  it("rejects unauthenticated delegated votes", async () => {
    mockSessionContext.userId = null

    await expect(
      vote(
        "0xdeadbeef",
        "signature" as any,
        "0x0000000000000000000000000000000000000001",
        "uid-1",
      ),
    ).rejects.toThrow("Unauthorized")

    expect(mockUserOwnsAddress).not.toHaveBeenCalled()
    expect(mockCreateDelegatedVoteAttestationWithTx).not.toHaveBeenCalled()
  })

  it("rejects delegated votes for signer addresses not owned by the session user", async () => {
    mockUserOwnsAddress.mockResolvedValue(false)

    await expect(
      vote(
        "0xdeadbeef",
        "signature" as any,
        "0x0000000000000000000000000000000000000001",
        "uid-1",
      ),
    ).rejects.toThrow("Unauthorized")

    expect(mockUserOwnsAddress).toHaveBeenCalledWith(
      "session-user",
      "0x0000000000000000000000000000000000000001",
      mockDb,
    )
    expect(mockCreateDelegatedVoteAttestationWithTx).not.toHaveBeenCalled()
  })

  it("creates the delegated attestation for an owned signer address", async () => {
    mockUserOwnsAddress.mockResolvedValue(true)
    mockCreateDelegatedVoteAttestationWithTx.mockResolvedValue({
      attestationId: "attestation-1",
      chainId: 10,
      txHash: "0xtx",
      txInputData: "0xinput",
    } as any)

    const result = await vote(
      "0xdeadbeef",
      "signature" as any,
      "0x0000000000000000000000000000000000000001",
      "uid-1",
    )

    expect(result).toBe("attestation-1")
    expect(mockCreateDelegatedVoteAttestationWithTx).toHaveBeenCalledWith(
      "0xdeadbeef",
      "signature",
      "0x0000000000000000000000000000000000000001",
      "uid-1",
    )
  })
})
