jest.mock("server-only", () => ({}))

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}))

jest.mock("@/lib/metrics", () => ({
  recordError: jest.fn(),
}))

const mockClient = { apiKey: "server-key" }
jest.mock("@miradorlabs/nodejs-sdk", () => ({
  Client: jest.fn(() => mockClient),
  Web3Plugin: jest.fn(() => ({ name: "web3" })),
}))

import { Client } from "@miradorlabs/nodejs-sdk"
import { getMiradorServerClient } from "../serverClient"

const ClientMock = Client as jest.MockedClass<typeof Client>

describe("serverClient", () => {
  const originalMiradorEnabled = process.env.NEXT_PUBLIC_MIRADOR_ENABLED
  const originalServerApiKey = process.env.MIRADOR_SERVER_API_KEY

  afterAll(() => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = originalMiradorEnabled
    process.env.MIRADOR_SERVER_API_KEY = originalServerApiKey
  })

  it("returns null unless tracing is explicitly enabled", () => {
    delete process.env.NEXT_PUBLIC_MIRADOR_ENABLED
    process.env.MIRADOR_SERVER_API_KEY = "server-key"

    expect(getMiradorServerClient()).toBeNull()
  })

  it("creates a server client with Web3Plugin when tracing is enabled", () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "true"
    process.env.MIRADOR_SERVER_API_KEY = "server-key"

    const client = getMiradorServerClient()
    expect(client).not.toBeNull()
    expect(ClientMock).toHaveBeenCalledWith(
      "server-key",
      expect.objectContaining({
        plugins: expect.arrayContaining([
          expect.objectContaining({ name: "web3" }),
        ]),
        callbacks: expect.objectContaining({
          onFlushError: expect.any(Function),
          onDropped: expect.any(Function),
        }),
      }),
    )
  })
})
