import {
  createNewProject,
  getApplications,
  getPublicRoundApplicationProjects,
  setProjectOrganization,
  getUserApplicationsForRound,
} from "../projects"
import {
  createProject,
  getPublicRoundApplicationProjectsWithClient,
  removeProjectOrganization,
  updateProjectOrganization,
  getUserApplicationsWithClient,
} from "@/db/projects"
import { withImpersonation } from "@/lib/db/sessionContext"
import {
  resolveSessionUserId,
  verifyAdminStatus,
  verifyOrganizationAdmin,
} from "../utils"
import { createEntityAttestationWithTx } from "@/lib/eas/serverOnly"

jest.mock("next/cache", () => ({
  __esModule: true,
  revalidatePath: jest.fn(),
}))

jest.mock("@/db/projects", () => ({
  __esModule: true,
  createProject: jest.fn(),
  getPublicRoundApplicationProjectsWithClient: jest.fn(),
  removeProjectOrganization: jest.fn(),
  updateProjectOrganization: jest.fn(),
  getUserApplicationsWithClient: jest.fn(),
}))

jest.mock("@/db/users", () => ({
  __esModule: true,
  getUserById: jest.fn(),
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

jest.mock("@/lib/eas/serverOnly", () => ({
  __esModule: true,
  createEntityAttestationWithTx: jest.fn(),
}))

jest.mock("@/lib/mirador/serverTrace", () => ({
  __esModule: true,
  appendServerTraceEvent: jest.fn(),
  withMiradorTraceStep: jest.fn(),
}))

jest.mock("../utils", () => ({
  __esModule: true,
  resolveSessionUserId: jest.fn(),
  verifyAdminStatus: jest.fn(),
  verifyMembership: jest.fn(),
  verifyOrganizationAdmin: jest.fn(),
  verifyOrganizationMembership: jest.fn(),
}))

jest.mock("../snapshots", () => ({
  __esModule: true,
  createOrganizationSnapshot: jest.fn(),
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

const mockGetUserApplicationsWithClient =
  getUserApplicationsWithClient as jest.MockedFunction<
    typeof getUserApplicationsWithClient
  >
const mockCreateProject = createProject as jest.MockedFunction<
  typeof createProject
>
const mockGetPublicRoundApplicationProjectsWithClient =
  getPublicRoundApplicationProjectsWithClient as jest.MockedFunction<
    typeof getPublicRoundApplicationProjectsWithClient
  >
const mockRemoveProjectOrganization =
  removeProjectOrganization as jest.MockedFunction<
    typeof removeProjectOrganization
  >
const mockUpdateProjectOrganization =
  updateProjectOrganization as jest.MockedFunction<
    typeof updateProjectOrganization
  >
const mockWithImpersonation = withImpersonation as jest.MockedFunction<
  typeof withImpersonation
>
const mockResolveSessionUserId = resolveSessionUserId as jest.MockedFunction<
  typeof resolveSessionUserId
>
const mockVerifyAdminStatus = verifyAdminStatus as jest.MockedFunction<
  typeof verifyAdminStatus
>
const mockVerifyOrganizationAdmin =
  verifyOrganizationAdmin as jest.MockedFunction<typeof verifyOrganizationAdmin>
const mockCreateEntityAttestationWithTx =
  createEntityAttestationWithTx as jest.MockedFunction<
    typeof createEntityAttestationWithTx
  >

describe("project action auth boundaries", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSessionContext.userId = "session-user"
    mockVerifyAdminStatus.mockResolvedValue(null)
    mockVerifyOrganizationAdmin.mockResolvedValue(null)
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

  it("requires an authenticated user for getApplications", async () => {
    mockSessionContext.userId = null

    await expect(getApplications("session-user")).rejects.toThrow(
      "Unauthorized",
    )
    expect(mockGetUserApplicationsWithClient).not.toHaveBeenCalled()
    expect(mockWithImpersonation).toHaveBeenCalledWith(expect.any(Function), {
      requireUser: true,
    })
  })

  it("returns an empty list when getApplications is called for another user", async () => {
    const result = await getApplications("other-user")

    expect(result).toEqual([])
    expect(mockResolveSessionUserId).toHaveBeenCalledWith(
      "session-user",
      "other-user",
    )
    expect(mockGetUserApplicationsWithClient).not.toHaveBeenCalled()
  })

  it("scopes getApplications to the effective session user", async () => {
    const applications = [{ id: "application-1" }] as any
    mockGetUserApplicationsWithClient.mockResolvedValue(applications)

    const result = await getApplications("session-user")

    expect(result).toBe(applications)
    expect(mockGetUserApplicationsWithClient).toHaveBeenCalledWith(
      { userId: "session-user" },
      mockDb,
    )
  })

  it("scopes getUserApplicationsForRound to the effective session user", async () => {
    const applications = [{ id: "application-6" }] as any
    mockGetUserApplicationsWithClient.mockResolvedValue(applications)

    const result = await getUserApplicationsForRound("session-user", 6)

    expect(result).toBe(applications)
    expect(mockGetUserApplicationsWithClient).toHaveBeenCalledWith(
      {
        userId: "session-user",
        roundId: "6",
      },
      mockDb,
    )
    expect(mockWithImpersonation).toHaveBeenCalledWith(expect.any(Function), {
      requireUser: true,
    })
  })

  it("keeps the public round project list available without a session", async () => {
    mockSessionContext.userId = null
    const publicProjects = [
      { projectId: "project-1", thumbnailUrl: "https://example.com/p1.png" },
    ]
    mockGetPublicRoundApplicationProjectsWithClient.mockResolvedValue(
      publicProjects,
    )

    const result = await getPublicRoundApplicationProjects(6)

    expect(result).toEqual(publicProjects)
    expect(
      mockGetPublicRoundApplicationProjectsWithClient,
    ).toHaveBeenCalledWith({ roundId: "6" }, mockDb)
  })

  it("blocks project creation before side effects when the target organization is unauthorized", async () => {
    mockVerifyOrganizationAdmin.mockResolvedValue({ error: "Unauthorized" })

    const result = await createNewProject({ name: "New project" } as any, "org-1")

    expect(result).toEqual({ error: "Unauthorized" })
    expect(mockCreateEntityAttestationWithTx).not.toHaveBeenCalled()
    expect(mockCreateProject).not.toHaveBeenCalled()
  })

  it("requires org admin rights to attach a project to an organization", async () => {
    mockVerifyOrganizationAdmin.mockResolvedValue({ error: "Unauthorized" })

    const result = await setProjectOrganization("project-1", undefined, "org-1")

    expect(result).toEqual({ error: "Unauthorized" })
    expect(mockUpdateProjectOrganization).not.toHaveBeenCalled()
  })

  it("requires org admin rights to detach a project from its current organization", async () => {
    mockVerifyOrganizationAdmin.mockResolvedValue({ error: "Unauthorized" })

    const result = await setProjectOrganization("project-1", "org-1", undefined)

    expect(result).toEqual({ error: "Unauthorized" })
    expect(mockRemoveProjectOrganization).not.toHaveBeenCalled()
  })
})
