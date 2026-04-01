import { fetchKycProjectUsers, fetchUserPassports } from "../hookFetchers"
import { getKYCUsersByProjectId } from "@/db/kyc"
import { getUserPassports } from "@/db/users"
import { toProjectKycUsersDTO } from "@/lib/dto"
import { resolveSessionUserId, verifyAdminStatus } from "../utils"

jest.mock("@/db/projects", () => ({
  __esModule: true,
  getAllProjectContractsWithClient: jest.fn(),
  getProjectContractsWithClient: jest.fn(),
  getProjectWithClient: jest.fn(),
  getRandomProjectsWithClient: jest.fn(),
  getUserAdminProjectsWithDetailWithClient: jest.fn(),
}))

jest.mock("@/db/organizations", () => ({
  __esModule: true,
  getOrganizationKYCTeams: jest.fn(),
  getOrganizationWithClient: jest.fn(),
}))

jest.mock("@/db/citizens", () => ({
  __esModule: true,
  getCitizenByAddress: jest.fn(),
  getCitizenForUser: jest.fn(),
}))

jest.mock("@/db/kyc", () => ({
  __esModule: true,
  getExpiredKYCCountForOrganization: jest.fn(),
  getExpiredKYCCountForProject: jest.fn(),
  getKYCUsersByProjectId: jest.fn(),
}))

jest.mock("@/db/githubProxomity", () => ({
  __esModule: true,
  getGithubProximity: jest.fn(),
}))

jest.mock("@/db/users", () => ({
  __esModule: true,
  getUserByAddress: jest.fn(),
  getUserById: jest.fn(),
  getUserByUsername: jest.fn(),
  getUserPassports: jest.fn(),
  getUserWorldId: jest.fn(),
}))

jest.mock("@/db/votes", () => ({
  __esModule: true,
  getVoteForCitizen: jest.fn(),
}))

jest.mock("@/lib/dto", () => ({
  __esModule: true,
  getKycAudienceForOrganization: jest.fn(),
  getOrganizationAudience: jest.fn(),
  getProjectAudience: jest.fn(),
  toOrganizationDTO: jest.fn(),
  toOrganizationKycTeamsDTO: jest.fn(),
  toProjectDTO: jest.fn(),
  toProjectKycUsersDTO: jest.fn(),
  toScopedUserDTO: jest.fn(),
}))

jest.mock("@/lib/oso", () => ({
  __esModule: true,
  getProjectMetrics: jest.fn(),
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
  resolveSessionUserId: jest.fn(),
  verifyAdminStatus: jest.fn(),
}))

const mockGetKYCUsersByProjectId =
  getKYCUsersByProjectId as jest.MockedFunction<typeof getKYCUsersByProjectId>
const mockGetUserPassports =
  getUserPassports as jest.MockedFunction<typeof getUserPassports>
const mockToProjectKycUsersDTO =
  toProjectKycUsersDTO as jest.MockedFunction<typeof toProjectKycUsersDTO>
const mockResolveSessionUserId =
  resolveSessionUserId as jest.MockedFunction<typeof resolveSessionUserId>
const mockVerifyAdminStatus =
  verifyAdminStatus as jest.MockedFunction<typeof verifyAdminStatus>

describe("hook fetcher auth boundaries", () => {
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

  it("rejects unauthenticated project KYC fetches", async () => {
    mockSessionContext.userId = null

    await expect(fetchKycProjectUsers("project-1")).rejects.toThrow(
      "Unauthorized",
    )
    expect(mockVerifyAdminStatus).not.toHaveBeenCalled()
  })

  it("rejects project KYC fetches for non-admin callers", async () => {
    mockVerifyAdminStatus.mockResolvedValue({
      context: "project",
      error: "Unauthorized",
    })

    await expect(fetchKycProjectUsers("project-1")).rejects.toThrow(
      "Unauthorized",
    )
    expect(mockGetKYCUsersByProjectId).not.toHaveBeenCalled()
  })

  it("returns admin-scoped project KYC DTOs for authorized callers", async () => {
    const rawPayload = [{ id: "kyc-user-1" }]
    const dtoPayload = [{ id: "kyc-user-1", status: "APPROVED" }]

    mockVerifyAdminStatus.mockResolvedValue(null)
    mockGetKYCUsersByProjectId.mockResolvedValue(rawPayload as any)
    mockToProjectKycUsersDTO.mockReturnValue(dtoPayload as any)

    const result = await fetchKycProjectUsers("project-1")

    expect(result).toEqual(dtoPayload)
    expect(mockVerifyAdminStatus).toHaveBeenCalledWith(
      "project-1",
      "session-user",
      mockDb,
    )
    expect(mockGetKYCUsersByProjectId).toHaveBeenCalledWith(
      { projectId: "project-1" },
      mockDb,
    )
    expect(mockToProjectKycUsersDTO).toHaveBeenCalledWith(rawPayload, "admin")
  })

  it("rejects passport fetches when the requested user does not match the session", async () => {
    await expect(fetchUserPassports("other-user")).rejects.toThrow(
      "Unauthorized",
    )
    expect(mockGetUserPassports).not.toHaveBeenCalled()
  })
})
