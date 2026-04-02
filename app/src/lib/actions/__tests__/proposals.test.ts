import { fetchMoreProposals } from "../proposals"
import { getEnrichedProposalData } from "@/lib/proposals"
import { withImpersonation } from "@/lib/db/sessionContext"

jest.mock("@/lib/proposals", () => ({
  __esModule: true,
  getEnrichedProposalData: jest.fn(),
}))

jest.mock("@/lib/db/sessionContext", () => ({
  __esModule: true,
  withImpersonation: jest.fn(async (handler: any) =>
    handler(mockSessionContext),
  ),
}))

const mockDb = {}
let mockSessionContext: {
  db: typeof mockDb
  userId: string | null
} = {
  db: mockDb,
  userId: "session-user",
}

const mockGetEnrichedProposalData =
  getEnrichedProposalData as jest.MockedFunction<typeof getEnrichedProposalData>
const mockWithImpersonation = withImpersonation as jest.MockedFunction<
  typeof withImpersonation
>

describe("proposal action auth boundaries", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext.userId = "session-user"
  })

  it("uses the session user for pagination enrichment", async () => {
    mockGetEnrichedProposalData.mockResolvedValue({} as any)

    await fetchMoreProposals(3)

    expect(mockWithImpersonation).toHaveBeenCalledWith(expect.any(Function))
    expect(mockGetEnrichedProposalData).toHaveBeenCalledWith(
      {
        userId: "session-user",
        offset: 3,
      },
      { db: mockDb },
    )
  })

  it("does not inject a user when the viewer is anonymous", async () => {
    mockSessionContext.userId = null
    mockGetEnrichedProposalData.mockResolvedValue({} as any)

    await fetchMoreProposals(5)

    expect(mockGetEnrichedProposalData).toHaveBeenCalledWith(
      {
        userId: undefined,
        offset: 5,
      },
      { db: mockDb },
    )
  })
})
