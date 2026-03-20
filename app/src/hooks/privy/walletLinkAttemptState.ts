import type { Trace } from "@miradorlabs/web-sdk/dist/index.esm.js"

export type WalletLinkStrategy = "standard" | "primary"

export type WalletLinkAttempt = {
  strategy: WalletLinkStrategy
  trace: Trace | null
  phase: "pending" | "processing"
}

let activeWalletLinkAttempt: WalletLinkAttempt | null = null

export function beginWalletLinkAttempt(
  strategy: WalletLinkStrategy,
  trace: Trace | null,
): WalletLinkAttempt {
  const attempt: WalletLinkAttempt = {
    strategy,
    trace,
    phase: "pending",
  }

  activeWalletLinkAttempt = attempt
  return attempt
}

export function hasActiveWalletLinkAttempt(): boolean {
  return activeWalletLinkAttempt !== null
}

export function takeActiveWalletLinkAttempt(): WalletLinkAttempt | null {
  if (!activeWalletLinkAttempt || activeWalletLinkAttempt.phase !== "pending") {
    return null
  }

  activeWalletLinkAttempt.phase = "processing"
  return activeWalletLinkAttempt
}

export function clearActiveWalletLinkAttempt(
  attempt?: WalletLinkAttempt | null,
) {
  if (!attempt || activeWalletLinkAttempt === attempt) {
    activeWalletLinkAttempt = null
  }
}
