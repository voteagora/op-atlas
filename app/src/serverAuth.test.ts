import { getApiUser } from "./db/apiUser"
import { authenticateApiUser } from "./serverAuth"

jest.mock("./db/apiUser", () => ({
  getApiUser: jest.fn(),
}))

const mockGetApiUser = getApiUser as jest.MockedFunction<typeof getApiUser>

describe("serverAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("rejects a request when no api key is provided", async () => {
    const result = await authenticateApiUser({
      headers: new Headers(),
    })

    expect(result).toEqual({
      authenticated: false,
      failReason: "Unauthorized: No api key provided",
      status: 401,
    })
  })

  it("rejects a valid key when the api user is disabled", async () => {
    mockGetApiUser.mockResolvedValue({
      id: "user-1",
      name: "Disabled Key",
      enabled: false,
    } as any)

    const result = await authenticateApiUser({
      headers: new Headers({
        Authorization: "Bearer secret",
      }),
    })

    expect(result).toEqual({
      authenticated: false,
      failReason: "Unauthorized: Api key is disabled",
      status: 401,
    })
  })

  it("accepts a valid enabled key", async () => {
    mockGetApiUser.mockResolvedValue({
      id: "user-2",
      name: "Mirador Server",
      enabled: true,
    } as any)

    const result = await authenticateApiUser({
      headers: new Headers({
        Authorization: "Bearer secret",
      }),
    })

    expect(result).toEqual({
      authenticated: true,
      name: "Mirador Server",
      userId: "user-2",
    })
  })
})
