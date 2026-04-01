import { getActiveStream } from "../rewards"
import { getActiveStreams } from "@/lib/superfluid"
import { userOwnsAddress } from "../utils"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/db/rewards", () => ({
  __esModule: true,
  canClaimToAddressWithClient: jest.fn(),
  deleteClaim: jest.fn(),
  getRewardWithClient: jest.fn(),
  startClaim: jest.fn(),
  updateClaim: jest.fn(),
}))

jest.mock("@/lib/superfluid", () => ({
  __esModule: true,
  getActiveStreams: jest.fn(),
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
  verifyAdminStatus: jest.fn(),
}))

const mockGetActiveStreams =
  getActiveStreams as jest.MockedFunction<typeof getActiveStreams>
const mockUserOwnsAddress =
  userOwnsAddress as jest.MockedFunction<typeof userOwnsAddress>

describe("rewards actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext.userId = "session-user"
  })

  it("rejects invalid wallet addresses before loading session context", async () => {
    const result = await getActiveStream("not-an-address")

    expect(result).toEqual({
      error: "Invalid address",
    })
    expect(mockUserOwnsAddress).not.toHaveBeenCalled()
  })

  it("rejects unauthenticated active stream lookups", async () => {
    mockSessionContext.userId = null

    const result = await getActiveStream(
      "0x0000000000000000000000000000000000000001",
    )

    expect(result).toEqual({
      error: "Unauthorized",
    })
    expect(mockUserOwnsAddress).not.toHaveBeenCalled()
  })

  it("rejects active stream lookups for addresses the session user does not own", async () => {
    mockUserOwnsAddress.mockResolvedValue(false)

    const result = await getActiveStream(
      "0x0000000000000000000000000000000000000001",
    )

    expect(result).toEqual({
      error: "Unauthorized",
    })
    expect(mockUserOwnsAddress).toHaveBeenCalledWith(
      "session-user",
      "0x0000000000000000000000000000000000000001",
      mockDb,
    )
    expect(mockGetActiveStreams).not.toHaveBeenCalled()
  })

  it("returns the active stream for an owned address", async () => {
    const stream = { id: "stream-1" }

    mockUserOwnsAddress.mockResolvedValue(true)
    mockGetActiveStreams.mockResolvedValue([stream] as any)

    const result = await getActiveStream(
      "0x0000000000000000000000000000000000000001",
    )

    expect(result).toEqual({
      error: null,
      stream,
    })
    expect(mockGetActiveStreams).toHaveBeenCalledWith(
      "0x0000000000000000000000000000000000000001",
    )
  })
})
