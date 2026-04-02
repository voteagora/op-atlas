"use client"

import { useLinkAccount } from "@privy-io/react-auth"
import { toast } from "sonner"

import { makeUserAddressPrimaryAction } from "@/app/profile/verified-addresses/actions"
import { syncCurrentPrivyUser } from "@/lib/actions/privy"
import { buildFrontendTraceContext } from "@/lib/mirador/clientTraceContext"
import { MIRADOR_FLOW } from "@/lib/mirador/constants"
import {
  addMiradorEvent,
  closeMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace"
import { useAnalytics } from "@/providers/AnalyticsProvider"

import { useUser } from "../db/useUser"
import { useHandlePrivyErrors } from "../useHandlePrivyErrors"
import { getPrivyErrorMessage } from "./privyErrorMessages"
import {
  beginWalletLinkAttempt,
  clearActiveWalletLinkAttempt,
  hasActiveWalletLinkAttempt,
  takeActiveWalletLinkAttempt,
  WalletLinkAttempt,
  WalletLinkStrategy,
} from "./walletLinkAttemptState"

type LinkWalletOptions = {
  primary: boolean
}

export const usePrivyLinkWallet = (userId: string) => {
  const { invalidate: invalidateUser } = useUser({ id: userId, enabled: false })
  const handlePrivyError = useHandlePrivyErrors()
  const { track } = useAnalytics()

  const finishWalletLinkAttempt = async (
    attempt: WalletLinkAttempt,
    outcome: "wallet_link_succeeded" | "wallet_link_failed",
    details?: Record<string, unknown>,
  ) => {
    addMiradorEvent(attempt.trace, outcome, {
      strategy: attempt.strategy,
      primary: attempt.strategy === "primary",
      ...details,
    })
    await closeMiradorTrace(
      attempt.trace,
      outcome === "wallet_link_succeeded"
        ? "Wallet link succeeded"
        : "Wallet link failed",
    )
    clearActiveWalletLinkAttempt(attempt)
  }

  const startWalletLinkAttempt = (strategy: WalletLinkStrategy) => {
    const primary = strategy === "primary"
    const trace = startMiradorTrace({
      name: "WalletLink",
      flow: MIRADOR_FLOW.walletLink,
      context: {
        userId,
        source: "frontend",
        step: "link_started",
      },
      attributes: {
        primary,
        strategy,
      },
      tags: ["wallet", "link"],
    })

    addMiradorEvent(trace, "wallet_link_started", { primary, strategy })

    return beginWalletLinkAttempt(strategy, trace)
  }

  const runWalletLinkSuccessFlow = async (
    attempt: WalletLinkAttempt,
    updatedPrivyUser: Parameters<typeof syncCurrentPrivyUser>[0],
    walletAddress: string,
  ) => {
    addMiradorEvent(attempt.trace, "wallet_link_account_received", {
      walletAddress,
      strategy: attempt.strategy,
    })

    track("Wallet Linked", {
      userId,
      elementType: "Hook",
      elementName: "useLinkPrivyWallet",
    })

    try {
      await syncCurrentPrivyUser(updatedPrivyUser)

      if (attempt.strategy === "primary") {
        const traceContext = buildFrontendTraceContext(attempt.trace, {
          flow: MIRADOR_FLOW.walletLink,
          step: "wallet_link_primary_address_submit",
          userId,
          walletAddress,
          sessionId: userId,
        })

        await makeUserAddressPrimaryAction(walletAddress, traceContext)
      }

      await invalidateUser()

      await finishWalletLinkAttempt(attempt, "wallet_link_succeeded", {
        walletAddress,
      })
    } catch (error) {
      await finishWalletLinkAttempt(attempt, "wallet_link_failed", {
        walletAddress,
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  const onLinkError = (errorCode: string) => {
    const attempt = takeActiveWalletLinkAttempt()
    if (!attempt) {
      return
    }

    void finishWalletLinkAttempt(attempt, "wallet_link_failed", {
      errorCode,
      userMessage: getPrivyErrorMessage(errorCode),
    })
    handlePrivyError(errorCode)
  }

  const { linkWallet: triggerLinkWallet } = useLinkAccount({
    onSuccess: ({ user: updatedPrivyUser, linkedAccount }) => {
      const attempt = takeActiveWalletLinkAttempt()
      if (!attempt || linkedAccount.type !== "wallet") {
        return
      }

      toast.promise(
        runWalletLinkSuccessFlow(
          attempt,
          updatedPrivyUser,
          linkedAccount.address,
        ),
        {
          loading: "Adding wallet address...",
          success: "Wallet address added successfully",
          error: "Failed to add wallet address",
        },
      )
    },
    onError: onLinkError,
  })

  const linkWallet = ({ primary }: LinkWalletOptions = { primary: false }) => {
    if (hasActiveWalletLinkAttempt()) {
      return
    }

    const attempt = startWalletLinkAttempt(primary ? "primary" : "standard")

    try {
      triggerLinkWallet()
    } catch (error) {
      clearActiveWalletLinkAttempt(attempt)
      void finishWalletLinkAttempt(attempt, "wallet_link_failed", {
        errorMessage: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }

  return {
    linkWallet,
  }
}
