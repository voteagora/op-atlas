jest.mock("server-only", () => ({}))

jest.mock("@miradorlabs/nodejs-sdk", () => ({
  Client: jest.fn().mockImplementation((apiKey: string) => ({ apiKey })),
}))

describe("serverClient", () => {
  const originalMiradorEnabled = process.env.NEXT_PUBLIC_MIRADOR_ENABLED
  const originalServerApiKey = process.env.MIRADOR_SERVER_API_KEY

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    delete process.env.NEXT_PUBLIC_MIRADOR_ENABLED
    delete process.env.MIRADOR_SERVER_API_KEY
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = originalMiradorEnabled
    process.env.MIRADOR_SERVER_API_KEY = originalServerApiKey
  })

  it("returns null unless tracing is explicitly enabled", async () => {
    process.env.MIRADOR_SERVER_API_KEY = "server-key"

    const { getMiradorServerClient } = await import("../serverClient")
    const MiradorServerClientMock = jest.requireMock("@miradorlabs/nodejs-sdk")
      .Client as jest.Mock

    expect(getMiradorServerClient()).toBeNull()
    expect(MiradorServerClientMock).not.toHaveBeenCalled()
  })

  it("creates a server client when tracing is explicitly enabled", async () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "true"
    process.env.MIRADOR_SERVER_API_KEY = "server-key"

    const { getMiradorServerClient } = await import("../serverClient")
    const MiradorServerClientMock = jest.requireMock("@miradorlabs/nodejs-sdk")
      .Client as jest.Mock

    expect(getMiradorServerClient()).toEqual({ apiKey: "server-key" })
    expect(MiradorServerClientMock).toHaveBeenCalledWith("server-key")
  })
})
