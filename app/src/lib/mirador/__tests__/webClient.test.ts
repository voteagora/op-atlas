jest.mock("@miradorlabs/web-sdk/dist/index.esm.js", () => ({
  Client: jest
    .fn()
    .mockImplementation((apiKey: string, options?: unknown) => ({
      apiKey,
      options,
    })),
  Web3Plugin: jest.fn(() => ({ name: "web3" })),
}))

import { Client } from "@miradorlabs/web-sdk/dist/index.esm.js"
import {
  configureMiradorWebClient,
  getMiradorWebClient,
} from "../webClient"

const ClientMock = Client as jest.MockedClass<typeof Client>

describe("webClient", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    configureMiradorWebClient({ enabled: false })
  })

  it("does not initialize a web client unless tracing is explicitly enabled", () => {
    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: false,
    })

    expect(ClientMock).not.toHaveBeenCalled()
    expect(getMiradorWebClient()).toBeNull()
  })

  it("initializes a web client with Web3Plugin when tracing is enabled", () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "true"
    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: true,
    })

    expect(ClientMock).toHaveBeenCalledWith(
      "web-key",
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
    expect(getMiradorWebClient()).not.toBeNull()
  })
})
