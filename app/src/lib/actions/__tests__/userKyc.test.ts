import {
  getUserKYCStatus,
  linkKYCToUser,
  validateOrphanedKYCEmail,
} from "../userKyc"
import { getUserKYCUser } from "@/db/userKyc"
import { resolveSessionUserId } from "../utils"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/db/userKyc", () => ({
  __esModule: true,
  createUserKYCUser: jest.fn(),
  getUserKYCUser: jest.fn(),
  getUserPersonalKYC: jest.fn(),
  linkOrphanedKYCUserToUser: jest.fn(),
}))

jest.mock("@/lib/email/send", () => ({
  __esModule: true,
  sendKYCStartedEmail: jest.fn(),
}))

jest.mock("../utils", () => ({
  __esModule: true,
  resolveSessionUserId: jest.fn(),
}))

const mockKycUserFindFirst = jest.fn()
const mockUserEmailFindFirst = jest.fn()
const mockDb = {
  $transaction: jest.fn(),
  kYCUser: {
    findFirst: mockKycUserFindFirst,
  },
  userEmail: {
    findFirst: mockUserEmailFindFirst,
  },
}

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
  withImpersonation: jest.fn(async (handler: any) =>
    handler(mockSessionContext),
  ),
}))

const mockGetUserKYCUser = getUserKYCUser as jest.MockedFunction<
  typeof getUserKYCUser
>
const mockResolveSessionUserId = resolveSessionUserId as jest.MockedFunction<
  typeof resolveSessionUserId
>

describe("userKyc actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext.userId = "session-user"
    mockResolveSessionUserId.mockImplementation(
      (sessionUserId: string | null, requestedUserId?: string | null) => {
        if (!sessionUserId) {
          return { error: "Unauthorized" }
        }

        if (requestedUserId && requestedUserId !== sessionUserId) {
          return { error: "Unauthorized" }
        }

        return { userId: sessionUserId }
      },
    )
  })

  it("does not return another user's KYC status", async () => {
    const result = await getUserKYCStatus("other-user")

    expect(result).toEqual({
      hasApprovedKYC: false,
      hasValidKYC: false,
    })
    expect(mockGetUserKYCUser).not.toHaveBeenCalled()
  })

  it("returns the current user's approved KYC status", async () => {
    mockGetUserKYCUser.mockResolvedValue({
      kycUser: {
        id: "kyc-1",
        status: "APPROVED",
      },
    } as any)

    const result = await getUserKYCStatus("session-user")

    expect(result).toMatchObject({
      hasApprovedKYC: true,
      hasValidKYC: true,
      kycUser: {
        id: "kyc-1",
        status: "APPROVED",
      },
    })
    expect(mockGetUserKYCUser).toHaveBeenCalledWith("session-user", mockDb)
  })

  it("requires authentication before validating an orphaned KYC email", async () => {
    mockSessionContext.userId = null

    const result = await validateOrphanedKYCEmail("person@example.com")

    expect(result).toEqual({
      error: "Unauthorized",
      success: false,
    })
    expect(mockKycUserFindFirst).not.toHaveBeenCalled()
  })

  it("refuses to link a verification token that belongs to another user", async () => {
    mockUserEmailFindFirst.mockResolvedValue({
      email: "person@example.com",
      id: "user-email-1",
      user: {
        id: "other-user",
      },
      userId: "other-user",
    } as any)

    const result = await linkKYCToUser("token-1")

    expect(result).toEqual({
      error: "Unauthorized",
      success: false,
    })
    expect(mockKycUserFindFirst).not.toHaveBeenCalled()
  })
})
