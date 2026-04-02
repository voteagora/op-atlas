import {
  activeUserApplications,
  applyForRole,
  getAllUserRoleApplications,
} from "../role"
import {
  getActiveUserRoleApplications,
  getRoleById,
  getUserRoleApplications,
  upsertRoleApplication,
} from "@/db/role"
import { withImpersonation } from "@/lib/db/sessionContext"
import {
  resolveSessionUserId,
  verifyOrganizationMembership,
} from "../utils"

jest.mock("@/db/role", () => ({
  __esModule: true,
  getActiveUserRoleApplications: jest.fn(),
  getRoleById: jest.fn(),
  getUserRoleApplications: jest.fn(),
  upsertRoleApplication: jest.fn(),
}))

jest.mock("@/lib/db/sessionContext", () => ({
  __esModule: true,
  withImpersonation: jest.fn(async (handler: any, options?: any) => {
    if (options?.requireUser && !mockSessionContext.userId) {
      throw new Error("Unauthorized")
    }

    return handler(mockSessionContext)
  }),
}))

jest.mock("../utils", () => ({
  __esModule: true,
  resolveSessionUserId: jest.fn(),
  verifyOrganizationMembership: jest.fn(),
}))

const mockDb = {}
let mockSessionContext: {
  db: typeof mockDb
  userId: string | null
} = {
  db: mockDb,
  userId: "session-user",
}
let consoleErrorSpy: jest.SpyInstance

const mockGetActiveUserRoleApplications =
  getActiveUserRoleApplications as jest.MockedFunction<
    typeof getActiveUserRoleApplications
  >
const mockGetRoleById = getRoleById as jest.MockedFunction<typeof getRoleById>
const mockGetUserRoleApplications =
  getUserRoleApplications as jest.MockedFunction<typeof getUserRoleApplications>
const mockUpsertRoleApplication =
  upsertRoleApplication as jest.MockedFunction<typeof upsertRoleApplication>
const mockWithImpersonation = withImpersonation as jest.MockedFunction<
  typeof withImpersonation
>
const mockResolveSessionUserId = resolveSessionUserId as jest.MockedFunction<
  typeof resolveSessionUserId
>
const mockVerifyOrganizationMembership =
  verifyOrganizationMembership as jest.MockedFunction<
    typeof verifyOrganizationMembership
  >

describe("role action auth boundaries", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    mockSessionContext.userId = "session-user"
    mockVerifyOrganizationMembership.mockResolvedValue(null)
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

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it("blocks role applications on behalf of organizations the caller does not belong to", async () => {
    mockGetRoleById.mockResolvedValue({
      id: 1,
      startAt: new Date(Date.now() - 1_000),
      endAt: new Date(Date.now() + 1_000),
    } as any)
    mockVerifyOrganizationMembership.mockResolvedValue({
      error: "Unauthorized",
    })

    await expect(
      applyForRole(1, {
        organizationId: "org-1",
        application: "{}",
      }),
    ).rejects.toThrow("Unauthorized")

    expect(mockUpsertRoleApplication).not.toHaveBeenCalled()
    expect(mockWithImpersonation).toHaveBeenCalledWith(expect.any(Function), {
      requireUser: true,
    })
  })

  it("blocks organization-scoped application reads for non-members", async () => {
    mockVerifyOrganizationMembership.mockResolvedValue({
      error: "Unauthorized",
    })

    await expect(
      activeUserApplications(undefined, "org-1"),
    ).rejects.toThrow("Unauthorized")

    expect(mockGetActiveUserRoleApplications).not.toHaveBeenCalled()
  })

  it("reads organization-scoped applications without forcing a user filter", async () => {
    const applications = [{ id: 42 }] as any
    mockGetUserRoleApplications.mockResolvedValue(applications)

    const result = await getAllUserRoleApplications(undefined, "org-1")

    expect(result).toBe(applications)
    expect(mockGetUserRoleApplications).toHaveBeenCalledWith(
      undefined,
      "org-1",
      mockDb,
    )
  })
})
