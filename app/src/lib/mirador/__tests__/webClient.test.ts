jest.mock("@miradorlabs/web-sdk/dist/index.esm.js", () => ({
  Client: jest.fn().mockImplementation((apiKey: string) => ({ apiKey })),
}))

describe("webClient", () => {
  const originalMiradorEnabled = process.env.NEXT_PUBLIC_MIRADOR_ENABLED

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    delete process.env.NEXT_PUBLIC_MIRADOR_ENABLED
  })

  afterAll(() => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = originalMiradorEnabled
  })

  it("does not initialize a web client unless tracing is explicitly enabled", async () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "false"

    const { configureMiradorWebClient, getMiradorWebClient } = await import(
      "../webClient"
    )
    const MiradorWebClientMock = jest.requireMock(
      "@miradorlabs/web-sdk/dist/index.esm.js",
    ).Client as jest.Mock

    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: process.env.NEXT_PUBLIC_MIRADOR_ENABLED === "true",
    })

    expect(MiradorWebClientMock).not.toHaveBeenCalled()
    expect(getMiradorWebClient()).toBeNull()
  })

  it("initializes a web client when tracing is explicitly enabled", async () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "true"

    const { configureMiradorWebClient, getMiradorWebClient } = await import(
      "../webClient"
    )
    const MiradorWebClientMock = jest.requireMock(
      "@miradorlabs/web-sdk/dist/index.esm.js",
    ).Client as jest.Mock

    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: process.env.NEXT_PUBLIC_MIRADOR_ENABLED === "true",
    })

    expect(MiradorWebClientMock).toHaveBeenCalledWith("web-key")
    expect(getMiradorWebClient()).toEqual({ apiKey: "web-key" })
  })
})
