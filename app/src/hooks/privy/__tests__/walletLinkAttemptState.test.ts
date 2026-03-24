import {
  beginWalletLinkAttempt,
  clearActiveWalletLinkAttempt,
  hasActiveWalletLinkAttempt,
  takeActiveWalletLinkAttempt,
} from "../walletLinkAttemptState"

describe("walletLinkAttemptState", () => {
  afterEach(() => {
    clearActiveWalletLinkAttempt()
  })

  it("lets only one subscriber consume the active wallet link attempt", () => {
    const trace = { id: "wallet-link-trace" }

    const attempt = beginWalletLinkAttempt("standard", trace as any)

    expect(hasActiveWalletLinkAttempt()).toBe(true)
    expect(takeActiveWalletLinkAttempt()).toBe(attempt)
    expect(takeActiveWalletLinkAttempt()).toBeNull()
  })

  it("clears the active attempt after completion", () => {
    const attempt = beginWalletLinkAttempt("primary", null)

    clearActiveWalletLinkAttempt(attempt)

    expect(hasActiveWalletLinkAttempt()).toBe(false)
  })
})
