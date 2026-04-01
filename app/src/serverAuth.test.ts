import { getApiUser } from "./db/apiUser"
import {
  API_USER_SCOPE,
  authenticateApiUser,
  parseApiUserScopeRules,
  resolveApiUserScopes,
} from "./serverAuth"

jest.mock("./db/apiUser", () => ({
  getApiUser: jest.fn(),
}))

const mockGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>

describe("serverAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("uses safe read-only defaults when no scope config is provided", () => {
    expect(parseApiUserScopeRules(undefined)).toEqual({
      default: [API_USER_SCOPE.projectMetadataRead, API_USER_SCOPE.rewardsRead],
      byId: {},
      byName: {},
    })
  })

  it("merges default, id, and name scopes for an API user", () => {
    const scopes = resolveApiUserScopes(
      {
        id: "User-1",
        name: "Mirador Server",
      },
      parseApiUserScopeRules(
        JSON.stringify({
          default: [API_USER_SCOPE.rewardsRead],
          byId: {
            "user-1": [API_USER_SCOPE.projectsDelete],
          },
          byName: {
            "mirador server": [API_USER_SCOPE.projectsCreate],
          },
        }),
      ),
    )

    expect(scopes).toEqual([
      API_USER_SCOPE.rewardsRead,
      API_USER_SCOPE.projectsDelete,
      API_USER_SCOPE.projectsCreate,
    ])
  })

  it("rejects a valid key when it lacks the required route scope", async () => {
    mockGetApiUser.mockResolvedValue({
      id: "user-1",
      name: "Read Only Key",
      enabled: true,
    } as any)

    const result = await authenticateApiUser(
      {
        headers: new Headers({
          Authorization: "Bearer secret",
        }),
      },
      {
        requiredScopes: [API_USER_SCOPE.projectsCreate],
      },
    )

    expect(result).toEqual({
      authenticated: false,
      failReason: "Forbidden: Api key lacks required scopes (projects:create)",
      name: "Read Only Key",
      scopes: [API_USER_SCOPE.projectMetadataRead, API_USER_SCOPE.rewardsRead],
      status: 403,
      userId: "user-1",
    })
  })

  it("accepts a valid key when an explicit byName scope grant matches", async () => {
    mockGetApiUser.mockResolvedValue({
      id: "user-2",
      name: "Mirador Server",
      enabled: true,
    } as any)

    const result = await authenticateApiUser(
      {
        headers: new Headers({
          Authorization: "Bearer secret",
        }),
      },
      {
        requiredScopes: [API_USER_SCOPE.projectMetadataWrite],
        scopeRulesRaw: JSON.stringify({
          default: [API_USER_SCOPE.projectMetadataRead],
          byName: {
            "mirador server": [API_USER_SCOPE.projectMetadataWrite],
          },
        }),
      },
    )

    expect(result).toEqual({
      authenticated: true,
      name: "Mirador Server",
      scopes: [
        API_USER_SCOPE.projectMetadataRead,
        API_USER_SCOPE.projectMetadataWrite,
      ],
      userId: "user-2",
    })
  })
})
